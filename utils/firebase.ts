// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuAS3V0_OPqLBwsxkAZ57Yam5JLo_tqKY",
  authDomain: "exam-mind-ai.firebaseapp.com",
  projectId: "exam-mind-ai",
  storageBucket: "exam-mind-ai.firebasestorage.app",
  messagingSenderId: "327325218520",
  appId: "1:327325218520:web:f4c5a3704c49839a94c9ad",
  measurementId: "G-9YJ0EY4CHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
