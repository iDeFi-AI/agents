"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  connectWallet,
  disconnectWallet,
  syncWalletData,
} from "@/utilities/web3Utils";
import WalletSelectionModal from "@/components/wallets";
import {
  BalanceIcon,
  KeyIcon,
  PlusIcon,
  CopyIcon,
} from "@/components/icons";
import FinancialHealth from "../metrics/financial-health";
import CommunicationHub from "./communication-hub";

const clientCategories = {
  METRICS: ["FinancialHealth"],
  CLIENT_SUPPORT: ["CommunicationHub"],
};

const ClientDashboard: React.FC = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<
    { account: string; provider: string }[]
  >([]);
  const [manualAddress, setManualAddress] = useState<string>("");
  const [mainAccount, setMainAccount] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>("FinancialHealth");
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    if (connectedAccounts.length > 0) {
      syncWalletData(connectedAccounts.map((acc) => acc.account));
    }
  }, [connectedAccounts]);

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = async (provider: string) => {
    const accounts = await connectWallet(provider);
    if (accounts) {
      const uniqueAccounts = Array.from(
        new Set([
          ...connectedAccounts,
          ...accounts.map((account: string) => ({ account, provider })),
        ])
      );
      setConnectedAccounts(uniqueAccounts);
      setMainAccount(uniqueAccounts[0].account); // Set the first account as the main account
      setShowWalletModal(false);
    } else {
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const handleDisconnectWallet = (account: string) => {
    const updatedAccounts = connectedAccounts.filter(
      (acc) => acc.account !== account
    );
    setConnectedAccounts(updatedAccounts);
    if (mainAccount === account) {
      setMainAccount(updatedAccounts.length > 0 ? updatedAccounts[0].account : null);
    }
    disconnectWallet();
  };

  const copyToClipboard = (account: string) => {
    navigator.clipboard.writeText(account);
    alert("Address copied to clipboard!");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const shortenAddress = (address: string) => {
    const isMobile = window.innerWidth < 768;
    return isMobile
      ? address.length > 10
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : address
      : address.length > 10
      ? `${address.slice(0, 42)}...${address.slice(-6)}`
      : address;
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualAddress(e.target.value);
  };

  const addManualAddress = () => {
    if (
      manualAddress &&
      !connectedAccounts.some((acc) => acc.account === manualAddress)
    ) {
      setConnectedAccounts((prevAccounts) => [
        ...prevAccounts,
        { account: manualAddress, provider: "Manual" },
      ]);
      setMainAccount(manualAddress);
      setManualAddress("");
    } else {
      alert("This address is already added or invalid.");
    }
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case "FinancialHealth":
        return <FinancialHealth />;
      case "CommunicationHub":
        return <CommunicationHub />;
      default:
        return <FinancialHealth />; // Default to Financial Health for clients
    }
  };

  const getWalletLogo = (provider: string) => {
    if (provider === "MetaMask") {
      return "/metamask-logo.png";
    } else if (provider === "CoinbaseWallet") {
      return "/coinbase-logo.png";
    } else {
      return "/logo.png";
    }
  };

  return (
    <div className="client-dashboard-container">
      {showWalletModal && (
        <WalletSelectionModal
          onSelect={handleWalletSelect}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      <div className="main-content bg-background-color">
        <div className="header">
          <div className="wallet-management">
            <div className="wallet-summary" onClick={toggleDropdown}>
              <span>{mainAccount ? shortenAddress(mainAccount) : "No Wallet Connected"}</span>
              <span>{showDropdown ? "▲" : "▼"}</span>
            </div>
            {showDropdown && (
              <div className="wallet-dropdown">
                {connectedAccounts.map(({ account, provider }, index) => (
                  <div
                    key={index}
                    className="wallet-info"
                    onClick={() => setMainAccount(account)}
                  >
                    <Image
                      src={getWalletLogo(provider)}
                      alt="Wallet Logo"
                      width={24}
                      height={24}
                      className="wallet-logo"
                      priority
                      quality={100}
                      layout="fixed"
                    />
                    <span className="wallet-address" title={account}>
                      {shortenAddress(account)}
                    </span>
                    <button onClick={() => copyToClipboard(account)} className="copy-button">
                      <CopyIcon />
                    </button>
                    <button
                      onClick={() => handleDisconnectWallet(account)}
                      className="disconnect-button"
                    >
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleConnectWallet} className="connect-button">
              <KeyIcon style={{ marginRight: "8px" }} />
              Connect Wallet
            </button>
          </div>
          <div className="wallet-input-container">
            <input
              type="text"
              className="wallet-input"
              value={manualAddress}
              placeholder="Enter Wallet Address . . ."
              onChange={handleManualInput}
            />
            <button onClick={addManualAddress} className="add-button">
              <PlusIcon style={{ marginRight: "8px" }} />
              Add
            </button>
          </div>
        </div>

        <div className="client-tools">
          <h2>Client Tools</h2>
          {renderActiveTool()}
        </div>
      </div>

      <style jsx>{`
        .client-dashboard-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #f8f9fa;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .wallet-management {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 600px;
        }

        .wallet-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #f2f2f2;
          border-radius: 8px;
          cursor: pointer;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wallet-address {
          font-size: 14px;
          color: #333;
        }

        .copy-button,
        .disconnect-button {
          background-color: #FF7E2F;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .wallet-dropdown {
          margin-top: 10px;
          padding: 10px;
          background-color: white;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
        }

        .connect-button {
          background-color: #FF7E2F;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          margin-top: 10px;
        }

        .wallet-input-container {
          display: flex;
          gap: 10px;
          flex: 1;
          margin-top: 10px;
          width: 100%;
        }

        .wallet-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          font-size: 16px;
        }

        .add-button {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
        }

        .client-tools {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default ClientDashboard;
