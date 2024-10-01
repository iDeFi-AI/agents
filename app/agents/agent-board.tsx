import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faHammer,
  faShieldAlt,
  faSearchDollar,
  faUserMd,
  faCheckCircle,
  faTimesCircle,
  faQuestionCircle,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Define types for agent roles
type AgentRole = 'Miner' | 'Builder' | 'Defender' | 'Scout' | 'Healer';

// Define icons for agent roles
const roleIcons: Record<AgentRole, any> = {
  Miner: faBolt,  // You can replace this with a specific mining icon if available
  Builder: faHammer,
  Defender: faShieldAlt,
  Scout: faSearchDollar,
  Healer: faUserMd,
};

const AgentBoard: React.FC = () => {
  const [agents, setAgents] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false); // For manual refresh
  const [agentStats, setAgentStats] = useState<any>(null); // To track role counts

  useEffect(() => {
    fetchAgents();
    fetchAgentStats(); // Fetch the stats for roles
  }, []);

  // Function to fetch agent statuses using fetch API
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents_status'); // Updated to match the new endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch agent status.');
      }
      const data = await response.json();
      setAgents(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch agent status.');
      setLoading(false);
    }
  };

  // Fetch agent generation tracking (counts for roles and total agents)
  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agents_tracking'); // Updated to match the new endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch agent tracking stats.');
      }
      const data = await response.json();
      setAgentStats(data);
    } catch (error) {
      console.error('Error fetching agent tracking stats:', error);
    }
  };

  // Function to trigger an agent task manually using fetch API
  const triggerAgentTask = async (agentName: string) => {
    try {
      const response = await fetch('/api/agents_assign', {  // Updated to match the new endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_name: agentName }),
      });

      if (response.ok) {
        alert(`Task triggered for ${agentName}`);
        fetchAgents(); // Fetch updated agent status after triggering
      } else {
        alert('Failed to trigger task.');
      }
    } catch (error) {
      alert(`Failed to trigger task for ${agentName}`);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAgents();
    setRefreshing(false);
  };

  // Display loading, error, or the agent list
  if (loading) {
    return <p className="text-center text-xl font-semibold">Loading agents...</p>;
  }

  if (error) {
    return <p className="text-center text-xl text-red-600">{error}</p>;
  }

  // If there are no agents created or tracked, show a placeholder
  const renderNoAgentsPlaceholder = () => (
    <div className="text-center text-gray-500 mt-10">
      <p className="text-xl font-semibold">No agents found</p>
      <p>Create a new agent to get started or check agent statuses.</p>
      <button
        className="mt-4 py-2 px-4 bg-neorange text-white rounded hover:bg-orange-600"
        onClick={handleRefresh}
      >
        Refresh
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header and Refresh Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Agent Dashboard</h2>
        <button
          onClick={handleRefresh}
          className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} className="mr-2" />
          {refreshing ? 'Refreshing...' : 'Refresh Agents'}
        </button>
      </div>

      {/* Agent Tracking Stats (if available) */}
      {agentStats && (
        <div className="bg-gray-100 p-4 mb-6 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-4">Agent Generation Stats</h3>
          <ul className="grid grid-cols-2 gap-4">
            <li>
              Total Agents Generated:{' '}
              <Tippy content="Total number of agents created so far.">
                <strong>{agentStats.total_agents}</strong>
              </Tippy>
            </li>
            <li>
              Miners:{' '}
              <Tippy content="Number of agents created with the Miner role.">
                <strong>{agentStats.roles?.Miner || 0}</strong>
              </Tippy>
            </li>
            <li>
              Builders:{' '}
              <Tippy content="Number of agents created with the Builder role.">
                <strong>{agentStats.roles?.Builder || 0}</strong>
              </Tippy>
            </li>
            <li>
              Defenders:{' '}
              <Tippy content="Number of agents created with the Defender role.">
                <strong>{agentStats.roles?.Defender || 0}</strong>
              </Tippy>
            </li>
            <li>
              Scouts:{' '}
              <Tippy content="Number of agents created with the Scout role.">
                <strong>{agentStats.roles?.Scout || 0}</strong>
              </Tippy>
            </li>
            <li>
              Healers:{' '}
              <Tippy content="Number of agents created with the Healer role.">
                <strong>{agentStats.roles?.Healer || 0}</strong>
              </Tippy>
            </li>
            <li>
              Multi-Role Agents:{' '}
              <Tippy content="Agents assigned multiple roles.">
                <strong>{agentStats.multi_role_agents || 0}</strong>
              </Tippy>
            </li>
          </ul>
        </div>
      )}

      {/* If no agents exist, show placeholder */}
      {Object.keys(agents).length === 0 ? (
        renderNoAgentsPlaceholder()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.keys(agents).map((agentKey) => {
            const agent = agents[agentKey];
            const isTaskCompleted = agent.status === 'Task Completed';
            const agentRole: AgentRole = agent.role;  // Assuming 'role' is returned by the API (Miner, Builder, etc.)

            // Get the corresponding icon for the agent role
            const agentIcon = roleIcons[agentRole];
            const agentStatusColor = isTaskCompleted ? 'text-green-500' : 'text-red-500';

            return (
              <div
                key={agentKey}
                className="flex flex-col items-center text-center border p-6 rounded-lg shadow-md bg-white relative"
              >
                {/* Agent Icon */}
                <FontAwesomeIcon
                  icon={agentIcon}
                  className={`text-5xl mb-4 ${isTaskCompleted ? 'text-neorange' : 'text-gray-400'}`}
                />

                {/* Agent Name */}
                <h3 className="text-lg font-semibold text-gray-800">{agentKey}</h3>
                <p className="text-gray-500 mb-4">Role: {agentRole}</p>
                <p className="text-gray-500 mb-4">Status: {agent.status}</p>

                {/* Tooltip for showing results */}
                <Tippy
                  content={agent.result ? `Last result: ${JSON.stringify(agent.result)}` : 'No result available'}
                  placement="top"
                  theme="light"
                >
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className="text-gray-500 absolute top-4 right-4 cursor-pointer"
                  />
                </Tippy>

                {/* Task Status */}
                <div className="mt-4 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={isTaskCompleted ? faCheckCircle : faTimesCircle}
                    className={`${agentStatusColor} text-3xl mr-2`}
                  />
                  <p className="text-gray-600">{isTaskCompleted ? 'Task Completed' : 'Running...'}</p>
                </div>

                {/* Trigger Agent Button */}
                <button
                  className="py-2 px-4 bg-neorange text-white rounded mt-6 hover:bg-orange-600 w-full"
                  onClick={() => triggerAgentTask(agentKey)}
                >
                  Trigger Task
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentBoard;
