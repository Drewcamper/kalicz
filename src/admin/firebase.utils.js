import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBt8vbMoZUBnh7ArZ5x0hi75OUfoSzbQVs',
  authDomain: 'kalicz-d9692.firebaseapp.com',
  projectId: 'kalicz-d9692',
  storageBucket: 'kalicz-d9692.appspot.com',
  messagingSenderId: '650454744169',
  appId: '1:650454744169:web:bb690eaab0206159a0b6f8',
  measurementId: 'G-8Z3DTS5PGX"',
};

const firebaseApp = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: 'select_account ',
});
export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
