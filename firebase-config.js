// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, getDoc, setDoc, serverTimestamp, Timestamp, limit } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2ZY5kTnA6DksUc7M1eSACZ0mnfbM9WSs",
    authDomain: "pibno-3aff5.firebaseapp.com",
    projectId: "pibno-3aff5",
    storageBucket: "pibno-3aff5.firebasestorage.app",
    messagingSenderId: "519391541778",
    appId: "1:519391541778:web:692493c5ede547e53e76cb",
    measurementId: "G-NC32RGQW8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Configurar persistência de sessão (manter login após recarregar)
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Erro ao configurar persistência:', error);
});

// Exportar serviços
export { 
    app, 
    auth, 
    db, 
    storage, 
    analytics,
    // Auth functions
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    // Firestore functions
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    getDoc,
    setDoc,
    serverTimestamp,
    Timestamp,
    limit,
    // Storage functions
    ref,
    uploadBytes,
    getDownloadURL
};
