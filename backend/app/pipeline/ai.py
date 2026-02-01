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
MCP_BASE_URL = "http://127.0.0.1:8000"


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
            f"You are an Elite BIM QA Manager validating the IFC file at:\n{self.file_path}\n\n"
            "SYSTEM GOAL: Identify rule violations within the IFC model using provided MCP tools.\n\n"
            "OPERATIONAL RULES:\n"
            f"1. Always pass file_path=\"{self.file_path}\" to all tool calls.\n"
            "2. For every violation, you MUST provide: rule_id, ifc_guid, element_type, severity, and why_it_matters.\n"
            "3. Cite exact GlobalIds (ifc_guid) found in the model.\n"
            "4. RESPONSE FORMAT: You MUST return your final findings as a JSON list of objects.\n\n"
            "JSON STRUCTURE:\n"
            "[\n"
            "  {\n"
            "    \"rule_id\": \"RULE_001\",\n"
            "    \"ifc_guid\": \"GlobalId_String\",\n"
            "    \"element_type\": \"IfcWall\",\n"
            "    \"severity\": \"MAJOR\",\n"
            "    \"why_it_matters\": \"Explanation of impact...\"\n"
            "  }\n"
            "]"
        )
        user_prompt = (
            "INSPECTION REQUIREMENTS:\n"
            f"{requirements_text}\n\n"
            "Step 1: Use tools to inspect the model for these specific requirements.\n"
            "Step 2: Consolidate all findings.\n"
            "Step 3: Return the JSON list of violations. If no violations are found, return an empty list []."
        )

        messages = [
            ("system", system_prompt),
            ("human", user_prompt),
        ]

        try:
            state = await graph.ainvoke({"messages": messages})
            return self._parse_issues_from_response(state, custom_rules)
        except Exception as e:
            print(f"AI Agent Scan Error: {e}")
            return []

    def _parse_issues_from_response(
        self,
        state: dict,
        rules: List,
    ) -> List[MissingProperty]:
        """Extract MissingProperty objects from agent response using JSON parsing with fuzzy fallback."""
        import json
        import re
        from app.pipeline.models import IssueType

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

        # Phase 1: Try strict JSON extraction from potential code blocks
        json_data = []
        try:
            # Look for JSON in code blocks first
            json_match = re.search(r"```json\s*(.*?)\s*```", content, re.DOTALL)
            if not json_match:
                # Fallback to look for [ ... ] pattern
                json_match = re.search(r"(\[.*\])", content, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1).strip()
                json_data = json.loads(json_str)
            else:
                # Last resort: try to parse the whole content as JSON
                json_data = json.loads(content)
        except (json.JSONDecodeError, ValueError):
            # Phase 2: Fuzzy fallback to line-based parsing if JSON fails
            print("Fuzzy parsing AI response (JSON failed)")
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
                
                guid = current.get("ifc_guid") or current.get("globalid")
                if current.get("rule_id") and guid and current.get("rule_id") in rule_map:
                    rule = rule_map[current["rule_id"]]
                    issues.append(
                        MissingProperty(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            ifc_guid=guid,
                            element_type=current.get("element_type", "Unknown"),
                            severity=self._parse_severity(current.get("severity", "MAJOR")),
                            issue_type=IssueType.UNKNOWN,
                            why_it_matters=current.get("why_it_matters") or rule.description,
                            confidence=0.7,
                        )
                    )
                    current = {}
            return issues

        # Convert JSON objects to MissingProperty
        if isinstance(json_data, list):
            for item in json_data:
                if not isinstance(item, dict): continue
                
                rid = item.get("rule_id")
                guid = item.get("ifc_guid")
                
                if rid and guid and rid in rule_map:
                    rule = rule_map[rid]
                    issues.append(
                        MissingProperty(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            ifc_guid=guid,
                            element_type=item.get("element_type", "Unknown"),
                            severity=self._parse_severity(item.get("severity", "MAJOR")),
                            issue_type=IssueType.UNKNOWN,
                            why_it_matters=item.get("why_it_matters") or rule.description,
                            confidence=0.9,
                        )
                    )

        return issues

    def _parse_severity(self, s: str):
        """Parse severity string to Severity enum."""
        from app.pipeline.models import Severity

        u = str(s).upper()
        for sev in Severity:
            if sev.value == u:
                return sev
        return Severity.MAJOR
