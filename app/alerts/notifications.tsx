import React, { useState, useEffect } from "react";
import {
  pushAiInsights,
  triggerEmailNotification,
  getUserNotificationPreferences,
  saveUserNotificationPreferences,
} from "@/utilities/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const Notifications: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [notificationEmail, setNotificationEmail] = useState<string>(""); // Editable email input
  const [alerts, setAlerts] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null); // User's email from Firebase
  const [userUID, setUserUID] = useState<string | null>(null); // UID for each user

  const [notificationPreferences, setNotificationPreferences] = useState({
    generalUpdates: false,
    securityAlerts: false,
    walletSync: false,
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserUID(user.uid);

        // Pre-fill the email input with the user's email address
        setNotificationEmail(user.email || "");

        getUserNotificationPreferences(user.uid).then((preferences) => {
          if (preferences) {
            setWalletAddress(preferences.walletAddress || "");
            setNotificationPreferences(preferences.notificationPreferences || {});
          }
        });
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleChange = (preference: keyof typeof notificationPreferences) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setNotificationPreferences((prev) => {
        const updatedPreferences = {
          ...prev,
          [preference]: !prev[preference],
        };

        saveUserNotificationPreferences(user.uid, updatedPreferences, walletAddress);
        return updatedPreferences;
      });
    }
  };

  const handleMonitorAddress = async () => {
    if (!walletAddress) {
      setAlerts((prevAlerts) => [...prevAlerts, "Please enter a wallet address."]);
      return;
    }

    if (!notificationEmail) {
      setAlerts((prevAlerts) => [...prevAlerts, "Please enter an email address for notifications."]);
      return;
    }

    try {
      const response = await fetch("/api/agents_security_check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_name: "SmartAgent",
          address: walletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to monitor the address.");
      }

      const data = await response.json();

      if (data.dusting_patterns && data.dusting_patterns.length > 0) {
        setAlerts((prevAlerts) => [...prevAlerts, "Dusting patterns detected on your wallet."]);
        triggerEmailNotification(
          "Dusting detected on your wallet",
          "We found dusting patterns in your monitored wallet.",
          notificationEmail
        );
      } else {
        setAlerts((prevAlerts) => [...prevAlerts, "No dusting patterns found. Your wallet is safe."]);
      }

      await pushAiInsights({
        userAddress: walletAddress,
        insights: "Monitoring insights were generated.",
        timestamp: Date.now(),
      });
    } catch (error) {
      setAlerts((prevAlerts) => [...prevAlerts, "Failed to monitor the address. Please try again."]);
      console.error("Error monitoring address:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center text-center p-6">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-500 mt-2">View and manage your alerts and preferences here.</p>
        </div>

        {/* Notification Center Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">Your Notifications</h2>
          <ul className="space-y-4 mt-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <li
                  key={index}
                  className="bg-blue-100 text-blue-700 p-4 rounded-md shadow-md flex items-start"
                >
                  <FontAwesomeIcon
                    icon={alert.includes("safe") ? faCheck : faTimes}
                    className="mr-4 text-lg"
                  />
                  <div>
                    <p className="font-semibold">{alert}</p>
                    <small className="text-gray-500">Timestamp</small>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-700">You have no new notifications.</p>
            )}
          </ul>
        </div>

        {/* Notification Management Section */}
        <div className="space-y-4 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Manage Notifications</h2>
          </div>

          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faBell} className="text-4xl text-blue-600 mb-4" />
            <div className="w-full">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter Wallet Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="w-full mt-4">
              <input
                type="email"
                value={notificationEmail} // Pre-fill the email with the user's email
                onChange={(e) => setNotificationEmail(e.target.value)} // Allow user to edit the email
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
              <Tippy content="We'll send notifications to this email.">
                <FontAwesomeIcon icon={faInfoCircle} className="ml-2 text-blue-600 cursor-pointer" />
              </Tippy>
            </div>
          </div>

          {/* Toggle switches for selecting notification preferences */}
          <div className="flex flex-col items-center mt-6">
            <h2 className="text-lg font-bold mb-4">Notification Preferences</h2>
            <div className="grid grid-cols-1 gap-4 w-full">
              {Object.keys(notificationPreferences).map((item) => (
                <label
                  key={item}
                  className="flex items-center justify-between w-full px-4 py-2 border rounded-md shadow"
                >
                  <span className="font-medium text-gray-900">
                    {item.replace(/([A-Z])/g, " $1")}
                  </span>
                  <input
                    type="checkbox"
                    checked={notificationPreferences[item as keyof typeof notificationPreferences]}
                    onChange={() => handleToggleChange(item as keyof typeof notificationPreferences)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6">
            <button
              onClick={handleMonitorAddress}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition"
            >
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
