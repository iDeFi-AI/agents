from uagents import Agent
from openai import OpenAI

client = OpenAI()

class SmartAgent(Agent):
    def __init__(self, name):
        super().__init__(name)

    @Agent.listen
    async def perform_task(self, payload):
        try:
            # Smart agent can execute advanced tasks, like interacting with blockchain or smart contracts
            result = await self.call_advanced_task(payload["endpoint"], payload["data"])
            return result
        except Exception as e:
            return {"error": str(e)}

    @Agent.listen
    async def interact_with_openai(self, prompt):
        try:
            # Smart Agents use GPT-4o-mini for task automation and advanced analysis
            response = client.completions.create(engine="gpt-4o-mini",
            prompt=prompt,
            max_tokens=150)
            return response.choices[0].text.strip()
        except Exception as e:
            return str(e)

    async def call_advanced_task(self, endpoint, data):
        # Simulate advanced tasks like API interactions for smart contracts or similar tasks
        return {"message": f"
