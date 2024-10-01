import React, { useState, useEffect } from 'react';
import { createJWT } from 'did-jwt'; // For creating JWT with DID
import { EthrDID } from 'ethr-did'; // For Ethereum-based DIDs
import { connectWallet, disconnectWallet, signMessage } from '@/utilities/web3Utils'; // Web3 utilities
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faIdCard, faSignOutAlt, faKey, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css'; // Import Tippy.js CSS for the tooltips
import Tippy from '@tippyjs/react'; // Import Tippy.js for tooltips

const DidManagementPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [did, setDid] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet on component load
  useEffect(() => {
    const initWallet = async () => {
      try {
        const accounts = await connectWallet('MetaMask');
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        setError('Failed to connect MetaMask');
      }
    };
    initWallet();
  }, []);

  const handleWalletConnect = async () => {
    try {
      const accounts = await connectWallet('MetaMask');
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setError(null);
      } else {
        setError('No accounts found. Please connect your wallet.');
      }
    } catch (err) {
      setError('Failed to connect wallet.');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setWalletAddress(null);
      setDid(null);
      setJwt(null);
      setError(null);
    } catch (err) {
      setError('Failed to disconnect wallet.');
    }
  };

  const handleCreateDID = async () => {
    try {
      if (!walletAddress) {
        setError('Please connect your wallet first.');
        return;
      }

      // Create EthrDID instance using the wallet address
      const ethrDid = new EthrDID({
        identifier: walletAddress,
        provider: window.ethereum, // Use Web3 provider
        chainNameOrId: 'mainnet', // Specify the Ethereum network
      });

      setDid(ethrDid.did); // Set DID in state
      console.log('Created DID:', ethrDid.did);
    } catch (err: any) {
      setError('Failed to create DID: ' + err.message);
    }
  };

  const handleSignData = async () => {
    try {
      if (!walletAddress || !did) {
        setError('Please create a DID first.');
        return;
      }

      // Message to be signed
      const message = 'Sign this message to authenticate';

      // Sign the message with the connected wallet
      const signature = await signMessage(message);

      // Create a JWT using the DID and signed message
      const jwtToken = await createJWT(
        { sub: did, claim: { message } }, // Payload
        { issuer: did, signer: async () => signature } // Signing function using the wallet signature
      );

      setJwt(jwtToken); // Store the signed JWT
      console.log('Signed JWT:', jwtToken);
    } catch (err: any) {
      setError('Failed to sign data: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background-color flex flex-col items-center text-center p-6">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">DID Management</h1>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faWallet} className="text-4xl text-blue-600 mb-4" />
            <p className="text-gray-700 mb-2">
              Wallet Address: <span className="font-semibold">{walletAddress || 'Not connected'}</span>
            </p>
            <p className="text-gray-700 flex items-center">
              DID: <span className="font-semibold ml-2">{did || 'No DID created yet'}</span>
              <Tippy content="A Decentralized Identifier (DID) is a self-sovereign identifier that enables verifiable, decentralized digital identity.">
                <FontAwesomeIcon icon={faInfoCircle} className="ml-2 text-blue-600 cursor-pointer" />
              </Tippy>
            </p>
            <p className="text-gray-700 flex items-center">
              JWT: <span className="font-semibold ml-2">{jwt ? 'JWT Created' : 'No JWT created yet'}</span>
              <Tippy content="A JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties.">
                <FontAwesomeIcon icon={faInfoCircle} className="ml-2 text-blue-600 cursor-pointer" />
              </Tippy>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6">
            <button
              onClick={handleWalletConnect}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 ${
                walletAddress ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={!!walletAddress}
            >
              <FontAwesomeIcon icon={faWallet} className="mr-2" />
              {walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
            </button>

            <button
              onClick={handleDisconnectWallet}
              className={`w-full bg-red-600 text-white py-2 px-4 rounded-md shadow hover:bg-red-700 ${
                !walletAddress ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={!walletAddress}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Disconnect Wallet
            </button>

            <button
              onClick={handleCreateDID}
              className={`w-full bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 ${
                !walletAddress ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={!walletAddress}
            >
              <FontAwesomeIcon icon={faIdCard} className="mr-2" />
              Create DID
            </button>

            <button
              onClick={handleSignData}
              className={`w-full bg-yellow-600 text-white py-2 px-4 rounded-md shadow hover:bg-yellow-700 ${
                !did ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={!did}
            >
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              Sign Data with DID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DidManagementPage;
