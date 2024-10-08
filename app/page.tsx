'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  signInWithGoogle,
  signInWithEmailPassword,
  createAccountWithEmailPassword,
} from '@/utilities/firebaseClient';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const PartnerPortal: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Current authenticated user
  const [email, setEmail] = useState<string>(''); // Email for sign-in/registration
  const [password, setPassword] = useState<string>(''); // Password for sign-in/registration
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error handling

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
      if (authUser) {
        setUser(authUser);
        // After showing welcome message, redirect to /home after a delay (e.g., 3 seconds)
        setTimeout(() => {
          window.location.href = '/home'; // Redirect to /home
        }, 3000);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      await signOut(getAuth());
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-xl shadow-lg">
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

        {!user ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800">Sign in to your account</h2>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-black py-3 px-4 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg"
            >
              <Image src="/google-logo.png" alt="Google Logo" width={24} height={24} className="mr-3" />
              Sign in with Google
            </button>

            {/* OR Separator */}
            <div className="flex items-center justify-center space-x-2">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="text-gray-500">OR</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>

            {/* Email/Password Sign In */}
            <div className="space-y-4">
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
                Sign in with Email / Password
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
              Welcome, {user.displayName || user.email} {/* Greeting the user */}
            </h2>

            {/* Show a loading indicator before redirecting */}
            <div className="flex justify-center items-center mt-4">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p className="text-indigo-600 ml-3">Redirecting to dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPortal;
