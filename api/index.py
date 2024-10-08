import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests
import base64
import json
from flask import Flask, jsonify, request, make_response
from werkzeug.utils import secure_filename
from api.create_agent import create_new_agent
from api.nfa_image import generate_nft_image
from uagents import Agent, Context
import threading
from firebase_admin import credentials, initialize_app, firestore, storage
from flask_cors import CORS
import csv
from io import BytesIO
import datetime
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://q.idefi.ai", "https://api.idefi.ai", "https://agents.idefi.ai", "https://idefi.ai", "https://mup-nine.vercel.app", "http://localhost:3000"]}})

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
    bucket = storage.bucket(app=firebase_app)  # Initialize Firebase Storage bucket
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

# Base URLs for external API calls
Q_IDEFI_API_URL = "https://q.idefi.ai/api"
IDEFI_API_URL = "https://api.idefi.ai/api"
INTERNAL_API_BASE = "/api"  # for internal route calls

UPLOAD_FOLDER = '/tmp'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max file size

### Helper Functions ###

# Function to send requests to q.idefi.ai/api/ paths
def send_q_idefi_request(endpoint, params):
    url = f"{Q_IDEFI_API_URL}/{endpoint}"
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e)}

# Function to send requests to api.idefi.ai/api/ paths
def send_idefi_request(endpoint, params):
    url = f"{IDEFI_API_URL}/{endpoint}"
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e)}

# Send email notification via Firestore-triggered Firebase function
def send_email_notification(to_email, subject, body_html):
    mail_ref = db.collection('mail').document()
    mail_ref.set({
        'to': to_email,
        'message': {
            'subject': subject,
            'html': body_html
        }
    })

### Endpoints ###

# Endpoint to upload and process files via Firebase Storage
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith(('.csv', '.json')):
        try:
            # Process the file
            results = []
            data = {}

            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
                for index, row in df.iterrows():
                    data[row['address']] = None  # Extract addresses

            elif file.filename.endswith('.json'):
                data = json.load(file)

            addresses = list(data.keys())
            addresses = clean_and_validate_addresses(addresses)  # Implement validation logic here

            # Send the data to the external api.idefi.ai for processing
            response = send_idefi_request('upload', data)

            if 'error' in response:
                return jsonify({'error': response['error']}), 500

            results = response.get('details', [])

            # Save results to CSV and upload to Firebase Storage
            csv_content = 'address,status,description\n'
            for result in results:
                csv_content += '{},{},{}\n'.format(result['address'], result['status'], result['description'])

            output = BytesIO()
            output.write(csv_content.encode())
            output.seek(0)
            current_date = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"results_{current_date}.csv"
            blob = bucket.blob(filename)
            blob.upload_from_file(output, content_type='text/csv')

            file_url = blob.public_url
            return jsonify({'details': results, 'file_url': file_url})

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Unsupported file type'}), 400

# Endpoint to download results from api.idefi.ai
@app.route('/api/download/<filename>', methods=['GET'])
def download_results(filename):
    try:
        # Delegate the file download request to the external api.idefi.ai
        response = send_idefi_request(f'download/{filename}', {})
        
        if 'error' in response:
            return jsonify({'error': response['error']}), 404

        # Assuming the file content comes from the API response
        file_content = response.get('file_content', '')

        # Send the file content as attachment
        response = make_response(file_content)
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'
        response.mimetype = 'text/csv'
        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to list JSON files from external API
