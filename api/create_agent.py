import os
import shutil
import openai

# Set up OpenAI API key from environment variable
openai.api_key = os.getenv("NEXT_PUBLIC_OPENAI_API_KEY")

# Define directories for AI agents, Smart AI agents, Beta agents, and Quantum AI agents
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BETA_AGENTS_DIR = os.path.join(BASE_DIR, 'agents/beta_agents')
AI_AGENTS_DIR = os.path.join(BASE_DIR, 'agents/ai_agents')
SMART_AI_AGENTS_DIR = os.path.join(BASE_DIR, 'agents/smart_ai_agents')
AI_Q_AGENTS_DIR = os.path.join(BASE_DIR, 'agents/q_ai_agents')

# Templates for different agent types
TEMPLATE_AI_AGENT = os.path.join(AI_AGENTS_DIR, 'agent_template.py')
TEMPLATE_SMART_AGENT = os.path.join(SMART_AI_AGENTS_DIR, 'agent_template.py')
TEMPLATE_AI_Q_AGENT = os.path.join(AI_Q_AGENTS_DIR, 'agent_template_q.py')
TEMPLATE_BETA_AGENT = os.path.join(BETA_AGENTS_DIR, 'beta_agent_template.py')

# Function to generate an image using OpenAI's image generation API based on the agent type
def generate_agent_image(agent_type):
    prompt = f"A futuristic AI agent representing a '{agent_type}' role in a sleek, modern design, with a glowing pin representing their role."

    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        image_url = response['data'][0]['url']
        print(f"Generated image for {agent_type}: {image_url}")
        return image_url
    except Exception as e:
        return {"error": f"Failed to generate image: {str(e)}"}

# Function to count existing agents in a directory
def count_existing_agents(directory):
    agent_files = [f for f in os.listdir(directory) if (f.startswith('agent') or f.startswith('qagent')) and f.endswith('.py')]
    return len(agent_files)

# Function to create a new AI or Quantum AI agent
def create_new_agent(agent_type='AI', beta_role=None):
    """
    Dynamically creates a new AI, Beta, Smart, or Quantum AI agent based on the provided template.
    
    Parameters:
    - agent_type (str): 'AI', 'Smart', 'Beta', or 'Quantum' for the respective agents.
    - beta_role (str): For Beta agents, specify the role ('Miner', 'Builder', etc.).
    
    Returns:
    - dict: Success message or error message.
    """
    if agent_type == 'AI':
        directory = AI_AGENTS_DIR
        template = TEMPLATE_AI_AGENT
    elif agent_type == 'Smart':
        directory = SMART_AI_AGENTS_DIR
        template = TEMPLATE_SMART_AGENT
    elif agent_type == 'Quantum':
        directory = AI_Q_AGENTS_DIR
        template = TEMPLATE_AI_Q_AGENT
    elif agent_type == 'Beta':
        directory = BETA_AGENTS_DIR
        template = TEMPLATE_BETA_AGENT
        if beta_role not in ["Miner", "Builder", "Defender", "Scout", "Healer"]:
            return {"error": f"Invalid Beta role. Valid roles are: Miner, Builder, Defender, Scout, Healer"}
    else:
        return {"error": "Invalid agent type. Use 'AI', 'Smart', 'Beta', or 'Quantum'."}

    agent_count = count_existing_agents(directory)
    new_agent_number = agent_count + 1
    new_agent_name = f'Agent{new_agent_number}' if agent_type in ['AI', 'Beta', 'Smart'] else f'QAgent{new_agent_number}'

    # Generate the agent image using DALL·E
    image_url = generate_agent_image(beta_role or agent_type)
    if isinstance(image_url, dict) and 'error' in image_url:
        return image_url

    # Create the new agent file
    new_agent_filename = f'agent{new_agent_number}.py' if agent_type != 'Quantum' else f'qagent{new_agent_number}.py'
    new_agent_filepath = os.path.join(directory, new_agent_filename)

    try:
        if os.path.exists(template):
            shutil.copyfile(template, new_agent_filepath)

            # Read the template and replace the placeholder with the new agent name
            with open(new_agent_filepath, 'r') as file:
                agent_code = file.read()

            # Replace placeholders in the template with actual agent details
            agent_code = agent_code.replace('AGENT_NAME_PLACEHOLDER', new_agent_name)
            agent_code = agent_code.replace('AGENT_TYPE_PLACEHOLDER', agent_type)

            if agent_type == 'Beta':
                agent_code = agent_code.replace('BETA_ROLE_PLACEHOLDER', beta_role)

            # Add interaction with OpenAI GPT model in the agent code
            agent_code += f"""
# Interaction with OpenAI GPT Model
import openai

def interact_with_openai(prompt):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    try:
        response = openai.Completion.create(
            engine="gpt-4",
            prompt=prompt,
            max_tokens=100
        )
        return response.choices[0].text.strip()
    except Exception as e:
        return str(e)

# Agent's image URL for reference
agent_image_url = "{image_url}"
            """

            # Write the updated code to the new agent file
            with open(new_agent_filepath, 'w') as file:
                file.write(agent_code)

            return {"message": f"New {agent_type} agent created: {new_agent_name} -> {new_agent_filepath}", "image_url": image_url}
        else:
            return {"error": f"Template file '{template}' not found."}

    except Exception as e:
        return {"error": f"Failed to create agent: {str(e)}"}
