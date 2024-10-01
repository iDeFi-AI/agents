import React, { useState } from "react";
import QRCode from "react-qr-code"; // Using react-qr-code library
import { connectWallet, signMessage } from "@/utilities/web3Utils"; // Your utility functions
import { generateShareLink } from "@/utilities/shareUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faWallet, faQrcode } from '@fortawesome/free-solid-svg-icons';
import WalletSelectionModal from "@/components/wallets";

const ShareDashboardModal: React.FC = () => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [clientAddress, setClientAddress] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false); // To control wallet modal visibility

  const baseURL = "http://localhost:3000";  // Your base URL

  // Connect Wallet and Sign a Message
  const handleConnectWallet = async (provider: string) => {
    try {
      const accounts = await connectWallet(provider); // Connect advisor's wallet based on selected provider (MetaMask or Coinbase)
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const signature = await signMessage("Sign to authenticate and generate a link."); // Advisor signs a message
        setClientAddress(address);
        setSignedMessage(signature); // Store the signed message
      } else {
        console.warn("No accounts returned from wallet connection.");
      }
    } catch (error) {
      console.error("Error connecting wallet or signing message:", error);
    }
  };

  // Generate URL link with signed message
  const handleGenerateLink = async () => {
    try {
      if (!signedMessage || !clientAddress) {
        alert("Please connect wallet and sign the message first.");
        return;
      }
      const link = generateShareLink(baseURL, clientAddress); // Example: includes advisor's address
      setShareLink(link); // Store generated link
    } catch (error) {
      console.error("Error generating link:", error);
    }
  };

  // Generate QR code for the same signed link
  const handleGenerateQRCode = async () => {
    try {
      if (!signedMessage || !clientAddress) {
        alert("Please connect wallet and sign the message first.");
        return;
      }
      const link = generateShareLink(baseURL, clientAddress);
      setQrCodeData(link); // Generate and set QR code data using the link
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  // Generate Share Wallet Link
  const handleShareWalletLink = () => {
    if (!clientAddress) {
      alert("Please connect wallet to generate the share link.");
      return;
    }

    alert("This feature is available in the upgraded plan."); // Placeholder for real logic
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Share Dashboard Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Option to join via URL */}
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
          <FontAwesomeIcon icon={faLink} className="text-3xl mb-4" />
          <h3 className="text-lg font-semibold">Join via URL</h3>
          <button
            onClick={handleGenerateLink}
            className="py-2 px-4 bg-blue-500 text-white rounded mt-2 hover:bg-blue-600"
          >
            Share Link
          </button>
          {shareLink && (
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 border p-2 rounded w-full"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareLink)}
                className="py-1 px-3 bg-blue-500 text-white rounded"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        {/* Option to join via QR Code */}
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
          <FontAwesomeIcon icon={faQrcode} className="text-3xl mb-4" />
          <h3 className="text-lg font-semibold">Join via QR Code</h3>
          <button
            onClick={handleGenerateQRCode}
            className="py-2 px-4 bg-green-500 text-white rounded mt-2 hover:bg-green-600"
          >
            Share QR Code
          </button>
          {qrCodeData && (
            <div className="mt-4">
              <QRCode value={qrCodeData} size={128} />
            </div>
          )}
        </div>

        {/* Option to join via Wallet */}
        <div className="flex flex-col items-center text-center border p-4 rounded-lg shadow-md">
          <FontAwesomeIcon icon={faWallet} className="text-3xl mb-4" />
          <h3 className="text-lg font-semibold">Join via Wallet</h3>
          <button
            onClick={handleShareWalletLink}
            className="py-2 px-4 bg-orange-500 text-white rounded mt-2 hover:bg-orange-600"
          >
            Share Wallet Link
          </button>
          {clientAddress && (
            <p className="mt-2 text-green-600">
              Connected wallet: {clientAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareDashboardModal;
