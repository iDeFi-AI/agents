import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPauseCircle, faStopCircle, faSpinner, faRobot, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const AgentManager: React.FC = () => {
  const [agentName, setAgentName] = useState('');
  const [task, setTask] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState<string[]>([]);
  const [agentStatus, setAgentStatus] = useState('');
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false);
  const [agentsList, setAgentsList] = useState<string[]>([]); // List of agents created

  // Fetch agent status
  const fetchAgentStatus = async () => {
    try {
      const response = await fetch(`/api/agents/status?agent_name=${agentName}`);
      if (response.ok) {
        const data = await response.json();
        setAgentStatus(data.status);
        setIsTaskRunning(data.status === 'Running');
      }
    } catch (error) {
      setMessage('Failed to fetch agent status.');
    }
  };

  // Assign task to the agent
  const assignTask = async () => {
    if (!agentName || !task) {
      setMessage('Please provide a valid agent name and task.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/agents/assign_tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_name: agentName, tasks: task }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Task "${task}" assigned successfully to agent "${agentName}".`);
        setTaskHistory((prev) => [...prev, task]);
        fetchAgentStatus();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('Error assigning task.');
    } finally {
      setLoading(false);
    }
  };

  // Pause agent task
  const pauseAgent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_name: agentName }),
      });
      if (response.ok) {
        setMessage(`Agent "${agentName}" paused.`);
        setIsTaskRunning(false);
      } else {
        setMessage('Error pausing agent.');
      }
    } catch (error) {
      setMessage('Error pausing agent.');
    } finally {
      setLoading(false);
    }
  };

  // Stop agent task
  const stopAgent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_name: agentName }),
      });
      if (response.ok) {
        setMessage(`Agent "${agentName}" stopped.`);
        setIsTaskRunning(false);
      } else {
        setMessage('Error stopping agent.');
      }
    } catch (error) {
      setMessage('Error stopping agent.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch agent status initially when agent name is entered
  useEffect(() => {
    if (agentName) {
      fetchAgentStatus();
    }
  }, [agentName]);

  return (
    <div className="agent-manager container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Agent Manager</h2>

      {/* If no agents have been created, display a guide */}
      {agentsList.length === 0 ? (
        <div className="p-4 border rounded-lg bg-gray-100 text-center">
          <FontAwesomeIcon icon={faInfoCircle} className="text-4xl mb-4 text-gray-500" />
          <h3 className="text-lg font-bold">No Agents Created Yet</h3>
          <p className="text-gray-600 mt-2">
            To create your first agent, navigate to the <span className="font-semibold">Create Agent</span> tab and assign tools such as Security Check, Financial Roadmap, and more.
          </p>
          <p className="text-gray-600 mt-2">
            Once created, agents can be assigned tasks like analyzing data or visualizing a wallet. Manage your agent tasks here once created.
          </p>
        </div>
      ) : (
        <div>
          {/* Input for agent name */}
          <Tippy content="Enter the agent name to manage its tasks">
            <input
              type="text"
              placeholder="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="input mb-4 p-2 border rounded w-full"
            />
          </Tippy>

          {/* Input for task */}
          <Tippy content="Assign a specific task to the agent (e.g., 'analyze', 'simulate')">
            <input
              type="text"
              placeholder="Task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="input mb-4 p-2 border rounded w-full"
            />
          </Tippy>

          {/* Assign Task Button */}
          <button onClick={assignTask} className="py-2 px-4 bg-neorange text-white rounded mt-4 hover:bg-orange-600">
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Assign Task'}
          </button>

          {/* Actions for pausing, stopping the agent */}
          <div className="flex gap-4 mt-4">
            <Tippy content="Pause the agent's current task">
              <button onClick={pauseAgent} className="py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Pause <FontAwesomeIcon icon={faPauseCircle} />
              </button>
            </Tippy>
            <Tippy content="Stop the agent's task">
              <button onClick={stopAgent} className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
                Stop <FontAwesomeIcon icon={faStopCircle} />
              </button>
            </Tippy>
          </div>

          {/* Display message */}
          {message && <p className="mt-4 text-gray-700">{message}</p>}

          {/* Display agent task history */}
          {taskHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Task History:</h3>
              <ul className="list-disc list-inside">
                {taskHistory.map((historyItem, index) => (
                  <li key={index}>{historyItem}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentManager;
