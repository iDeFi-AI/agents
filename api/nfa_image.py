import openai
import os
import json

# Set up OpenAI API key from environment variable
openai.api_key = os.getenv("NEXT_PUBLIC_OPENAI_API_KEY")

# Define a mapping of DeFi Agent roles to their cute, pixelated 3D prompts
agent_role_prompts = {
    "Miner": ("A cute, pixelated robot DeFi Miner agent with a small mining pick, "
              "wearing a tie, designed in a welcoming and friendly style. "
              "The robot has large, expressive eyes and a pixel-art look, with simple, blocky arms and legs. "
              "The glowing blockchain-based icon pin on the chest represents mining. "
              "The background is a pixelated high-tech world, and the Miner robot looks charming with a professional yet approachable appearance."),
    "Builder": ("A cute, pixelated robot DeFi Builder agent holding small construction tools, "
                "wearing a tie, and smiling in a welcoming manner. "
                "The robot has blocky arms and legs, large eyes, and a glowing pixel-art icon pin for construction on its chest. "
                "The robot looks fun and friendly, like a helper in a digital world. The pixelated design gives it a charming, retro feel."),
    "Defender": ("A cute, pixelated robot DeFi Defender agent, holding a tiny shield, "
                 "wearing a tie, and standing guard in a playful pose. "
                 "The robot has a glowing security icon pin on its chest and big, friendly eyes. "
                 "The body is blocky, with pixelated armor, giving off a strong but welcoming vibe. "
                 "The background shows a pixel-art world full of security symbols."),
    "Scout": ("A cute, pixelated robot DeFi Scout agent with a small magnifying glass, "
              "wearing a tie, and exploring a pixelated landscape. "
              "The Scout’s glowing icon pin represents market analysis, and the robot has large, curious eyes, "
              "and a fun, friendly design. The pixelated body gives the robot a charming look, "
              "and the background is a retro-style digital landscape."),
    "Healer": ("A cute, pixelated robot DeFi Healer agent holding tiny tools for fixing things, "
               "wearing a tie, and giving a friendly wave. "
               "The robot has a glowing healing icon pin on its chest, with big eyes and a blocky body. "
               "The Healer robot looks like a cheerful, professional helper, ready to repair digital financial assets "
               "in a pixel-art world full of balance and harmony.")
}

# File to track agent generation counts
tracking_file = 'agent_tracking.json'

# Initialize tracking if the file doesn't exist
if not os.path.exists(tracking_file):
    initial_data = {
        "total_agents": 0,
        "roles": {
            "Miner": 0,
            "Builder": 0,
            "Defender": 0,
            "Scout": 0,
            "Healer": 0
        },
        "multi_role_agents": 0
    }
    with open(tracking_file, 'w') as file:
        json.dump(initial_data, file)

# Load the tracking data
with open(tracking_file, 'r') as file:
    tracking_data = json.load(file)

def update_tracking(agent_role, has_multiple_roles=False):
    """
    Updates the tracking data for agent counts.
    """
    # Increment total agent count
    tracking_data["total_agents"] += 1
    
    # Increment specific role count
    tracking_data["roles"][agent_role] += 1
    
    # Track multi-role agents if applicable
    if has_multiple_roles:
        tracking_data["multi_role_agents"] += 1

    # Save the updated tracking data
    with open(tracking_file, 'w') as file:
        json.dump(tracking_data, file)

def generate_nft_image(agent_role):
    """
    Generates an NFT image for a DeFi Agent based on its role using OpenAI's DALL·E.
    
    Parameters:
    - agent_role (str): The role of the DeFi agent (e.g., 'Miner', 'Builder', 'Defender', 'Scout', 'Healer').
    
    Returns:
    - dict: URL of the generated image, or an error message if something goes wrong.
    """
    # Check if the role is valid
    if agent_role not in agent_role_prompts:
        return {"error": "Invalid agent role. Valid roles are: Miner, Builder, Defender, Scout, Healer."}

    # Fetch the prompt based on the agent role
    base_prompt = agent_role_prompts[agent_role]

    # Generate prompt for a consistent look across all agents
    prompt = (f"{base_prompt} The agent has a glowing pixel-art pin on their chest representing their role in decentralized finance. "
              "The overall aesthetic is cute, pixelated, and welcoming, with the agent designed to appeal to a wide audience in the decentralized finance space.")

    try:
        # Generate the image using OpenAI's DALL·E
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024"  # Consistent 3D look
        )
        # Get the image URL from the response
        image_url = response['data'][0]['url']
        print(f"Generated image for {agent_role}: {image_url}")

        # Update the tracking data for the generated agent
        update_tracking(agent_role)
        
        return {"message": f"Generated image for {agent_role}: {image_url}", "image_url": image_url}

    except Exception as e:
        return {"error": f"Failed to generate image: {str(e)}"}

if __name__ == "__main__":
    # Example: Generate an image for a Miner agent
    agent_role = input("Enter the DeFi Agent role (Miner, Builder, Defender, Scout, Healer): ")
    result = generate_nft_image(agent_role)

    if 'image_url' in result:
        print(f"Success! Image URL: {result['image_url']}")
        print(f"Total agents generated: {tracking_data['total_agents']}")
        print(f"Agents per role: {tracking_data['roles']}")
    else:
        print(f"Error: {result['error']}")
