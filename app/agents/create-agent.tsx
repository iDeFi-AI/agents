import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faAtom, faBolt, faHammer, faShieldAlt, faUserMd, faSearchDollar, faMountain, faInfoCircle } from '@fortawesome/free-solid-svg-icons'; // Import icons for roles
import Tippy from '@tippyjs/react'; // Tooltip for additional info
import 'tippy.js/dist/tippy.css'; // Required for Tippy styles

// Define valid agent roles as a union type
type AgentRole = 'Miner' | 'Builder' | 'Defender' | 'Scout' | 'Healer';

// Available tools for assignment
const availableTools = [
  { id: 'SecurityCheck', name: 'Security Check' },
  { id: 'FinancialRoadmap', name: 'Financial Roadmap' },
  { id: 'InvestmentSimulator', name: 'Investment Simulator' },
  { id: 'VisualizeWallet', name: 'Visualize Wallet' },
];

// Unavailable tools for the grid (grayed out)
const unavailableTools = [
  { id: 'StrategyOptimizer', name: 'Strategy Optimizer' },
  { id: 'StopLossAutomation', name: 'Stop Loss Automation' },
  { id: 'SmartContractBuilder', name: 'Smart Contract Builder' },
];

// Dashboard tools aligned with the selected role, matched to actual components from the dashboard
const roleTools: { [key in AgentRole]: { name: string; id: string; available: boolean }[] } = {
  Miner: [
    { name: 'Security Check', id: 'SecurityCheck', available: true },
    { name: 'Interest Rate Tracker', id: 'InvestmentSimulator', available: true },
    { name: 'Income Portfolio Builder', id: 'FinancialRoadmap', available: true },
  ],
  Builder: [
    { name: 'Smart Contract Builder', id: 'SmartContractBuilder', available: false },
    { name: 'DeFi Automation Tool', id: 'InvestmentSimulator', available: true },
    { name: 'Strategy Optimizer', id: 'StrategyOptimizer', available: false },
  ],
  Defender: [
    { name: 'Risk Monitoring Dashboard', id: 'SecurityCheck', available: true },
    { name: 'Stop Loss Automation', id: 'StopLossAutomation', available: false },
    { name: 'Asset Protection Tool', id: 'Notifications', available: false },
  ],
  Scout: [
    { name: 'Market Trend Analyzer', id: 'VisualizeWallet', available: true },
    { name: 'Opportunity Detector', id: 'FinancialRoadmap', available: true },
    { name: 'Sentiment Analyzer', id: 'QuantumCategory', available: false },
  ],
  Healer: [
    { name: 'Portfolio Rebalancer', id: 'RetirementPlanning', available: false },
    { name: 'Asset Allocation Optimizer', id: 'InvestmentSimulator', available: true },
    { name: 'Risk Mitigator', id: 'FinancialHealth', available: false },
  ],
};

