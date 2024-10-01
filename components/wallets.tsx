import React from "react";
import Image from "next/image";

interface WalletSelectionModalProps {
  onSelect: (provider: string) => void;
  onClose: () => void;
}

const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center text-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Select a Wallet</h2>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => onSelect("MetaMask")}
            className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-100"
          >
            <Image src="/metamask-logo.png" alt="MetaMask" width={32} height={32} />
            <span>MetaMask</span>
          </button>
          <button
            onClick={() => onSelect("CoinbaseWallet")}
            className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-100"
          >
            <Image src="/coinbase-logo.png" alt="Coinbase Wallet" width={32} height={32} />
            <span>Coinbase Wallet</span>
          </button>
          {/* Add more wallet options as needed */}
        </div>
        <button onClick={onClose} className="mt-4 text-center text-blue-500">Cancel</button>
      </div>
    </div>
  );
};

export default WalletSelectionModal;