@app.route('/api/list_json_files', methods=['GET'])
def list_json_files():
    try:
        response = send_idefi_request('list_json_files', method="GET")
        if 'error' in response:
            return jsonify({'error': response['error']}), 500
        return jsonify({'files': response.get('files', [])}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/visualize_dataset', methods=['POST'])
def visualize_dataset():
    data = request.json
    source_type = data.get('source_type')
    address = data.get('address', None)
    filename = data.get('filename', None)
    max_nodes = data.get('max_nodes', None)

    if not address and not filename:
        return jsonify({'error': 'Either an Ethereum address or a filename is required'}), 400

    try:
        if address:  # Visualize relationships for an Ethereum address
            response = send_idefi_request('visualize_address', {
                'address': address,
                'max_nodes': max_nodes
            })
            if 'error' in response:
                return jsonify({'error': response['error']}), 500
            visualization_url = response.get('visualization_url', '')
            return jsonify({'visualization_url': visualization_url})

        elif source_type == 'local':
            # Visualize from a local dataset file
            response = send_idefi_request('visualize_local', {
                'filename': filename,
                'max_nodes': max_nodes
            })
            if 'error' in response:
                return jsonify({'error': response['error']}), 500
            visualization_path = response.get('visualization_path', '')
            return send_file(visualization_path, as_attachment=True)

        else:
            return jsonify({'error': 'Invalid source type. Supported types are "address" and "local".'}), 400

    except Exception as e:
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

### New Metric Endpoints with api.idefi.ai Integration ###

# Fetch basic metrics from api.idefi.ai
@app.route('/api/basic_metrics', methods=['GET'])
def basic_metrics_endpoint():
    address = request.args.get('address')
    if not address:
        return jsonify({"error": "Ethereum address is required"}), 400

    try:
        # Make the request to api.idefi.ai for basic metrics
        params = {"address": address}
        response = send_idefi_request('basic_metrics', params)

        if 'error' in response:
            return jsonify({"error": response['error']}), 500

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch intermediate metrics from api.idefi.ai
@app.route('/api/intermediate_metrics', methods=['GET'])
def intermediate_metrics_endpoint():
    address = request.args.get('address')
    if not address:
        return jsonify({"error": "Ethereum address is required"}), 400

    try:
        # Make the request to api.idefi.ai for intermediate metrics
        params = {"address": address}
        response = send_idefi_request('intermediate_metrics', params)

        if 'error' in response:
            return jsonify({"error": response['error']}), 500

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch advanced metrics from api.idefi.ai
@app.route('/api/advanced_metrics', methods=['GET'])
def advanced_metrics_endpoint():
    address = request.args.get('address')
    if not address:
        return jsonify({"error": "Ethereum address is required"}), 400

    try:
        # Make the request to api.idefi.ai for advanced metrics
        params = {"address": address}
        response = send_idefi_request('advanced_metrics', params)

        if 'error' in response:
            return jsonify({"error": response['error']}), 500

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to generate an explanation from q.idefi.ai
@app.route('/api/generate-explanation', methods=['POST'])
def generate_explanation_endpoint():
    try:
        data = request.get_json()
        risk_scores = data.get('risk_scores')
        histogram_base64 = data.get('histogram_base64')
        circuit_base64 = data.get('circuit_base64')

        if not all([risk_scores, histogram_base64, circuit_base64]):
            return jsonify({'error': 'Missing required parameters'}), 400

        # Call q.idefi.ai for explanation generation
        params = {
            "risk_scores": risk_scores,
            "histogram_base64": histogram_base64,
            "circuit_base64": circuit_base64
        }
        response = send_q_idefi_request('generate-explanation', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to compile and run QASM files
@app.route("/api/compile-and-run", methods=["POST"])
def compile_and_run():
    data = request.json
    filename = data.get("filename")
    use_ibm_backend = data.get("use_ibm_backend", False)

    try:
        # Prepare and send request to q.idefi.ai
        params = {
            "filename": filename,
            "use_ibm_backend": use_ibm_backend
        }
        response = send_q_idefi_request('compile-and-run', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to initialize quantum memory
@app.route("/api/initialize_memory", methods=["POST"])
def api_initialize_memory():
    try:
        response = send_q_idefi_request('initialize_memory', {})
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to store state in quantum memory
@app.route("/api/store_in_memory", methods=["POST"])
def api_store_in_memory():
    data = request.json
    state = data.get("state")

    if state not in ['0', '1', '+', '-']:
        return jsonify({"error": "Invalid state. Must be one of '0', '1', '+', '-'"}), 400

    try:
        params = {"state": state}
        response = send_q_idefi_request('store_in_memory', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to retrieve state from quantum memory
@app.route("/api/retrieve_from_memory", methods=["POST"])
def api_retrieve_from_memory():
    try:
        response = send_q_idefi_request('retrieve_from_memory', {})
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint for quantum risk analysis
@app.route("/api/quantum_risk_analysis", methods=["POST"])
def quantum_risk_analysis():
    data = request.json
    portfolio = data.get("portfolio")

    if not portfolio:
        return jsonify({"error": "Portfolio data is required"}), 400

    try:
        params = {"portfolio": portfolio}
        response = send_q_idefi_request('quantum_risk_analysis', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint for portfolio optimization
@app.route("/api/portfolio_optimization", methods=["POST"])
def portfolio_optimization_endpoint():
    try:
        data = request.get_json()
        portfolio = data.get("portfolio")
        if not portfolio:
            return jsonify({"error": "Portfolio data is required"}), 400

        params = {"portfolio": portfolio}
        response = send_q_idefi_request('portfolio_optimization', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Train and predict models
@app.route("/train-qnn", methods=["POST"])
def train_quantum_model():
    data = request.json
    features = data['features']
    labels = data['labels']

    try:
        params = {"features": features, "labels": labels}
        response = send_q_idefi_request('train-qnn', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict-qnn", methods=["POST"])
def predict_quantum_model():
    data = request.json
    features = data['features']

    try:
        params = {"features": features}
        response = send_q_idefi_request('predict-qnn', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Train and predict QSVC models
@app.route("/train-qsvc", methods=["POST"])
def train_qsvc_model():
    data = request.json
    features = data['features']
    labels = data['labels']

    try:
        params = {"features": features, "labels": labels}
        response = send_q_idefi_request('train-qsvc', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict-qsvc", methods=["POST"])
def predict_qsvc_model():
    data = request.json
    features = data['features']

    try:
        params = {"features": features}
        response = send_q_idefi_request('predict-qsvc', params)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Assign tasks to an agent
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

    all_statuses = {a_type: {name: agent.get_status() for name, agent in agents.items()}
                    for a_type, agents in agent_instances.items()}

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
    result = context.send(agent_name, {"task": task, "data": wallet_addresses})

    return jsonify({"message": f"Data synced to agent {agent_name}", "addresses": wallet_addresses, "result": result}), 200

# Perform security check by an agent
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

    check_result = send_q_idefi_request('checkaddress', params={'address': address})
    if 'error' in check_result:
        return jsonify({"error": check_result['error']}), 500

    return jsonify({"message": f"Security check performed by {agent_name}", "result": check_result})

# Get agent tracking stats
@app.route('/api/agents_tracking', methods=['GET'])
def get_agent_tracking():
    return jsonify(agent_tracking)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5328)
