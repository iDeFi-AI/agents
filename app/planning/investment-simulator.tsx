'use client'

import React, { useState, useEffect } from "react";
import { connectWallet, syncWalletData } from '@/utilities/web3Utils';
import WalletSelectionModal from "@/components/wallets"; // Modal for wallet selection

// Define the structure of the simulation response
interface InvestmentData {
  amount: number;
  risk: string;
  projectedReturn: number;
}

const InvestmentSimulator: React.FC = () => {
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for fetching data
  const [address, setAddress] = useState<string | null>(null); // Wallet address state
  const [connected, setConnected] = useState<boolean>(false); // Whether the wallet is connected
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false); // Show wallet modal

  // Function to handle wallet connection
  const handleConnectWallet = async (providerName: string) => {
    setLoading(true); // Set loading when connecting wallet

    try {
      const accounts = await connectWallet(providerName);
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]); // Set the connected wallet address
        syncWalletData(accounts); // Sync wallet data if necessary
        setConnected(true);
        setShowWalletModal(false); // Close modal after successful connection
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setConnected(false);
    } finally {
      setLoading(false); // Stop loading once connection is complete
    }
  };

  // Fetch the investment simulation data when the wallet is connected
  useEffect(() => {
    if (address) {
      setLoading(true);
      fetch("/api/endpoints?endpoint=investment_simulator")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error fetching investment data");
          }
          return response.json();
        })
        .then((data) => {
          setInvestmentData(data);
        })
        .catch((error) => {
          console.error("Error fetching investment data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [address]);

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Investment Simulator</h1>

      {!connected ? (
        <div>
          <button
            onClick={() => setShowWalletModal(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-3xl">
          {loading ? (
            <p>Loading investment data...</p>
          ) : investmentData ? (
            <div>
              <div className="mb-4">
                <p className="text-gray-600">Investment Amount</p>
                <p className="text-3xl font-semibold">${investmentData.amount}</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-600">Risk Level</p>
                <p className="text-xl font-medium">{investmentData.risk}</p>
              </div>
              <div>
                <p className="text-gray-600">Projected Return</p>
                <p className="text-3xl font-semibold">${investmentData.projectedReturn}</p>
              </div>
            </div>
          ) : (
            <p>No investment data available.</p>
          )}
        </div>
      )}

      {showWalletModal && (
        <WalletSelectionModal
          onSelect={handleConnectWallet}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </div>
  );
};

export default InvestmentSimulator;
