import httpx
import re
from django.conf import settings

class OllamaClient:
    def __init__(self):
        self.base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.model = getattr(settings, 'OLLAMA_MODEL', 'qwen3.5:4b')

    async def generate(self, prompt: str, system: str = None) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
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

ollama_client = OllamaClient()
