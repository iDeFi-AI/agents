"use client";

import React, { useState } from "react";
import Head from "next/head";
import ScoreTxnsV2 from "@/components/layouts/ScoreTxnsV2";
import CodeTerminal from "@/components/layouts/CodeTerminal";
import { pushAiInsights } from "@/utilities/firebaseClient";
import {
  checkFlaggedAddress,
  fetchEtherscanData,
  isValidAddress,
} from "@/utilities/apiUtils";
import { connectWallet, syncWalletData } from "@/utilities/web3Utils"; // Wallet functions from wallets.tsx
import { generateInsights } from "@/utilities/dataUtils";
import WalletSelectionModal from "@/components/wallets"; // Modal for wallet selection

interface Metric {
  name: string;
  value: number;
  color: string;
}

interface Transaction {
  id: string;
  timestamp: string;
  type: "Sent" | "Received";
  cryptocurrency: string;
  usdAmount: number;
  thirdPartyWallet: string;
  flagged: boolean;
  risk: "High" | "Medium" | "Low" | "None";
}

const SourceDestination: React.FC = () => {
  const [sourceAddress, setSourceAddress] = useState<string>("");
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [sourceInsights, setSourceInsights] = useState<string>("");
  const [destinationInsights, setDestinationInsights] = useState<string>("");
  const [connectedAccountSource, setConnectedAccountSource] = useState<string | null>(null);
  const [connectedAccountDestination, setConnectedAccountDestination] = useState<string | null>(null);
  const [sourceFlaggedStatus, setSourceFlaggedStatus] = useState<{ description: string, status: string } | null>(null);
  const [destinationFlaggedStatus, setDestinationFlaggedStatus] = useState<{ description: string, status: string } | null>(null);
  const [sourceTransactions, setSourceTransactions] = useState<Transaction[]>([]);
  const [destinationTransactions, setDestinationTransactions] = useState<Transaction[]>([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [sourceMetrics, setSourceMetrics] = useState<Metric[]>([]);
  const [destinationMetrics, setDestinationMetrics] = useState<Metric[]>([]);
  const [sourceStatus, setSourceStatus] = useState<"Pass" | "Fail" | null>(null);
  const [destinationStatus, setDestinationStatus] = useState<"Pass" | "Fail" | null>(null);
  const [loadingSourceStatus, setLoadingSourceStatus] = useState(false);
  const [loadingDestinationStatus, setLoadingDestinationStatus] = useState(false);
  const [loadingSourceInsights, setLoadingSourceInsights] = useState(false);
  const [loadingDestinationInsights, setLoadingDestinationInsights] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showSourceTransactions, setShowSourceTransactions] = useState(false);
  const [showDestinationTransactions, setShowDestinationTransactions] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [isConnectingSource, setIsConnectingSource] = useState<boolean>(true); // To track source/destination wallet connection

  // Handle selecting a wallet from the modal
  const handleSelectWallet = async (provider: string) => {
    const accounts = await connectWallet(provider);
    if (accounts && accounts.length > 0) {
      if (isConnectingSource) {
        setConnectedAccountSource(accounts[0]);
        setSourceAddress(accounts[0]); // Set wallet as source address
      } else {
        setConnectedAccountDestination(accounts[0]);
        setDestinationAddress(accounts[0]); // Set wallet as destination address
      }
      syncWalletData(accounts);
    }
    setShowWalletModal(false); // Close the modal after selection
  };

  const handleOpenWalletModal = (isSource: boolean) => {
    setIsConnectingSource(isSource);
    setShowWalletModal(true); // Open the wallet selection modal
  };

  const handleGenerateStatus = async (isSource: boolean) => {
    const addressToUse = isSource
      ? connectedAccountSource || sourceAddress
      : connectedAccountDestination || destinationAddress;

    if (!isValidAddress(addressToUse)) {
      setAlertMessage(`Invalid ${isSource ? "Source" : "Destination"} Address. Please enter a valid address.`);
      return;
    }

    try {
      if (isSource) {
        setLoadingSource(true);
        setLoadingSourceStatus(true);
      } else {
        setLoadingDestination(true);
        setLoadingDestinationStatus(true);
      }

      const flaggedResponse = await checkFlaggedAddress(addressToUse);
      if (flaggedResponse) {
        const { status, description, metrics, transactions } = flaggedResponse;

        if (isSource) {
          setSourceFlaggedStatus({ description, status });
          setSourceStatus(status);
          setSourceMetrics(metrics || []);
          setSourceTransactions(transactions || []);
        } else {
          setDestinationFlaggedStatus({ description, status });
          setDestinationStatus(status);
          setDestinationMetrics(metrics || []);
          setDestinationTransactions(transactions || []);
        }

        setAlertMessage(null); // Clear any alert on success
      } else {
        throw new Error("No data received from checkFlaggedAddress");
      }
    } catch (error) {
      console.error("Error during status generation:", error);
      setAlertMessage("Failed to generate status. Please check the address and try again.");
    } finally {
      if (isSource) {
        setLoadingSource(false);
        setLoadingSourceStatus(false);
      } else {
        setLoadingDestination(false);
        setLoadingDestinationStatus(false);
      }
    }
  };

  const handleGenerateInsights = async (isSource: boolean) => {
    const addressToUse = isSource ? sourceAddress : destinationAddress;
    const transactionsToUse = isSource ? sourceTransactions : destinationTransactions;
    const statusToUse = isSource ? sourceStatus : destinationStatus;

    if (!isValidAddress(addressToUse)) {
      setAlertMessage(`Invalid ${isSource ? "Source" : "Destination"} Address. Please enter a valid address.`);
      return;
    }

    if (isSource) {
      setLoadingSourceInsights(true);
    } else {
      setLoadingDestinationInsights(true);
    }

    try {
      const insights = await generateInsights(addressToUse, transactionsToUse, statusToUse ?? "None");
      const insightsText = insights || "No significant insights available.";

      if (isSource) {
        setSourceInsights(insightsText);
      } else {
        setDestinationInsights(insightsText);
      }

      await pushAiInsights({
        userAddress: addressToUse,
        insights: insightsText,
        timestamp: Date.now(),
      });

      setAlertMessage(null);
    } catch (error) {
      console.error("Error generating insights:", error);
      setAlertMessage("Failed to generate insights. Please try again.");
    } finally {
      if (isSource) {
        setLoadingSourceInsights(false);
      } else {
        setLoadingDestinationInsights(false);
      }
    }
  };

  const handleLoadTransactions = async (isSource: boolean) => {
    const addressToUse = isSource
      ? connectedAccountSource || sourceAddress
      : connectedAccountDestination || destinationAddress;

    if (!isValidAddress(addressToUse)) {
      setAlertMessage(`Invalid ${isSource ? "Source" : "Destination"} Address. Please enter a valid address.`);
      return;
    }

    if (isSource) {
      setLoadingSource(true);
    } else {
      setLoadingDestination(true);
    }

    try {
      const transactions = await fetchEtherscanData(addressToUse);
      if (transactions) {
        if (isSource) {
          setSourceTransactions(transactions);
          setShowSourceTransactions(true);
        } else {
          setDestinationTransactions(transactions);
          setShowDestinationTransactions(true);
        }
      }

      setAlertMessage(null);
    } catch (error) {
      console.error("Error during transactions loading:", error);
      setAlertMessage("Failed to load transactions. Please try again.");
    } finally {
      if (isSource) {
        setLoadingSource(false);
      } else {
        setLoadingDestination(false);
      }
    }
  };

  const clearSourceResults = () => {
    setSourceMetrics([]);
    setSourceTransactions([]);
    setSourceStatus(null);
    setSourceInsights("");
    setSourceFlaggedStatus(null);
    setSourceAddress("");
    setConnectedAccountSource(null);
    setShowSourceTransactions(false);
    setAlertMessage(null);
  };

  const clearDestinationResults = () => {
    setDestinationMetrics([]);
    setDestinationTransactions([]);
    setDestinationStatus(null);
    setDestinationInsights("");
    setDestinationFlaggedStatus(null);
    setDestinationAddress("");
    setConnectedAccountDestination(null);
    setShowDestinationTransactions(false);
    setAlertMessage(null);
  };

  return (
    <div className="min-h-screen bg-background-color flex flex-col items-center text-center p-6">
      <Head>
        <title>MUP</title>
      </Head>
      <section className="flex flex-col items-center justify-center py-8 px-4 w-full max-w-6xl bg-white shadow-lg rounded-lg">
        {alertMessage && <div className="alert">{alertMessage}</div>}
        <div className="mb-6">
        </div>
        <h4 className="text-2xl font-semibold mb-8">Enter Wallet Address to Check On Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 w-full">
          <div className="flex flex-col items-center p-4 border border-gray-200 rounded-md shadow-sm">
            <h5 className="text-xl font-medium mb-4">Source</h5>
            <button
              onClick={() => handleOpenWalletModal(true)}
              className="mb-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Select Wallet
            </button>
            <input
              type="text"
              placeholder="Enter Source Address"
              value={sourceAddress}
              onChange={(e) => setSourceAddress(e.target.value)}
              className="input-text w-full mb-4"
            />
            <div className="flex flex-col space-y-2 w-full">
              <button onClick={() => handleGenerateStatus(true)} className="button">
                {loadingSource ? "Loading..." : "Check Status"}
              </button>
              <button onClick={clearSourceResults} className="button-clear">
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 border border-gray-200 rounded-md shadow-sm">
            <h5 className="text-xl font-medium mb-4">Destination</h5>
            <button
              onClick={() => handleOpenWalletModal(false)}
              className="mb-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Select Wallet
            </button>
            <input
              type="text"
              placeholder="Enter Destination Address (Optional)"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="input-text w-full mb-4"
            />
            <div className="flex flex-col space-y-2 w-full">
              <button onClick={() => handleGenerateStatus(false)} className="button">
                {loadingDestination ? "Loading..." : "Check Status"}
              </button>
              <button onClick={clearDestinationResults} className="button-clear">
                Clear
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Source Address Results */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="section-header">Source Address Results</h2>
            {loadingSourceStatus ? (
              <p className="text-lg mt-4 font-medium">Loading status...</p>
            ) : (
              sourceStatus && (
                <p className="text-lg mt-4 font-medium">
                  Status:{" "}
                  <span className={sourceStatus === "Pass" ? "pass-indicator" : "fail-indicator"}>
                    {sourceStatus}
                  </span>
                </p>
              )
            )}
            {sourceMetrics.length > 0 &&
              sourceMetrics.map((metric, index) => (
                <div key={index} className={`w-full p-2 text-lg font-medium ${metric.color}`}>
                  {metric.name}: {metric.value}
                </div>
              ))}
            {sourceFlaggedStatus && (
              <div
                className={`flagged-status my-8 p-4 ${
                  sourceFlaggedStatus.status === "Fail" ? "bg-red-100 border-red-300" : "bg-green-100 border-green-300"
                } rounded-md shadow-sm`}
              >
                <h2
                  className={`section-header ${
                    sourceFlaggedStatus.status === "Fail" ? "text-red-700" : "text-green-700"
                  } flex items-center`}
                >
                  {sourceFlaggedStatus.status === "Fail" ? "Malicious Activity Detected" : "No Malicious Activity"}
                </h2>
                <p className={`text-base ${sourceFlaggedStatus.status === "Fail" ? "text-red-600" : "text-green-600"}`}>
                  {sourceFlaggedStatus.description}
                </p>
              </div>
            )}
            <div className="transactions-container mt-4">
              <button onClick={() => handleLoadTransactions(true)} className="button-secondary mb-2">
                {loadingSource ? "Loading Transactions..." : "Load Transactions"}
              </button>
              {showSourceTransactions && (
                <div className="transactions-list max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <ScoreTxnsV2 transactions={sourceTransactions} />
                </div>
              )}
            </div>
            <div className="insights-container mt-8">
              <h2 className="section-header">Key Insights for Source:</h2>
              <CodeTerminal>
                {loadingSourceInsights ? "Loading insights..." : sourceInsights || "No significant insights available."}
              </CodeTerminal>
              <button onClick={() => handleGenerateInsights(true)} className="button-secondary mt-4">
                {loadingSourceInsights ? "Generating Insights..." : "Generate Insights"}
              </button>
            </div>
          </div>

          {/* Destination Address Results */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="section-header">Destination Address Results</h2>
            {loadingDestinationStatus ? (
              <p className="text-lg mt-4 font-medium">Loading status...</p>
            ) : (
              destinationStatus && (
                <p className="text-lg mt-4 font-medium">
                  Status:{" "}
                  <span className={destinationStatus === "Pass" ? "pass-indicator" : "fail-indicator"}>
                    {destinationStatus}
                  </span>
                </p>
              )
            )}
            {destinationMetrics.length > 0 &&
              destinationMetrics.map((metric, index) => (
                <div key={index} className={`w-full p-2 text-lg font-medium ${metric.color}`}>
                  {metric.name}: {metric.value}
                </div>
              ))}
            {destinationFlaggedStatus && (
              <div
                className={`flagged-status my-8 p-4 ${
                  destinationFlaggedStatus.status === "Fail" ? "bg-red-100 border-red-300" : "bg-green-100 border-green-300"
                } rounded-md shadow-sm`}
              >
                <h2
                  className={`section-header ${
                    destinationFlaggedStatus.status === "Fail" ? "text-red-700" : "text-green-700"
                  } flex items-center`}
                >
                  {destinationFlaggedStatus.status === "Fail" ? "Malicious Activity Detected" : "No Malicious Activity"}
                </h2>
                <p className={`text-base ${destinationFlaggedStatus.status === "Fail" ? "text-red-600" : "text-green-600"}`}>
                  {destinationFlaggedStatus.description}
                </p>
              </div>
            )}
            <div className="transactions-container mt-4">
              <button onClick={() => handleLoadTransactions(false)} className="button-secondary mb-2">
                {loadingDestination ? "Loading Transactions..." : "Load Transactions"}
              </button>
              {showDestinationTransactions && (
                <div className="transactions-list max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <ScoreTxnsV2 transactions={destinationTransactions} />
                </div>
              )}
            </div>
            <div className="insights-container mt-8">
              <h2 className="section-header">Key Insights for Destination:</h2>
              <CodeTerminal>
                {loadingDestinationInsights ? "Loading insights..." : destinationInsights || "No significant insights available."}
              </CodeTerminal>
              <button onClick={() => handleGenerateInsights(false)} className="button-secondary mt-4">
                {loadingDestinationInsights ? "Generating Insights..." : "Generate Insights"}
              </button>
            </div>
          </div>
        </div>
        <div className="">
          <br/>
            <p>Report bugs to 📧 k3m@idefi.ai</p>
        </div>
      </section>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <WalletSelectionModal onSelect={handleSelectWallet} onClose={() => setShowWalletModal(false)} />
      )}
    </div>
  );
};

export default SourceDestination;
