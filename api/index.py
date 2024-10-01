import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests
import base64
import json
from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from api.create_agent import create_new_agent
from api.nfa_image import generate_nft_image
from uagents import Agent, Context
import threading
from firebase_admin import credentials, initialize_app, firestore
from flask_cors import CORS
import csv

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://q.idefi.ai", "https://api.idefi.ai"]}})


# Etherscan API Key (ensure to set this as an environment variable)
ETHERSCAN_API_KEY = os.getenv("NEXT_PUBLIC_ETHERSCAN_API_KEY")

# Firebase setup
firebase_service_account_key_base64 = os.getenv('NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY')
if not firebase_service_account_key_base64:
    raise ValueError("Missing Firebase service account key environment variable")

firebase_service_account_key_bytes = base64.b64decode(firebase_service_account_key_base64)
firebase_service_account_key_str = firebase_service_account_key_bytes.decode('utf-8')

try:
    firebase_service_account_key_dict = json.loads(firebase_service_account_key_str)
    cred = credentials.Certificate(firebase_service_account_key_dict)
    firebase_app = initialize_app(cred, {
        'databaseURL': 'https://api-idefi-ai-default-rtdb.firebaseio.com/',
        'storageBucket': 'api-idefi-ai.appspot.com'
    })
except json.JSONDecodeError as e:
    raise ValueError(f"JSON Decode Error: {e}")
except Exception as e:
    raise ValueError(f"Firebase Initialization Error: {e}")

db = firestore.client(firebase_app)

# Dictionary to store agents
agent_instances = {
    "Free": {},
    "Standard": {},
    "Smart": {},
    "Quantum": {}
}

# Tracking dictionary to keep count of agents created by role
agent_tracking = {
    "Miner": 0,
    "Builder": 0,
    "Defender": 0,
    "Scout": 0,
    "Healer": 0,
    "multi_role_agents": 0,
    "total_agents": 0
}

# Define base URL for api.idefi.ai
API_BASE_URL = "https://api.idefi.ai/api"

UPLOAD_FOLDER = '/tmp'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max file size


# Helper function to call Etherscan API
def call_etherscan(endpoint, params):
    try:
        base_url = "https://api.etherscan.io/api"
        params["apikey"] = ETHERSCAN_API_KEY
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e)}


# Helper function to check if the Ethereum address is valid and an EOA
def is_valid_eoa(address):
    if not address or len(address) != 42 or not address.startswith("0x"):
        return {"error": "Invalid Ethereum address format"}

    params = {
        "module": "account",
        "action": "txlist",
        "address": address,
        "startblock": 0,
        "endblock": 99999999,
        "page": 1,
        "offset": 1,
        "sort": "asc"
    }

    result = call_etherscan("getcode", params)
    if 'error' in result:
        return result

    if result.get("result", "") != "0x":
        return {"error": "Address is a smart contract, not an EOA"}

    return {"success": True}


# Helper function to send email notification via Firestore-triggered Firebase function
def send_email_notification(to_email, subject, body_html):
    mail_ref = db.collection('mail').document()
    mail_ref.set({
        'to': to_email,
        'message': {
            'subject': subject,
            'html': body_html
        }
    })


# Endpoint to create a new agent and mint its corresponding NFT image
@app.route('/api/agents_create', methods=['POST'])
def create_agent():
    data = request.get_json()
    agent_name = data.get('agent_name')
    agent_type = data.get('agent_type')
    agent_role = data.get('agent_role')
    wallet_address = data.get('wallet_address')
    user_email = data.get('user_email')  # Get the user's email address for notifications

    # Validate input
    if not agent_name:
        return jsonify({"error": "Agent name is required"}), 400
    if not agent_type:
        return jsonify({"error": "Agent type is required"}), 400
    if not agent_role:
        return jsonify({"error": "Agent role is required"}), 400

    # Validate and check Ethereum address
    eoa_check = is_valid_eoa(wallet_address)
    if 'error' in eoa_check:
        return jsonify({"error": eoa_check['error']}), 400

    # Create the agent using the function from create_agent.py
    result = create_new_agent(agent_type, agent_role)

    if 'error' in result:
        return jsonify(result), 400

    # Generate the NFT image for the agent role
    nft_image = generate_nft_image(agent_role)
    if 'error' in nft_image:
        return jsonify({"error": nft_image['error']}), 400

    result["nft_image"] = nft_image["image_url"]

    # Update agent tracking statistics
    agent_tracking[agent_role] += 1
    agent_tracking["total_agents"] += 1

    # Send an email notification about the newly created agent
    if user_email:
        send_email_notification(
            to_email=user_email,
            subject=f"Your {agent_role} Agent '{agent_name}' has been created!",
            body_html=f"<p>Your {agent_role} agent has been successfully created. It is now ready for task assignment and operations.</p><p>Wallet Address: {wallet_address}</p>"
        )

    # Initialize and start the new agent using uAgents
    if agent_name:
        if agent_type == 'Free':
            agent = FreeAgent(agent_name)
        elif agent_type == 'Standard':
            agent = StandardAgent(agent_name)
        elif agent_type == 'Smart':
            agent = SmartAgent(agent_name)
        elif agent_type == 'Quantum':
            agent = QuantumAgent(agent_name)
        else:
            return jsonify({"error": "Invalid agent type"}), 400

        agent_instances[agent_type][agent_name] = agent
        threading.Thread(target=agent.run).start()

        return jsonify(result), 201
    else:
        return jsonify(result), 400


