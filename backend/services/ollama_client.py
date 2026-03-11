import httpx
from backend.config.settings import settings


class OllamaClient:
    """
    Handles communication with the local Ollama LLM runtime.
    """

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    async def generate(self, prompt: str) -> str:
        """
        Send prompt to Ollama and return generated text.
        """

        url = f"{self.base_url}/api/generate"

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)

        if response.status_code != 200:
            raise RuntimeError(f"Ollama request failed: {response.text}")

        data = response.json()

        return data.get("response", "").strip()


# Singleton instance
ollama_client = OllamaClient()