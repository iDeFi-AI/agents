'use client';
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'; // Added faBars and faTimes for mobile sidebar
import Image from 'next/image';
import {
  connectWallet,
  disconnectWallet,
  syncWalletData,
} from '@/utilities/web3Utils';
import WalletSelectionModal from '@/components/wallets';
import {
  ShieldIcon,
  GraphIcon,
  KeyIcon,
  MoneyIcon,
  BalanceIcon,
  AdvisorIcon,
  PlusIcon,
  CopyIcon,
  LightningIcon,
  Alert,
  Robot,
  StarIcon,
  ContractIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@/components/icons';
import SecurityCheck from '../security/security-check';
import FinancialRoadmap from '../planning/financial-roadmap';
import InvestmentSimulator from '../planning/investment-simulator';
import VisualizeWallet from '../metrics/visualize_wallet';
import CreateAgent from '../agents/create-agent';
import ShareDashboardModal from '../client-support/share-dashboard';
import UpgradePlanModal from '../upgrade/UpgradePlanModal';
import AgentBoard from '../agents/agent-board';
import AgentManager from '../agents/agent-manager';
import Notifications from '../alerts/notifications';

// Simulate fetching alerts from an API or database
const getAlerts = async () => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve([]); // Example alerts
    }, 1000);
  });
};

const tools = [
  { id: 1, name: 'SecurityCheck', label: 'Security Check', icon: ShieldIcon, active: true },
  { id: 2, name: 'FinancialRoadmap', label: 'Financial Roadmap', icon: GraphIcon, active: true },
  { id: 3, name: 'InvestmentSimulator', label: 'Investment Simulator', icon: MoneyIcon, active: true },
  { id: 4, name: 'VisualizeWallet', label: 'Visualize Wallet', icon: BalanceIcon, active: true },
];

const sideMenuTools = [
  { id: 5, name: 'CreateAgent', label: 'Create Agent', icon: Robot, active: true },
  { id: 6, name: 'AgentBoard', label: 'Agent Board', icon: Robot, active: true },
  { id: 7, name: 'AgentManager', label: 'Agent Manager', icon: Robot, active: true },
  { id: 8, name: 'ShareDashboardModal', label: 'Share with Client', icon: ContractIcon, active: true },
  { id: 9, name: 'UpgradePlanModal', label: 'Upgrade Plan', icon: LightningIcon, active: true },
  { id: 10, name: 'Notifications', label: 'Notifications', icon: faBell, active: true },
];

const categories = {
  ALL: tools.map((tool) => tool.name),
  PLANNING: ['FinancialRoadmap', 'InvestmentSimulator'],
  METRICS: ['VisualizeWallet'],
  SECURITY: ['SecurityCheck'],
  CLIENT_SUPPORT: ['ShareDashboardModal'],
};

