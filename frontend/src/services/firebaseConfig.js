/**
 * SIPESAND Enterprise Firebase & Firestore Configuration
 * Mendukung konfigurasi via Environment Variables (VITE_FIREBASE_*)
 * dengan fallback cloud connector terenkripsi.
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-sipesand-production-key-2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sipesand-enterprise.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sipesand-enterprise",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sipesand-enterprise.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "719283746501",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:719283746501:web:a1b2c3d4e5f6g7h8"
};

export const FIRESTORE_COLLECTIONS = {
  SANTRI: 'santri',
  BILLS: 'bills',
  BILLS_MASTER: 'bills_master',
  POCKET_TX: 'pocket_transactions',
  ACADEMICS: 'academics',
  PERMITS: 'permits',
  LEDGER: 'ledger',
  SETTINGS: 'settings',
  ACCOUNTS: 'accounts'
};

export default firebaseConfig;
