import httpx
import re
from django.conf import settings

class LLMClient:
    def __init__(self):
        self.ollama_base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.ollama_model = getattr(settings, 'OLLAMA_MODEL', 'qwen3.5:4b')

    async def generate(self, prompt: str, system: str = None, provider: str = "ollama", api_key: str = "", model: str = "") -> str:
        provider = (provider or "ollama").lower()
        if provider == "openai":
            return await self._generate_openai(prompt, system, api_key, model)
        else:
            return await self._generate_ollama(prompt, system)

    async def _generate_ollama(self, prompt: str, system: str = None) -> str:
        url = f"{self.ollama_base_url}/api/generate"
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
            "think": False
        }

        # Set system instructions to discourage reasoning model thinking
        if system:
            payload["system"] = system
        else:
            payload["system"] = "You are a highly direct, concise study assistant. Do NOT think, do NOT reason, do NOT use <think> tags, and do NOT show your chain of thought. Answer the question directly and immediately with no preamble."

        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise RuntimeError(f"Ollama request failed: {response.text}")

        data = response.json()
        raw_response = data.get("response", "").strip()
        
        # Clean up UI: Strip `<think>...</think>` blocks if they are still generated
        clean_response = re.sub(r'<think>[\s\S]*?</think>', '', raw_response).strip()
        return clean_response

    async def _generate_openai(self, prompt: str, system: str = None, api_key: str = "", model: str = "") -> str:
        if not api_key:
            raise RuntimeError("OpenAI API key is required when provider is 'openai'. Please set it in Settings.")
            
        url = "https://api.openai.com/v1/chat/completions"
        openai_model = model if model else "gpt-4o-mini"
        
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        else:
            messages.append({"role": "system", "content": "You are a highly direct, concise study assistant. Answer the question directly and immediately with no preamble."})
            
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": openai_model,
            "messages": messages,
            "temperature": 0.7
        }
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
        if response.status_code != 200:
            raise RuntimeError(f"OpenAI request failed: {response.text}")
            
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

llm_client = LLMClient()
