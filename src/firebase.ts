// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Dodajemy import getAuth
import { getFirestore } from "firebase/firestore"; // Dodajemy import getFirestore (przyda się później)

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqUacTMWjd99BEmPu4cLYKTUt9r9uEGJg",
  authDomain: "storeroom-app-b782d.firebaseapp.com",
  projectId: "storeroom-app-b782d",
  storageBucket: "storeroom-app-b782d.firebasestorage.app",
  messagingSenderId: "877489954324",
  appId: "1:877489954324:web:c8f6be3af0bbe9e5539101",
  measurementId: "G-MBH3L7ZG4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Inicjujemy i eksportujemy Authentication
export const db = getFirestore(app); // Inicjujemy i eksportujemy Firestore (na przyszłość)

export default app; // Eksportujemy domyślną instancję aplikacji
