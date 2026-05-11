
import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  projectId: 'studio-3395735924-b7ebc',
  appId: '1:462682397444:web:83fcfdf17951f6413cce51',
  apiKey: 'AIzaSyC5DgMIj1FMaCmsTZo8-iZykwmx_GItAO8',
  authDomain: 'studio-3395735924-b7ebc.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '462682397444',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
