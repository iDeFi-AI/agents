from uagents import Agent
from openai import OpenAI

client = OpenAI()

class StandardAgent(Agent):
    def __init__(self, name):
        super().__init__(name)

    @Agent.listen
    async def perform_task(self, payload):
        try:
            # Standard agent performs more complex tasks compared to Free agents
            result = await self.standard_task(payload["data"])
            return result
        except Exception as e:
            return {"error": str(e)}

    @Agent.listen
    async def interact_with_openai(self, prompt):
        try:
            # Enhanced interaction with OpenAI for Standard Agents
            response = client.completions.create(engine="gpt-4o-mini",
            prompt=prompt,
            max_tokens=100)
            return response.choices[0].text.strip()
        except Exception as e:
            return str(e)

    async def standard_task(self, data):
        # Logic for more complex tasks, like data processing or handling advanced interactions
        return {"message": f"Performed a standard task with data: {data}"}
