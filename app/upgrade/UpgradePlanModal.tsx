import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faAtom, faBolt } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Import Tippy's CSS for styling

const UpgradePlanModal: React.FC = () => {
  // URL of the contact form
  const contactFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScQvaB9z86SbaM3JXgxFMhKLe0rJlfKyLBbn8BvkpHk1-gQlA/viewform";

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Upgrade Your Plan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        {/* Free Beta Plan */}
        <Tippy content="This plan includes limited features, with only one agent allowed.">
          <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
            <FontAwesomeIcon icon={faBolt} className="text-3xl mb-4 text-neorange" />
            <h3 className="text-lg font-semibold">Beta Agents (Free Plan)</h3>
            <p className="text-gray-600 mb-2">
              Limited to a single test agent with basic tasks.
            </p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>✔ Create 1 Agent</li>
              <li>✔ Assign Simple Tasks</li>
              <li>✘ No Automation Across Multiple Agents</li>
              <li>✘ Limited Dashboard Integration</li>
            </ul>
            <button className="py-2 px-4 bg-neorange text-white rounded mt-2 cursor-not-allowed" disabled>
              Current Plan
            </button>
          </div>
        </Tippy>

        {/* Agents Plan */}
        <Tippy content="Upgrade to allow the creation of multiple agents and enhanced task automation.">
          <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md opacity-50">
            <FontAwesomeIcon icon={faRobot} className="text-3xl mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-400">Agents</h3>
            <p className="text-gray-400 mb-2">
              Create and manage multiple agents for enhanced task completion.
            </p>
            <ul className="text-sm text-gray-400 mb-4">
              <li>✔ Multiple Agents</li>
              <li>✔ Task Automation</li>
              <li>✘ No Advanced Analytics</li>
              <li>✘ No Quantum AI Support</li>
            </ul>
            <a
              href={contactFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-gray-300 text-gray-500 rounded mt-2 hover:bg-neorange hover:text-white"
            >
              Contact Us to Upgrade
            </a>
          </div>
        </Tippy>

        {/* Smart Agents Plan */}
        <Tippy content="Unlock AI-driven agents with web3, smart contracts, and blockchain integration.">
          <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md opacity-50">
            <FontAwesomeIcon icon={faRobot} className="text-3xl mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-400">Smart Agents</h3>
            <p className="text-gray-400 mb-2">
              Upgrade to AI-driven agents with blockchain integration, smart contracts, and web3 functionality.
            </p>
            <ul className="text-sm text-gray-400 mb-4">
              <li>✔ Multiple Agents</li>
              <li>✔ Advanced Task Automation</li>
              <li>✔ Integrated Analytics & Blockchain</li>
              <li>✔ Web3 & Smart Contract Integration</li>
              <li>✘ No Quantum AI Support</li>
            </ul>
            <a
              href={contactFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-gray-300 text-gray-500 rounded mt-2 hover:bg-neorange hover:text-white"
            >
              Contact Us to Upgrade
            </a>
          </div>
        </Tippy>

        {/* Quantum Agents Plan */}
        <Tippy content="Unlock cutting-edge quantum-powered agents for the most advanced tasks.">
          <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md opacity-50">
            <FontAwesomeIcon icon={faAtom} className="text-3xl mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-400">Quantum Smart Agents</h3>
            <p className="text-gray-400 mb-2">
              Access quantum-powered agents for complex tasks and advanced data analytics.
            </p>
            <ul className="text-sm text-gray-400 mb-4">
              <li>✔ Multiple Quantum Agents</li>
              <li>✔ Quantum AI Task Automation</li>
              <li>✔ Advanced Data & Insights</li>
              <li>✔ Integrated Analytics & Blockchain</li>
              <li>✔ Web3 & Smart Contract Integration</li>
              <li>✔ Quantum-Powered Analytics</li>
            </ul>
            <a
              href={contactFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-gray-300 text-gray-500 rounded mt-2 hover:bg-neorange hover:text-white"
            >
              Contact Us to Upgrade
            </a>
          </div>
        </Tippy>
      </div>
    </div>
  );
};

export default UpgradePlanModal;