const CreateAgent: React.FC = () => {
  const [agentName, setAgentName] = useState<string>('');
  const [assignedTools, setAssignedTools] = useState<string[]>([]);
  const [agentRole, setAgentRole] = useState<AgentRole | ''>(''); // Ensure agentRole is typed
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Toggle tool assignment
  const handleToolAssignment = (tool: string) => {
    setAssignedTools((prevTools) =>
      prevTools.includes(tool) ? prevTools.filter((t) => t !== tool) : [...prevTools, tool]
    );
  };

  // Determine if a role should be disabled (all tools unavailable)
  const isRoleDisabled = (role: AgentRole) => {
    return roleTools[role].every(tool => !tool.available);
  };

  // Create agent function that sends data to the backend
  const createAgent = async () => {
    if (agentName && assignedTools.length > 0 && agentRole && !isRoleDisabled(agentRole)) {
      try {
        const payload = {
          agent_name: agentName,
          agent_type: 'Beta', // Defaulting to Beta agents for this example
          agent_role: agentRole,
          assigned_tools: assignedTools,
        };

        // Send POST request to the backend to create the agent
        const response = await fetch('/api/agents_create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          setStatusMessage(`Agent "${agentName}" created successfully with tools: ${assignedTools.join(', ')}.`);
        } else {
          const errorData = await response.json();
          setStatusMessage(`Error: ${errorData.error}`);
        }
      } catch (error) {
        setStatusMessage('An error occurred while creating the agent.');
      }
    } else {
      setStatusMessage('Please provide an agent name, assign tools, and select a role.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Create Your Beta Agent</h2>

      {/* Agent creation form */}
      <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md bg-gray-100 mb-4">
        <input
          type="text"
          placeholder="Agent Name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="mb-4 p-2 border rounded"
        />

        {/* Role selection for Beta agents */}
        <div className="mb-4">
          <h4 className="mb-2">Select Role for Beta Agent:</h4>
          <div className="flex flex-wrap justify-center gap-4">
            <Tippy content="Miner: Mines resources and finds hidden assets in the blockchain.">
              <button
                onClick={() => !isRoleDisabled('Miner') && setAgentRole('Miner')}
                className={`py-2 px-4 border rounded ${agentRole === 'Miner' ? 'bg-neorange text-white' : 'bg-gray-200 text-gray-700'} ${isRoleDisabled('Miner') && 'opacity-50 cursor-not-allowed'}`}
                disabled={isRoleDisabled('Miner')}
              >
                <FontAwesomeIcon icon={faMountain} className="mr-2" /> Miner
              </button>
            </Tippy>

            <Tippy content="Builder: Constructs financial infrastructures and upgrades systems.">
              <button
                onClick={() => !isRoleDisabled('Builder') && setAgentRole('Builder')}
                className={`py-2 px-4 border rounded ${agentRole === 'Builder' ? 'bg-neorange text-white' : 'bg-gray-200 text-gray-700'} ${isRoleDisabled('Builder') && 'opacity-50 cursor-not-allowed'}`}
                disabled={isRoleDisabled('Builder')}
              >
                <FontAwesomeIcon icon={faHammer} className="mr-2" /> Builder
              </button>
            </Tippy>

            <Tippy content="Defender: Protects assets and wallets with enhanced security protocols.">
              <button
                onClick={() => !isRoleDisabled('Defender') && setAgentRole('Defender')}
                className={`py-2 px-4 border rounded ${agentRole === 'Defender' ? 'bg-neorange text-white' : 'bg-gray-200 text-gray-700'} ${isRoleDisabled('Defender') && 'opacity-50 cursor-not-allowed'}`}
                disabled={isRoleDisabled('Defender')}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="mr-2" /> Defender
              </button>
            </Tippy>

            <Tippy content="Scout: Scans for opportunities, anomalies, and threats within the market.">
              <button
                onClick={() => !isRoleDisabled('Scout') && setAgentRole('Scout')}
                className={`py-2 px-4 border rounded ${agentRole === 'Scout' ? 'bg-neorange text-white' : 'bg-gray-200 text-gray-700'} ${isRoleDisabled('Scout') && 'opacity-50 cursor-not-allowed'}`}
                disabled={isRoleDisabled('Scout')}
              >
                <FontAwesomeIcon icon={faSearchDollar} className="mr-2" /> Scout
              </button>
            </Tippy>

            <Tippy content="Healer: Fixes financial health, repairs wallet issues, and ensures balance.">
              <button
                onClick={() => !isRoleDisabled('Healer') && setAgentRole('Healer')}
                className={`py-2 px-4 border rounded ${agentRole === 'Healer' ? 'bg-neorange text-white' : 'bg-gray-200 text-gray-700'} ${isRoleDisabled('Healer') && 'opacity-50 cursor-not-allowed'}`}
                disabled={isRoleDisabled('Healer')}
              >
                <FontAwesomeIcon icon={faUserMd} className="mr-2" /> Healer
              </button>
            </Tippy>
          </div>
        </div>

        {/* Tool Assignment */}
        <div className="mb-4">
          <h4 className="mb-2">Assign Tools to {agentRole}:</h4>
          <div className="flex flex-wrap gap-4">
            {agentRole &&
              roleTools[agentRole]?.map((tool) => (
                <Tippy content={!tool.available ? "This tool is not available yet." : ''} key={tool.id}>
                  <div>
                    <button
                      onClick={() => tool.available && handleToolAssignment(tool.id)}
                      className={`py-2 px-4 border rounded ${
                        assignedTools.includes(tool.id) ? 'bg-neorange text-white' : 'bg-gray-200 text-gray-700'
                      } ${!tool.available && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!tool.available}
                    >
                      {tool.name} {!tool.available && <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />}
                    </button>
                  </div>
                </Tippy>
              ))}
          </div>
        </div>

        {/* Create Agent Button */}
        <button
          onClick={createAgent}
          className="py-2 px-4 bg-neorange text-white rounded mt-4 hover:bg-neorange-dark"
        >
          Create Agent
        </button>

        {/* Status Message */}
        {statusMessage && (
          <p className="mt-4 text-gray-700">{statusMessage}</p>
        )}
      </div>

      {/* Greyed out agent options for Agent, Smart Agent, and Quantum Agent */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Agent (Greyed Out) */}
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md bg-gray-100 opacity-50">
          <FontAwesomeIcon icon={faBolt} className="text-3xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Agent</h3>
          <p className="text-gray-500">Custom analytics and AI agent tools.</p>
          <p className="text-red-500 mt-2">Not available in Beta</p>
          <Tippy content="This agent handles basic AI tasks such as API interactions and analytics. It is not available in the beta version.">
            <span className="cursor-pointer text-blue-500 text-sm">Learn more</span>
          </Tippy>
        </div>

        {/* Smart Agent (Greyed Out) */}
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md bg-gray-100 opacity-50">
          <FontAwesomeIcon icon={faRobot} className="text-3xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Smart Agent</h3>
          <p className="text-gray-500">Enhanced analytics and smart contract AI tools.</p>
          <p className="text-red-500 mt-2">Not available in Beta</p>
          <Tippy content="This agent integrates smart contracts, automates blockchain tasks, and provides real-time insights. Not available in beta.">
            <span className="cursor-pointer text-blue-500 text-sm">Learn more</span>
          </Tippy>
        </div>

        {/* Quantum Agent (Greyed Out) */}
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md bg-gray-100 opacity-50">
          <FontAwesomeIcon icon={faAtom} className="text-3xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Quantum Agent</h3>
          <p className="text-gray-500">Advanced quantum-powered analytics and AI tools.</p>
          <p className="text-red-500 mt-2">Not available in Beta</p>
          <Tippy content="This agent uses quantum computing to optimize portfolios and perform complex calculations. Not available in beta.">
            <span className="cursor-pointer text-blue-500 text-sm">Learn more</span>
          </Tippy>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;
