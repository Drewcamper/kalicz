
import { initializeApp } from "firebase/app";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBt8vbMoZUBnh7ArZ5x0hi75OUfoSzbQVs",
  authDomain: "kalicz-d9692.firebaseapp.com",
  projectId: "kalicz-d9692",
  storageBucket: "kalicz-d9692.appspot.com",
  messagingSenderId: "650454744169",
  appId: "1:650454744169:web:bb690eaab0206159a0b6f8",
  measurementId: "G-8Z3DTS5PGX"
};

const app = initializeApp(firebaseConfig);
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// Initialize Firebase Auth provider
const provider = new GoogleAuthProvider();
  
// whenever a user interacts with the provider, we force them to select an account
provider.setCustomParameters({   
    prompt : "select_account "
});
export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);