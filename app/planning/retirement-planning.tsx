import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPiggyBank, faChartLine, faCalculator } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react'; // Tooltip for additional info

const RetirementPlanning: React.FC = () => {
  const [capitalGains, setCapitalGains] = useState<number | null>(null);
  const [beneficiary, setBeneficiary] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Function to fetch capital gains (example fetch logic)
  useEffect(() => {
    const fetchCapitalGains = async () => {
      try {
        const response = await fetch('/api/capital-gains');
        if (response.ok) {
          const data = await response.json();
          setCapitalGains(data.capitalGains);
        } else {
          setMessage('Failed to fetch capital gains.');
        }
      } catch (error) {
        setMessage('Error fetching capital gains.');
      }
    };

    fetchCapitalGains();
  }, []);

  const updateBeneficiary = () => {
    if (beneficiary) {
      setMessage(`Beneficiary "${beneficiary}" added successfully.`);
    } else {
      setMessage('Please provide a valid beneficiary address.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Retirement Planning</h2>

      {/* Overview Section */}
      <div className="mb-6">
        <Tippy content="Understand the key tools available for retirement planning.">
          <h3 className="text-xl font-semibold mb-2">Retirement Planning Tools</h3>
        </Tippy>
        <p className="text-gray-600">
          With our retirement planning tools, you can simulate investments, calculate capital gains, and assign
          beneficiaries to ensure your assets are securely transferred in the future.
        </p>
      </div>

      {/* Capital Gains Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Capital Gains Overview</h4>
        {capitalGains !== null ? (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p>Total Capital Gains: ${capitalGains}</p>
          </div>
        ) : (
          <p>Loading capital gains data...</p>
        )}
      </div>

      {/* Beneficiary Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Assign Beneficiary</h4>
        <input
          type="text"
          placeholder="Enter Beneficiary Address"
          value={beneficiary}
          onChange={(e) => setBeneficiary(e.target.value)}
          className="border p-2 rounded-md w-full mb-4"
        />
        <button
          onClick={updateBeneficiary}
          className="py-2 px-4 bg-neorange text-white rounded hover:bg-neorange-dark"
        >
          <FontAwesomeIcon icon={faPiggyBank} className="mr-2" />
          Add Beneficiary
        </button>
      </div>

      {/* Tool Details Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
          <FontAwesomeIcon icon={faCalculator} className="text-3xl mb-4 text-neorange" />
          <h3 className="text-lg font-semibold">Investment Simulator</h3>
          <p className="text-gray-600">Simulate your investments and see the potential returns over time.</p>
        </div>

        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
          <FontAwesomeIcon icon={faChartLine} className="text-3xl mb-4 text-neorange" />
          <h3 className="text-lg font-semibold">Financial Roadmap</h3>
          <p className="text-gray-600">Create a financial roadmap that leads to a secure retirement.</p>
        </div>

        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
          <FontAwesomeIcon icon={faPiggyBank} className="text-3xl mb-4 text-neorange" />
          <h3 className="text-lg font-semibold">Visualize Wallet</h3>
          <p className="text-gray-600">Get a clear view of your wallet and assets over time.</p>
        </div>
      </div>

      {/* Display message */}
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default RetirementPlanning;
