// client/src/firebaseConfig.js

// 1. Import the functions we actually need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // We need this for authentication

// 2. Your web app's Firebase configuration - this looks correct.
const firebaseConfig = {
  apiKey: "AIzaSyB6a8nAjd1HoVOwyQEdXLAAq8h5Lqeoj_4",
  authDomain: "blood-donation-app-ecc80.firebaseapp.com",
  projectId: "blood-donation-app-ecc80",
  storageBucket: "blood-donation-app-ecc80.appspot.com", // Corrected this line
  messagingSenderId: "230723023268",
  appId: "1:230723023268:web:216bc16d08261807a1d131",
  measurementId: "G-4LRXT3F8SD"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Initialize Firebase Authentication and export it.
// We are removing the 'analytics' part as it's not needed for our app's functionality.
export const auth = getAuth(app);