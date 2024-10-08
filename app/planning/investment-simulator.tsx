import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faChartLine, faBalanceScale, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { connectWallet, syncWalletData } from '@/utilities/web3Utils';
import WalletSelectionModal from '@/components/wallets';

const InvestmentSimulator: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [quantumResults, setQuantumResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleWalletSelect = async (provider: string) => {
    try {
      const accounts = await connectWallet(provider);
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await syncWalletData(accounts); // Sync wallet data
        runTraditionalSimulation(accounts[0]);
        runQuantumSimulation(accounts[0]);
        setIsModalOpen(false); // Close modal after connection
      } else {
        setError('No accounts found. Please check your wallet.');
      }
    } catch (err) {
      setError('Failed to connect to wallet.');
    }
  };

  const runTraditionalSimulation = async (address: string) => {
    try {
      const response = await fetch('https://api.idefi.ai/api/portfolio_optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolio: { walletAddress: address } }),
      });
      const data = await response.json();
      setSimulationData(data);
    } catch (error) {
      setError('Error fetching simulation data.');
      console.error('Error fetching simulation data:', error);
    }
  };

  const runQuantumSimulation = async (address: string) => {
    try {
      const response = await fetch('https://q.idefi.ai/api/quantum_risk_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolio: { walletAddress: address } }),
      });
      const data = await response.json();
      setQuantumResults(data.risk_analysis);
    } catch (error) {
      setError('Error fetching quantum simulation.');
      console.error('Error fetching quantum simulation:', error);
    }
  };

  return (
    <div className="investment-simulator bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Investment Simulator</h1>

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

      {/* Display Simulation Results */}
      {walletAddress && simulationData && (
        <div className="simulation-results grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Portfolio Optimization Result */}
          <div className="simulation-step bg-blue-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faCalculator} className="text-blue-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Portfolio Optimization</h2>
              <Tippy content="Optimizing your portfolio for maximum returns based on traditional metrics." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{simulationData?.optimized_portfolio || 'Loading...'}</p>
          </div>

          {/* Investment Growth Result */}
          <div className="simulation-step bg-green-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="text-green-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Investment Growth</h2>
              <Tippy content="Simulation showing potential growth of your investments over time." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{simulationData?.investment_growth || 'Loading...'}</p>
          </div>

          {/* Risk Management Result */}
          <div className="simulation-step bg-yellow-100 p-6 rounded-lg shadow-md">
            <div className="step-header flex items-center">
              <FontAwesomeIcon icon={faBalanceScale} className="text-yellow-600 text-2xl mr-4" />
              <h2 className="text-xl font-semibold">Risk Management</h2>
              <Tippy content="Assessing your portfolio's risk factors and mitigation strategies." trigger="mouseenter">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
              </Tippy>
            </div>
            <p className="mt-4 text-gray-700">{simulationData?.risk_management || 'Loading...'}</p>
          </div>

          {/* Quantum Risk Analysis Result */}
          {quantumResults && (
            <div className="simulation-step bg-purple-100 p-6 rounded-lg shadow-md">
              <div className="step-header flex items-center">
                <FontAwesomeIcon icon={faCalculator} className="text-purple-600 text-2xl mr-4" />
                <h2 className="text-xl font-semibold">Quantum Risk Analysis</h2>
                <Tippy content="Analyzing portfolio risk using quantum technologies." trigger="mouseenter">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 ml-2" />
                </Tippy>
              </div>
              <p className="mt-4 text-gray-700">{quantumResults?.explanation || 'Loading quantum analysis...'}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .simulation-step {
          transition: transform 0.2s ease;
        }
        .simulation-step:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default InvestmentSimulator;
