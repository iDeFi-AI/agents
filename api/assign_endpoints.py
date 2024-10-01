import importlib

def assign_agent_endpoints(agent_name, endpoints):
    """
    Dynamically assigns custom endpoints to a specific agent.
    
    Parameters:
    - agent_name (str): The name of the agent (e.g., "Agent1", "QAgent1").
    - endpoints (dict): A dictionary of endpoint assignments (e.g., {"metric": "/api/v1/metrics"}).
    
    Returns:
    - dict: Success or error message.
    """
    try:
        # Dynamically import the correct agent module
        agent_module = importlib.import_module(f'agents.ai_agents.{agent_name.lower()}') if 'QAgent' not in agent_name else importlib.import_module(f'agents.ai_q_agents.{agent_name.lower()}')
        
        # Retrieve the agent class
        agent = getattr(agent_module, agent_name)
        
        # Assign the custom endpoints
        agent.custom_endpoints = endpoints

        return {"message": f"Endpoints successfully assigned to {agent_name}", "endpoints": endpoints}
    
    except ModuleNotFoundError:
        return {"error": f"Agent module for {agent_name} not found."}
    
    except AttributeError:
        return {"error": f"Agent {agent_name} not found in the module."}
    
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}
