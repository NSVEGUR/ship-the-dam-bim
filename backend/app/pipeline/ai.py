"""
AI-powered scanning using LLM + MCP (Model Context Protocol).

Connects to the IFC MCP server via streamable HTTP and uses LangGraph ReAct
agent to validate CUSTOM rules. Passes file_path in prompt so LLM can call
MCP tools (get_entities, get_entity_properties, etc.) with the correct path.
"""

import os
from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

from app.pipeline.models import MissingProperty, Profile

# MCP base URL - API and MCP run in same process, so default localhost
MCP_BASE_URL = os.getenv("MCP_BASE_URL", "http://127.0.0.1:8000")


class AIAgent:
    def __init__(self, file_path: str):
        self.file_path = os.path.abspath(file_path)
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro-latest",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )

    async def scan(self, profile: Profile) -> List[MissingProperty]:
        """Scan using LLM + MCP for CUSTOM rules. Returns list of MissingProperty."""
        custom_rules = [r for r in profile.rules if r.check_type == "CUSTOM"]
        if not custom_rules:
            return []

        requirements_text = "Check the following requirements:\n"
        for rule in custom_rules:
            requirements_text += f"- Rule {rule.id} ({rule.name}): {rule.description or rule.name}\n"

        # Connect to MCP via streamable HTTP (same process as FastAPI)
        try:
            from langchain_mcp_adapters.client import MultiServerMCPClient

            client = MultiServerMCPClient(
                {
                    "ifcMCP": {
                        "url": f"{MCP_BASE_URL.rstrip('/')}/mcp",
                        "transport": "http",
                    }
                }
            )
            tools = await client.get_tools()
        except Exception:
            return []

        if not tools:
            return []

        # ReAct agent with MCP tools
        graph = create_react_agent(self.llm, tools)

        system_prompt = (
            f"You are an expert BIM Manager validating IFC file at:\n{self.file_path}\n\n"
            "Use the available MCP tools to inspect the IFC model. When calling tools, "
            f"always pass file_path=\"{self.file_path}\" (the path above).\n\n"
            "For each violation found, provide: ifc_guid (GlobalId), element_type, "
            "rule_id, severity, and a brief reason. Be specific and cite GlobalIds."
        )
        user_prompt = (
            f"{requirements_text}\n\n"
            "Inspect the IFC file using the tools and list any violations. "
            "For each issue, include: rule_id, ifc_guid, element_type, severity, "
            "and why_it_matters (brief explanation)."
        )

        messages = [
            ("system", system_prompt),
            ("human", user_prompt),
        ]

        try:
            state = await graph.ainvoke({"messages": messages})
            return self._parse_issues_from_response(state, custom_rules)
        except Exception:
            return []

    def _parse_issues_from_response(
        self,
        state: dict,
        rules: List,
    ) -> List[MissingProperty]:
        """Extract MissingProperty objects from agent response. Best-effort parsing."""
        from app.pipeline.models import IssueType, Severity

        issues: List[MissingProperty] = []
        rule_map = {r.id: r for r in rules}

        # Get last AI message content
        messages = state.get("messages", [])
        content = ""
        for m in reversed(messages):
            if hasattr(m, "content") and m.content:
                content = str(m.content)
                break

        if not content:
            return issues

        # Simple heuristic: look for patterns like "GlobalId: xxx" or "ifc_guid: xxx"
        # and "rule_id: xxx", "severity: xxx". Full parsing would need structured output.
        lines = content.split("\n")
        current = {}
        for line in lines:
            line = line.strip()
            for prefix in ("GlobalId:", "ifc_guid:", "rule_id:", "severity:", "element_type:", "why_it_matters:"):
                if line.lower().startswith(prefix.lower()):
                    key = prefix.rstrip(":").lower().replace(" ", "_")
                    val = line[len(prefix):].strip().strip("'\"")
                    current[key] = val
                    break
            if current.get("rule_id") and current.get("ifc_guid") and current.get("rule_id") in rule_map:
                rule = rule_map[current["rule_id"]]
                issues.append(
                    MissingProperty(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        ifc_guid=current.get("ifc_guid", "N/A"),
                        element_type=current.get("element_type", "Unknown"),
                        severity=self._parse_severity(current.get("severity", "MAJOR")),
                        issue_type=IssueType.UNKNOWN,
                        why_it_matters=current.get("why_it_matters") or rule.description,
                        confidence=0.8,
                    )
                )
                current = {}

        return issues

    def _parse_severity(self, s: str):
        """Parse severity string to Severity enum."""
        from app.pipeline.models import Severity

        u = str(s).upper()
        for sev in Severity:
            if sev.value == u:
                return sev
        return Severity.MAJOR