# Assign tasks to a specific agent
@app.route('/api/agents_assign', methods=['POST'])
def assign_tasks():
    data = request.get_json()
    agent_type = data.get('agent_type')
    agent_name = data.get('agent_name')
    task_data = data.get('tasks')

    if agent_name not in agent_instances.get(agent_type, {}):
        return jsonify({"error": "Agent not found"}), 404

    agent = agent_instances[agent_type][agent_name]
    context = Context(agent)

    result = context.send(agent_name, task_data)
    return jsonify({"message": f"Tasks assigned to {agent_name}", "result": result}), 200


# Get status of a specific agent or all agents
@app.route('/api/agents_status', methods=['GET'])
def get_all_agent_status():
    agent_type = request.args.get('agent_type', None)
    agent_name = request.args.get('agent_name', None)

    if agent_name:
        if agent_type not in agent_instances or agent_name not in agent_instances[agent_type]:
            return jsonify({"error": "Agent not found"}), 404

        agent = agent_instances[agent_type][agent_name]
        status = agent.get_status()
        return jsonify({"status": status})

    # Otherwise, return statuses for all agents
    all_statuses = {}
    for a_type, agents in agent_instances.items():
        all_statuses[a_type] = {name: agent.get_status() for name, agent in agents.items()}

    return jsonify(all_statuses)


# Endpoint to sync wallet or file data for agent processing
@app.route('/api/agents_sync', methods=['POST'])
def sync_data():
    agent_name = request.form.get('agent_name')
    uploaded_file = request.files.get('file')
    task = request.form.get('task', 'process_wallet_addresses')

    if not agent_name:
        return jsonify({"error": "Agent name is required"}), 400

    agent = agent_instances.get(agent_name)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    wallet_addresses = []

    if uploaded_file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(uploaded_file.filename))
        uploaded_file.save(file_path)

        if uploaded_file.filename.endswith('.csv'):
            with open(file_path, 'r') as f:
                reader = csv.reader(f)
                wallet_addresses = [row[0] for row in reader if row]

    context = Context(agent)
    context.send(agent_name, {"task": task, "data": wallet_addresses})

    return jsonify({"message": f"Data synced to agent {agent_name}", "addresses": wallet_addresses}), 200


# Endpoint for agents to perform the security check
@app.route('/api/agents_security_check', methods=['POST'])
def security_check_task():
    data = request.get_json()
    agent_name = data.get('agent_name')
    address = data.get('address')

    if not agent_name or not address:
        return jsonify({"error": "Agent name and address are required"}), 400

    eoa_check = is_valid_eoa(address)
    if 'error' in eoa_check:
        return jsonify({"error": eoa_check['error']}), 400

    if agent_name not in agent_instances.get("Smart", {}):
        return jsonify({"error": "Agent not found"}), 404

    agent = agent_instances["Smart"][agent_name]
    context = Context(agent)

    check_result = send_idefi_request('checkaddress', params={'address': address})
    if 'error' in check_result:
        return jsonify({"error": check_result['error']}), 500

    return jsonify({"message": f"Security check performed by {agent_name}", "result": check_result})


# Sync endpoint to sync agents with wallet or file data
@app.route('/api/agents_sync_wallet', methods=['POST'])
def sync_agent_wallet():
    data = request.get_json()
    agent_name = data.get('agent_name')
    address = data.get('wallet_address')

    if not agent_name or not address:
        return jsonify({"error": "Agent name and wallet address are required"}), 400

    eoa_check = is_valid_eoa(address)
    if 'error' in eoa_check:
        return jsonify({"error": eoa_check['error']}), 400

    agent = agent_instances.get(agent_name)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    context = Context(agent)
    context.send(agent_name, {"task": "sync_wallet", "wallet_address": address})

    return jsonify({"message": f"Wallet {address} synced with agent {agent_name}"}), 200


# Get agent tracking stats
@app.route('/api/agents_tracking', methods=['GET'])
def get_agent_tracking():
    return jsonify(agent_tracking)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5328)
