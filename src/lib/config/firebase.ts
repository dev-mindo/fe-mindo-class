// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmbhO98wWrPzxhLVLtYyiZ9kE9dmCLSM0",
  authDomain: "classroom-eb730.firebaseapp.com",
  projectId: "classroom-eb730",
  storageBucket: "classroom-eb730.firebasestorage.app",
  messagingSenderId: "103855404571",
  appId: "1:103855404571:web:713360de6a363678472abe",
  measurementId: "G-3GCW7Z3RZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Dapatkan instance Firestore
const firebaseDB = getFirestore(app);

// Ekspor instance untuk digunakan di aplikasi Anda
export { firebaseDB, app };