import React, { useEffect, useState } from "react";
import { connectWallet, syncWalletData, disconnectWallet } from "@/utilities/web3Utils"; // Added disconnectWallet utility
import { fetchDataAndMetrics } from "@/utilities/apiUtils";
import WalletSelectionModal from "@/components/wallets"; // Modal for wallet selection
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // FontAwesome for icons
import { faSpinner, faWallet, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const CommunicationHub: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null); // Wallet address state
  const [data, setData] = useState<any | null>(null); // Data from API
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [connected, setConnected] = useState<boolean>(false); // Wallet connected state
  const [error, setError] = useState<string | null>(null); // Error state for connection issues
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false); // Wallet selection modal

  // Function to handle wallet connection
  const handleConnectWallet = (providerName: string) => {
    setLoading(true); // Set loading when connecting wallet
    setError(null); // Clear previous errors
    connectWallet(providerName)
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]); // Set the connected wallet address
          syncWalletData(accounts); // Sync wallet data if necessary
          setConnected(true);
          setShowWalletModal(false); // Close the wallet selection modal
        }
      })
      .catch((error) => {
        console.error("Error connecting to wallet:", error);
        setError("Failed to connect to wallet. Please try again.");
        setConnected(false);
      })
      .finally(() => {
        setLoading(false); // Stop loading once connection is complete
      });
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    await disconnectWallet();
    setAddress(null);
    setConnected(false);
    setData(null);
  };

  // Fetch data and metrics when the wallet is connected
  useEffect(() => {
    if (address) {
      setLoading(true); // Start loading when fetching data
      fetchDataAndMetrics(address)
        .then((response) => {
          setData(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError("Failed to fetch data. Please try again.");
          setLoading(false);
        });
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center text-center p-6">
      <h1 className="text-3xl font-bold mb-6">Communication Hub</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {!connected ? (
        <div>
          <button
            onClick={() => setShowWalletModal(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <FontAwesomeIcon icon={faWallet} className="mr-2" />
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="card bg-white shadow rounded-lg p-6 w-full max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500" />
              <p className="ml-4">Loading data...</p>
            </div>
          ) : data ? (
            <div>
              <p className="text-xl font-semibold mb-4">Wallet Address: {address}</p>
              <p className="text-lg">Data fetched for your communication needs:</p>
              <pre className="bg-gray-100 p-4 rounded-lg mt-4 text-left">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-lg text-gray-600">No data available for this address.</p>
          )}
          <button
            onClick={handleDisconnectWallet}
            className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Disconnect Wallet
          </button>
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

export default CommunicationHub;
