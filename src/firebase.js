import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDyEk_zWqV0pThv4ptAhheP0Xg6tSEdma4",
    authDomain: "cmpe188-group7.firebaseapp.com",
    databaseURL: "https://cmpe188-group7-default-rtdb.firebaseio.com",
    projectId: "cmpe188-group7",
    storageBucket: "cmpe188-group7.firebasestorage.app",
    messagingSenderId: "201447971795",
    appId: "1:201447971795:web:52b8b1644fa1729af4ed26"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
