import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyAorqBuDOHoWQsTS-nnPvwPwz8FJPJEEFk",
  authDomain: "distlepp.firebaseapp.com",
  projectId: "distlepp",
  storageBucket: "distlepp.appspot.com",
  messagingSenderId: "511537719442",
  appId: "1:511537719442:web:cb7af6fcc73afd2938de4b"
}

// Initialize Firebase.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db }