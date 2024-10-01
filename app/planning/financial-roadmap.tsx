import React, { useState, useEffect } from "react";
import { connectWallet, syncWalletData } from "@/utilities/web3Utils";
import { fetchTransactionSummary } from "@/utilities/apiUtils";
import WalletSelectionModal from "@/components/wallets"; // Assume you have a modal for wallet selection

const FinancialRoadmap: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null); // Wallet address state
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for fetching summary
  const [connected, setConnected] = useState<boolean>(false); // Whether the wallet is connected
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false); // Show wallet modal

  // Function to handle wallet connection
  const handleConnectWallet = (providerName: string) => {
    setLoading(true); // Set loading when connecting wallet
    connectWallet(providerName)
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]); // Set the connected wallet address
          syncWalletData(accounts); // Sync wallet data if necessary
          setConnected(true);
          setShowWalletModal(false); // Close modal after successful connection
        }
      })
      .catch((error) => {
        console.error("Error connecting to wallet:", error);
        setConnected(false);
      })
      .finally(() => {
        setLoading(false); // Stop loading once connection is complete
      });
  };

  // Fetch the transaction summary when an address is available
  useEffect(() => {
    if (address) {
      setLoading(true);
      fetchTransactionSummary(address)
        .then((response) => {
          setSummary(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching financial roadmap data:", error);
          setLoading(false);
        });
    }
  }, [address]);

  return (
    <div className="main-content bg-background-color flex flex-col items-center text-center p-6 min-h-screen">
      <h1 className="section-header text-3xl font-bold mb-8">Financial Roadmap</h1>

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
        <div className="card p-6 w-full max-w-3xl">
          <p className="text-lg mb-4">Roadmap for account: {address}</p>
          {loading ? (
            <div>Loading financial roadmap...</div>
          ) : summary ? (
            <div>
              <p className="font-medium text-gray-700 mb-2">Transaction Summary:</p>
              <pre className="bg-gray-100 p-4 rounded-lg">{JSON.stringify(summary, null, 2)}</pre>
            </div>
          ) : (
            <p>No summary available for this address.</p>
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

export default FinancialRoadmap;
