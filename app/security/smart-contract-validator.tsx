'use client'

import React, { useState } from "react";
import { connectWallet, syncWalletData } from '@/utilities/web3Utils';

const SmartContractValidator: React.FC = () => {
  const [contractCode, setContractCode] = useState("");
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null); // Wallet address state
  const [connected, setConnected] = useState<boolean>(false);

  // Function to connect wallet
  const handleConnectWallet = async () => {
    const accounts = await connectWallet("MetaMask"); // or "CoinbaseWallet" depending on the provider
    if (accounts && accounts.length > 0) {
      setAddress(accounts[0]);
      syncWalletData(accounts);
      setConnected(true);
    }
  };

  const handleValidateContract = async () => {
    if (!connected) {
      alert("Please connect your wallet before validating the contract.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze_smart_contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractCode }),
      });

      if (!response.ok) {
        throw new Error("Error validating contract");
      }

      const data = await response.json();
      setValidationResult(data.analysis);
    } catch (error) {
      console.error("Error validating contract:", error);
      setValidationResult("Failed to validate the contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Smart Contract Validator</h1>
      {!connected && (
        <button
          onClick={handleConnectWallet}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Connect Wallet
        </button>
      )}
      <textarea
        value={contractCode}
        onChange={(e) => setContractCode(e.target.value)}
        placeholder="Paste your Solidity contract here..."
        className="w-full h-40 p-4 border rounded-lg mt-4"
      />
      <button
        onClick={handleValidateContract}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        {loading ? "Validating..." : "Validate Contract"}
      </button>
      {validationResult && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Validation Result:</h2>
          <pre className="text-sm">{validationResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SmartContractValidator;
