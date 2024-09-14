// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, initializeAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4VAOKsD6Q_nQ6TSf1ksBN4WUwP7IndYo",
  authDomain: "japan-job-d6cfc.firebaseapp.com",
  projectId: "japan-job-d6cfc",
  storageBucket: "japan-job-d6cfc.appspot.com",
  messagingSenderId: "476799589480",
  appId: "1:476799589480:android:c5266ef6a24a904efcefdd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with browser persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

// Alternatively, you can use getAuth for simpler cases
// const auth = getAuth(app);
// auth.setPersistence(browserLocalPersistence);

const db = getFirestore(app);

const userRef = collection(db, "users");
const roomRef = collection(db, "rooms");

export { auth, db, userRef, roomRef };
