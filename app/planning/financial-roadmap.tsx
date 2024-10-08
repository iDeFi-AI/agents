import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faShieldAlt, faPiggyBank, faCoins, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { connectWallet, syncWalletData } from '@/utilities/web3Utils'; // Import syncWalletData
import WalletSelectionModal from '@/components/wallets';

const FinancialRoadmap: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [quantumData, setQuantumData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleWalletSelect = async (provider: string) => {
    try {
      const accounts = await connectWallet(provider);
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await syncWalletData(accounts); // Sync wallet data
        fetchRoadmapData(accounts[0]);
        fetchQuantumData(accounts[0]);
        setIsModalOpen(false); // Close modal after connection
      } else {
        setError('No accounts found. Please check your wallet.');
      }
    } catch (err) {
      setError('Failed to connect to wallet.');
    }
  };

  const fetchRoadmapData = async (address: string) => {
    try {
      const response = await fetch('https://api.idefi.ai/api/basic_metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      setRoadmapData(data);
    } catch (error) {
      setError('Error fetching roadmap data.');
      console.error('Error fetching roadmap data:', error);
    }
  };

  const fetchQuantumData = async (address: string) => {
    try {
      const response = await fetch('https://q.idefi.ai/api/quantum_risk_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolio: { walletAddress: address } }),
      });
      const data = await response.json();
      setQuantumData(data.risk_analysis);
    } catch (error) {
      setError('Error fetching quantum data.');
      console.error('Error fetching quantum data:', error);
    }
  };

  return (
    <div className="financial-roadmap bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Financial Roadmap</h1>

      {/* Wallet Connect Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white py-2 px-4 rounded-md mb-6"
      >
        Connect Wallet
      </button>

      {/* WalletSelectionModal */}
      {isModalOpen && (
        <WalletSelectionModal
          onSelect={handleWalletSelect}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {walletAddress && <p className="text-green-600 mt-4">Connected: {walletAddress}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}

      {/* Display Roadmap Data */}
      {walletAddress && roadmapData && (
        <div className="roadmap-steps grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Wealth Plan Step */}
          <div className="roadmap-step bg-blue-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="text-blue-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Wealth Plan</h2>
              <Tippy content="Your long-term financial strategy for building wealth." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{roadmapData?.wealth_plan || 'Loading...'}</p>
          </div>

          {/* Savings Strategy Step */}
          <div className="roadmap-step bg-green-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faPiggyBank} className="text-green-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Savings Strategy</h2>
              <Tippy content="Recommended savings strategies based on your income and goals." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{roadmapData?.savings_strategy || 'Loading...'}</p>
          </div>

          {/* Risk Management Step */}
          <div className="roadmap-step bg-yellow-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-yellow-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Risk Management</h2>
              <Tippy content="Managing risk through a diversified portfolio." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{roadmapData?.risk_management || 'Loading...'}</p>
          </div>

          {/* Investment Growth Step */}
          <div className="roadmap-step bg-red-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faCoins} className="text-red-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Investment Growth</h2>
              <Tippy content="Strategies for growing your investments over time." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{roadmapData?.investment_growth || 'Loading...'}</p>
          </div>

          {/* Quantum Risk Analysis (Q.Idefi.AI) */}
          {quantumData && (
            <div className="roadmap-step bg-purple-100 p-6 rounded-lg shadow-md">
              <div className="step-header flex items-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-purple-600 text-2xl mr-4" />
                <h2 className="text-xl font-semibold">Quantum Risk Analysis</h2>
                <Tippy content="Analyze risk using quantum data." trigger="mouseenter">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
                </Tippy>
              </div>
              <p className="mt-4 text-gray-700">{quantumData?.explanation || 'Loading quantum analysis...'}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .roadmap-step {
          transition: transform 0.2s ease;
        }
        .roadmap-step:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default FinancialRoadmap;
