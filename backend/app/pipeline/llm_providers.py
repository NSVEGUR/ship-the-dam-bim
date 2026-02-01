"""
LLM Provider abstraction layer.

Supports Gemini (default), MiniMax M2.1, and OpenAI.
Manus is handled separately in manus_synthesis.py for holistic analysis.
"""

import os
import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Literal

from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    async def ainvoke(self, messages: List[BaseMessage]) -> str:
        """Invoke the LLM with messages and return response text."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is configured and available."""
        pass


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider (default)."""
    
    def __init__(self):
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        api_key = os.getenv("GOOGLE_API_KEY")
        self._available = bool(api_key)
        if self._available:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro-latest",
                temperature=0,
                google_api_key=api_key,
            )
        else:
            self.llm = None
    
    async def ainvoke(self, messages: List[BaseMessage]) -> str:
        if not self.llm:
            raise RuntimeError("Gemini provider not configured")
        resp = await self.llm.ainvoke(messages)
        return resp.content if hasattr(resp, "content") else str(resp)
    
    def is_available(self) -> bool:
        return self._available


class MiniMaxProvider(LLMProvider):
    """
    MiniMax M2.1 LLM provider via Anthropic-compatible API.
    
    Requires:
    - MINIMAX_API_KEY
    - MINIMAX_BASE_URL (default: https://api.minimax.chat/v1)
    """
    
    def __init__(self):
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.base_url = os.getenv("MINIMAX_BASE_URL", "https://api.minimax.chat/v1")
        self._available = bool(self.api_key)
    
    async def ainvoke(self, messages: List[BaseMessage]) -> str:
        if not self._available:
            raise RuntimeError("MiniMax provider not configured")
        
        # Convert LangChain messages to Anthropic/MiniMax format
        formatted_messages = []
        system_content = ""
        
        for msg in messages:
            if isinstance(msg, SystemMessage):
                system_content = msg.content
            elif isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            else:
                formatted_messages.append({"role": "assistant", "content": msg.content})
        
        # MiniMax uses Anthropic-compatible API
        payload = {
            "model": "MiniMax-M2.1",
            "max_tokens": 4096,
            "messages": formatted_messages,
        }
        if system_content:
            payload["system"] = system_content
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            
            # Extract text from Anthropic-style response
            content = data.get("content", [])
            if content and isinstance(content, list):
                return content[0].get("text", "")
            return str(data)
    
    def is_available(self) -> bool:
        return self._available


class OpenAIProvider(LLMProvider):
    """
    OpenAI GPT provider.
    
    Requires:
    - OPENAI_API_KEY
    - OPENAI_MODEL (default: gpt-4o)
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self._available = bool(self.api_key)
    
    async def ainvoke(self, messages: List[BaseMessage]) -> str:
        if not self._available:
            raise RuntimeError("OpenAI provider not configured")
        
        # Convert LangChain messages to OpenAI format
        formatted_messages = []
        for msg in messages:
            if isinstance(msg, SystemMessage):
                formatted_messages.append({"role": "system", "content": msg.content})
            elif isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            else:
                formatted_messages.append({"role": "assistant", "content": msg.content})
        
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "temperature": 0,
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
            return str(data)
    
    def is_available(self) -> bool:
        return self._available


# Type alias for LLM choices
LLMChoice = Literal["gemini", "minimax", "openai"]


def get_llm_provider(llm_choice: LLMChoice = "gemini") -> LLMProvider:
    """
    Factory function to get the appropriate LLM provider.
    
    Args:
        llm_choice: Which LLM to use ("gemini", "minimax", "openai")
    
    Returns:
        LLMProvider instance
    
    Raises:
        RuntimeError: If selected provider is not configured
    """
    providers = {
        "gemini": (GeminiProvider, "GOOGLE_API_KEY"),
        "minimax": (MiniMaxProvider, "MINIMAX_API_KEY"),
        "openai": (OpenAIProvider, "OPENAI_API_KEY"),
    }
    
    if llm_choice not in providers:
        raise ValueError(f"Unknown LLM choice: {llm_choice}. Valid: {list(providers.keys())}")
    
    provider_class, env_var = providers[llm_choice]
    provider = provider_class()
    
    if not provider.is_available():
        raise RuntimeError(f"{llm_choice.title()} provider requested but {env_var} not set")
    
    return provider
