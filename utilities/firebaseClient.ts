import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, push, onValue, get } from 'firebase/database';
import { getFirestore, doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

interface Transaction {
  timestamp: string;
  type: 'Sent' | 'Received';
  cryptocurrency: string;
  thirdPartyIdacScore: number;
  usdAmount: number;
  thirdPartyWallet: string;
}

interface InsightsResponse {
  openAIResponse?: string | null;
  userAddress: string;
  insights: string;
  timestamp: number;
}

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "agents-idefi-ai.firebaseapp.com",
  databaseURL: "https://agents-idefi-ai-default-rtdb.firebaseio.com",
  projectId: "agents-idefi-ai",
  storageBucket: "agents-idefi-ai.appspot.com",
  messagingSenderId: "887501752416",
  appId: "1:887501752416:web:a52b558ccbb1641bb8db05"
};

const app = initializeApp(config);
const auth = getAuth();
const firestore = getFirestore(app);
const database = getDatabase(app);

// Providers
const googleProvider = new GoogleAuthProvider();

// Sign-in functions
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
const signInWithEmailPassword = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
const createAccountWithEmailPassword = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);

// Realtime Database operations

// Store JSON data under the user's UID
const storeJsonData = async (jsonData: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const jsondataRef = ref(database, `users/${user.uid}/jsondata`);
  return push(jsondataRef, jsonData);
};

// Store user-specific transaction data
const pushTransaction = async (transaction: Transaction) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const transactionsRef = ref(database, `users/${user.uid}/transactions`);
  return push(transactionsRef, transaction);
};

// Store flagged addresses under the user
const storeSanctionedAddress = async (sanctionedAddress: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const sanctionedAddressesRef = ref(database, `users/${user.uid}/sanctionedAddresses`);
  return push(sanctionedAddressesRef, sanctionedAddress);
};

// Store AI insights
const pushAiInsights = async (data: InsightsResponse) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const insightsRef = ref(database, `users/${user.uid}/insights`);
  return push(insightsRef, {
    openAIResponse: data.openAIResponse || null,
    timestamp: data.timestamp,
    userAddress: data.userAddress,
    insights: data.insights,
  });
};

// Listen to user-specific transactions
const listenToTransactions = (callback: (data: Transaction[] | null) => void) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const transactionsRef = ref(database, `users/${user.uid}/transactions`);
  onValue(transactionsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data as Transaction[] | null);
  });
};

// Fetch user-specific data (for use in SecurityCheck, etc.)
const fetchDataAndMetrics = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const metricsRef = ref(database, `users/${user.uid}/metrics`);
  const snapshot = await get(metricsRef);
  return snapshot.val();
};

// Trigger email notifications via Firestore collection
const triggerEmailNotification = async (subject: string, messageText: string, email: string) => {
  try {
    const mailCollectionRef = collection(firestore, 'mail');
    const emailData = {
      to: [email],
      message: {
        subject: subject,
        text: messageText,
        html: `<p>${messageText}</p>`,
      },
    };
    await addDoc(mailCollectionRef, emailData);
    console.log("Email notification triggered.");
  } catch (error) {
    console.error("Error triggering email notification:", error);
  }
};


// Fetch user notification preferences from Firestore
const getUserNotificationPreferences = async (uid: string) => {
  const docRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

// Save user notification preferences to Firestore
const saveUserNotificationPreferences = async (
  uid: string | null,
  notificationPreferences: any,
  walletAddress: string
) => {
  if (!uid) return;

  const docRef = doc(firestore, "users", uid);
  await setDoc(docRef, {
    walletAddress,
    notificationPreferences,
  });
};

export {
  app,
  auth,
  signInWithGoogle,
  signInWithEmailPassword,
  createAccountWithEmailPassword,
  pushTransaction,
  listenToTransactions,
  pushAiInsights,
  storeJsonData,
  storeSanctionedAddress,
  fetchDataAndMetrics,
  triggerEmailNotification,
  getUserNotificationPreferences,
  saveUserNotificationPreferences,
};
