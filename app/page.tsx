'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  auth,
  signInWithGoogle,
  signInWithEmailPassword,
  createAccountWithEmailPassword,
  listenToTransactions,
  pushAiInsights,
} from '@/utilities/firebaseClient'; // Assuming firebaseClient.ts is in the same directory
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const PartnerPortal: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Current authenticated user
  const [email, setEmail] = useState<string>(''); // Email for sign-in/registration
  const [password, setPassword] = useState<string>(''); // Password for sign-in/registration
  const [transactions, setTransactions] = useState<any[]>([]); // Transactions data
  const [insights, setInsights] = useState<any>(null); // AI insights
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error handling

  useEffect(() => {
    // Check if the user is already authenticated
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
      if (authUser) {
        setUser(authUser);
        fetchTransactions();
        fetchInsights();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchTransactions = () => {
    listenToTransactions((data) => {
      if (data) {
        setTransactions(data);
      }
    });
  };

  const fetchInsights = async () => {
    if (user) {
      try {
        const insightData = await pushAiInsights({
          userAddress: user.email,
          insights: 'Fetching latest insights from Turnqey',
          timestamp: Date.now(),
        });
        setInsights(insightData);
      } catch (err) {
        setError('Failed to fetch insights');
        console.error('Error fetching insights:', err);
      }
    }
  };

  // Sign in using Google
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Sign in using email/password
  const handleEmailSignIn = async () => {
    try {
      setLoading(true);
      await signInWithEmailPassword(email, password);
    } catch (err) {
      console.error('Error signing in with email/password:', err);
      setError('Email sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Create account using email/password
  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      await createAccountWithEmailPassword(email, password);
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        {/* Partner Branding */}
        <div className="text-center">
          <Image
            src="/401header.jpg" // Replace with correct path for the uploaded partner logo
            alt="Partner Branding Logo"
            width={350}
            height={150}
            className="mx-auto mb-4 rounded"
          />
        </div>

        {/* Sign-in Options */}
        {!user ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">Sign in to your account</h2>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-black py-3 px-4 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg"
            >
              <Image src="/google-logo.png" alt="Google Logo" width={24} height={24} className="mr-3" />
              Sign in with Google
            </button>

            {/* Email/Password Sign In */}
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleEmailSignIn}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg"
              >
                Sign in with Email/Password
              </button>
              <button
                onClick={handleCreateAccount}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg mt-2"
              >
                Create an Account
              </button>
            </div>

            {error && <p className="text-red-600 text-center mt-4">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Welcome, {user.displayName || user.email}
            </h2>
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-700 text-white py-3 px-4 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg"
            >
              Sign Out
            </button>

            {/* Placeholder for Data Visualization */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Your Transactions</h3>
              {transactions.length > 0 ? (
                <ul className="space-y-2">
                  {transactions.map((tx, index) => (
                    <li
                      key={index}
                      className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <p><strong>Type:</strong> {tx.type}</p>
                      <p><strong>Amount:</strong> {tx.usdAmount} USD</p>
                      <p><strong>Date:</strong> {tx.timestamp}</p>
                      <p><strong>IDAC Score:</strong> {tx.thirdPartyIdacScore}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No transactions found.</p>
              )}
            </div>

            {/* Placeholder for AI Insights */}
            {insights && (
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">AI Insights</h3>
                <p className="text-gray-700">{insights.insights}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPortal;
