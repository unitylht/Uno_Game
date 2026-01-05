import { getApps, getApp, initializeApp } from "firebase/app";
import {
  Timestamp,
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(config);
const db = getFirestore(app);
const emulatorHost =
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ||
  process.env.FIRESTORE_EMULATOR_HOST;

if (emulatorHost && typeof window !== "undefined") {
  const [host, portString] = emulatorHost.split(":");
  const port = parseInt(portString, 10) || 8080;
  try {
    connectFirestoreEmulator(db, host, port);
    // eslint-disable-next-line no-console
    console.info(
      `Using Firestore emulator at ${host}:${port} (set via FIRESTORE_EMULATOR_HOST).`
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to Firestore emulator:", err);
  }
}

export default db;
export { Timestamp };