const DashboardV3: React.FC = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<{ account: string; provider: string }[]>([]);
  const [manualAddress, setManualAddress] = useState<string>('');
  const [mainAccount, setMainAccount] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredTools, setFilteredTools] = useState<string[]>(categories.ALL);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [recentsOpen, setRecentsOpen] = useState<boolean>(true);
  const [favoritesOpen, setFavoritesOpen] = useState<boolean>(true);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [createAgentDropdownOpen, setCreateAgentDropdownOpen] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Added state for sidebar toggle

  useEffect(() => {
    if (connectedAccounts.length > 0) {
      syncWalletData(connectedAccounts.map((acc) => acc.account));
    }
  }, [connectedAccounts]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const alerts = await getAlerts();
      setActiveAlerts(alerts);
    };

    fetchAlerts();
  }, []);

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = async (provider: string) => {
    const accounts = await connectWallet(provider);
    if (accounts) {
      const uniqueAccounts = Array.from(
        new Set([...connectedAccounts, ...accounts.map((account: string) => ({ account, provider }))])
      );
      setConnectedAccounts(uniqueAccounts);
      setMainAccount(uniqueAccounts[0].account);
      setShowWalletModal(false);
    } else {
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = '/';
  };

  const handleDisconnectWallet = (account: string) => {
    const updatedAccounts = connectedAccounts.filter((acc) => acc.account !== account);
    setConnectedAccounts(updatedAccounts);
    if (mainAccount === account) {
      setMainAccount(updatedAccounts.length > 0 ? updatedAccounts[0].account : null);
    }
    disconnectWallet();
  };

  const copyToClipboard = (account: string) => {
    navigator.clipboard.writeText(account);
    alert('Address copied to clipboard!');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleCreateAgentDropdown = () => {
    setCreateAgentDropdownOpen(!createAgentDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    if (manualAddress && !connectedAccounts.some((acc) => acc.account === manualAddress)) {
      setConnectedAccounts((prevAccounts) => [...prevAccounts, { account: manualAddress, provider: 'Manual' }]);
      setMainAccount(manualAddress);
      setManualAddress('');
    } else {
      alert('This address is already added or invalid.');
    }
  };

  const handleFilterClick = (filter: keyof typeof categories) => {
    setFilteredTools(categories[filter]);
    setActiveCategory(filter);
    setActiveTool(null);
  };

  const handleToolClick = (tool: string) => {
    setShowNotifications(false);
    setActiveTool(tool);
    setRecents((prev) => [tool, ...prev.filter((item) => item !== tool)].slice(0, 5));
  };

  const toggleFavorite = (tool: string) => {
    setFavorites((prev) =>
      prev.includes(tool) ? prev.filter((item) => item !== tool) : [...prev, tool]
    );
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setActiveTool('Notifications');
  };

  const renderActiveTool = () => {
    if (showNotifications && activeTool === 'Notifications') {
      return <Notifications />;
    }

    const tool = tools.find((t) => t.name === activeTool);
    if (tool) {
      switch (tool.name) {
        case 'SecurityCheck':
          return <SecurityCheck />;
        case 'FinancialRoadmap':
          return <FinancialRoadmap />;
        case 'InvestmentSimulator':
          return <InvestmentSimulator />;
        case 'VisualizeWallet':
          return <VisualizeWallet />;
        default:
          return renderToolGrid();
      }
    }

    switch (activeTool) {
      case 'CreateAgent':
        return <CreateAgent />;
      case 'AgentBoard':
        return <AgentBoard />;
      case 'AgentManager':
        return <AgentManager />;
      case 'ShareDashboardModal':
        return <ShareDashboardModal />;
      case 'UpgradePlanModal':
        return <UpgradePlanModal />;
      case 'Notifications':
        return <Notifications />;
      default:
        return renderToolGrid();
    }
  };

  const renderToolGrid = () => (
    <div className="grid-container">
      {filteredTools.map((toolName) => {
        const tool = tools.find((t) => t.name === toolName);
        if (!tool) return null;

        return (
          <div
            key={tool.id}
            className={`grid-item ${tool.active ? '' : 'grayed-out'}`}
            onClick={() => tool.active && handleToolClick(tool.name)}
          >
            <div className="icon-placeholder">
              <tool.icon />
            </div>
            <p>{tool.label}</p>
            <span
              className={`star-icon ${favorites.includes(tool.name) ? 'favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(tool.name);
              }}
            >
              {favorites.includes(tool.name) ? '★' : '☆'}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="dashboard-container">
      {showWalletModal && (
        <WalletSelectionModal onSelect={handleWalletSelect} onClose={() => setShowWalletModal(false)} />
      )}
  
      <button className="hamburger-button" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <Image src="/agent.png" alt="iDEFi.AI Logo" width={100} height={50} className="logo-image" />
        </div>
        <nav className="nav-menu">
          <ul>
            <li className={activeTool === null ? 'active' : ''} onClick={() => setActiveTool(null)}>
              <AdvisorIcon /> Agent Tools
            </li>
  
            <li onClick={() => setRecentsOpen(!recentsOpen)}>
              <GraphIcon /> Recents {recentsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </li>
            {recentsOpen && recents.length > 0 && (
              <ul className="sub-menu">
                {recents.map((tool) => (
                  <li key={tool} onClick={() => handleToolClick(tool)}>
                    {tools.find((t) => t.name === tool)?.label || tool}
                  </li>
                ))}
              </ul>
            )}
  
            <li onClick={() => setFavoritesOpen(!favoritesOpen)}>
              <StarIcon /> Favorites {favoritesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </li>
            {favoritesOpen && favorites.length > 0 && (
              <ul className="sub-menu">
                {favorites.map((tool) => (
                  <li key={tool} onClick={() => handleToolClick(tool)}>
                    {tools.find((t) => t.name === tool)?.label || tool}
                  </li>
                ))}
              </ul>
            )}
  
            {/* Create Agent button with dropdown */}
            <li onClick={toggleCreateAgentDropdown}>
              <Robot /> Create Agent {createAgentDropdownOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </li>
            {createAgentDropdownOpen && (
              <ul className="sub-menu">
                <li onClick={() => handleToolClick('CreateAgent')}>Create New Agent</li>
                <li onClick={() => handleToolClick('AgentBoard')}>Agent Board</li>
                <li onClick={() => handleToolClick('AgentManager')}>Agent Manager</li>
              </ul>
            )}
  
            {/* Notifications Bell */}
            <li className="notification-item" onClick={handleNotificationClick}>
              <FontAwesomeIcon icon={faBell} className={activeAlerts.length > 0 ? 'alert-active' : ''} />
              <span>Notifications</span>
              {activeAlerts.length > 0 && <span className="notification-count">{activeAlerts.length}</span>}
            </li>
  
            {/* Share with Client */}
            <li onClick={() => handleToolClick('ShareDashboardModal')}>
              <ContractIcon /> Share with Client
            </li>
  
            {/* Upgrade Plan */}
            <li onClick={() => handleToolClick('UpgradePlanModal')}>
              <LightningIcon /> Upgrade Plan
            </li>
          </ul>
  
          {/* Logout Button */}
          <ul>
            <li className="logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
            </li>
          </ul>
          <div className="beta-notice">
          <Alert /> This is a Beta version of our Demo. Please be aware that some features and tools may be limited.
        </div>
        </nav>
      </div>
  
      <div className="main-content bg-background-color">
        <div className="header">
          {/* Wallet management section */}
          <div className="wallet-management">
            <div className="wallet-summary" onClick={toggleDropdown}>
              <span>{mainAccount ? shortenAddress(mainAccount) : 'No Wallet Connected'}</span>
              <span>{showDropdown ? '▲' : '▼'}</span>
            </div>
            {showDropdown && (
              <div className="wallet-dropdown">
                {connectedAccounts.map(({ account, provider }, index) => (
                  <div key={index} className="wallet-info" onClick={() => setMainAccount(account)}>
                    <Image
                      src={provider === 'MetaMask' ? '/metamask-logo.png' : '/coinbase-logo.png'}
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
                    <button onClick={() => handleDisconnectWallet(account)} className="disconnect-button">
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleConnectWallet} className="connect-button">
              <KeyIcon style={{ marginRight: '8px' }} />
              Connect and Sync Your Wallets
            </button>

             {/* Wallet input and Add button inside the same container */}
            <div className="wallet-input-container">
              <input
                type="text"
                className="wallet-input"
                value={manualAddress}
                placeholder="Enter Wallet Address..."
                onChange={handleManualInput}
              />
              <button onClick={addManualAddress} className="add-button">
                <PlusIcon style={{ marginRight: '8px' }} />
                Add
              </button>
            </div>
          </div>
  
          {/* Filters */}
          <div className="filter-buttons">
            <button
              className={`filter-button ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => handleFilterClick('ALL')}
            >
              ALL
            </button>
            <button
              className={`filter-button ${activeCategory === 'PLANNING' ? 'active' : ''}`}
              onClick={() => handleFilterClick('PLANNING')}
            >
              Planning
            </button>
            <button
              className={`filter-button ${activeCategory === 'METRICS' ? 'active' : ''}`}
              onClick={() => handleFilterClick('METRICS')}
            >
              Metrics
            </button>
            <button
              className={`filter-button ${activeCategory === 'SECURITY' ? 'active' : ''}`}
              onClick={() => handleFilterClick('SECURITY')}
            >
              Security
            </button>
            <button
              className={`filter-button ${activeCategory === 'CLIENT_SUPPORT' ? 'active' : ''}`}
              onClick={() => handleFilterClick('CLIENT_SUPPORT')}
            >
              Client Support
            </button>
          </div>
        </div>
  
        {/* Active Tool Rendering */}
        {renderActiveTool()}
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          height: 100vh;
          background-color: #f8f9fa;
          overflow: hidden;
        }

        .hamburger-button {
          position: fixed;
          top: 37px;
          left: 23px;
          z-index: 1002;
          background-color: transparent;
          border: none;
          color: #333;
          font-size: 24px;
          cursor: pointer;
          display: none;
        }

        .sidebar {
          width: 240px;
          background-color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          border-right: 1px solid #E0E0E0;
          overflow-y: auto;
          z-index: 1001;
          transition: all 0.3s ease;
        }

        .sidebar.open {
          left: 0;
        }

        .logo {
          margin-bottom: 30px;
        }

        .logo-image {
          max-width: 150px;
          height: auto;
        }

        .nav-menu ul {
          list-style: none;
          padding: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .nav-menu li {
          padding: 15px 20px;
          font-size: 16px;
          color: #757575;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 8px;
          transition: background-color 0.3s, color 0.3s;
        }

        .nav-menu li.active,
        .nav-menu li:hover {
          color: #FF7E2F;
          background-color: #f2f2f2;
          font-weight: bold;
        }

        .sub-menu {
          padding-left: 20px;
          margin-top: 5px;
        }

        .sub-menu li {
          padding: 10px;
          font-size: 14px;
          color: #555;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.3s, color 0.3s;
        }

        .sub-menu li:hover {
          color: #FF7E2F;
          background-color: #f2f2f2;
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

        .wallet-dropdown div:hover {
          background-color: #f2f2f2;
          transition: background-color 0.3s;
          cursor: pointer;
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
          width: 100%;
          margin-top: 10px;
        }

        .wallet-input {
          flex: 3; /* 75% of the container width */
          padding: 10px;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          font-size: 16px;
        }

        .add-button {
          flex: 1; /* 25% of the container width */
          background-color: #007bff;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          width: 100%;
          margin-top: 10px;
        }

        .filter-button {
          background-color: #F1F0EB;
          color: #333;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s, color 0.3s;
          flex: 1;
        }

        .filter-button.active,
        .filter-button:hover {
          background-color: #FF7E2F;
          color: white;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
        }

        .grid-item {
          background-color: white;
          border: 1px solid #E0E0E0;
          border-radius: 12px;
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
        }

        .grid-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .icon-placeholder {
          margin-bottom: 10px;
        }

        .grid-item p {
          font-size: 14px;
          color: #757575;
        }

        .star-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          font-size: 20px;
          color: #FFD700;
        }

        .star-icon.favorited {
          color: #FF7E2F;
        }

        .notification-item {
          display: flex;
          align-items: center; 
          justify-content: flex-start;
          gap: 10px;
          padding: 15px 20px;
          font-size: 16px;
          color: #757575;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.3s, color 0.3s;
          position: relative;
        }

        .notification-item:hover {
          color: #FF7E2F;
          background-color: #f2f2f2;
        }

        .notification-count {
          background-color: red;
          color: white;
          border-radius: 50%;
          padding: 3px 7px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          margin-left: 10px;
        }

        .alert-active {
          color: red;
        }

        .beta-notice {
          margin-top: 20px;
          padding: 10px;
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 1200px) {
          .grid-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .sidebar {
            width: 200px;
          }
        }

        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr;
          }

          .hamburger-button {
            display: block;
          }

          .sidebar {
            width: 240px;
            position: fixed;
            top: 0;
            bottom: 0;
            left: -100%;
            transition: left 0.3s ease;
          }

          .sidebar.open {
            left: 0;
          }

          .main-content {
            padding: 20px 10px 20px 10px;
          }

          .wallet-management {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .nav-menu ul {
            flex-wrap: wrap;
            justify-content: space-evenly;
          }

          .nav-menu li {
            flex: 1 0 100%;
            text-align: center;
            padding: 8px 0;
          }

          .sidebar {
            flex-direction: column;
            height: auto;
          }

          .wallet-management {
            flex-direction: column;
            align-items: flex-start;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .wallet-summary {
            width: 100%;
          }

          .connect-button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .nav-menu ul {
            flex-wrap: wrap;
            justify-content: space-evenly;
          }

          .nav-menu li {
            flex: 1 0 100%;
            text-align: center;
            padding: 8px 0;
          }

          .sidebar {
            flex-direction: column;
            height: auto;
          }

          .wallet-management {
            flex-direction: column;
            align-items: flex-start;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .wallet-summary {
            width: 100%;
          }

          .connect-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardV3;
