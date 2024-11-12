// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

function App() {
  const { currentUser } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const userItemsCollection = collection(db, 'users', currentUser.uid, 'items');
    const q = query(userItemsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addItem = async () => {
    const userItemsCollection = collection(db, 'users', currentUser.uid, 'items');
    await addDoc(userItemsCollection, {
      name: `Item ${items.length + 1}`,
      createdAt: new Date(),
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert('Logged out successfully!');
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '20px' }}>
        <SignUp />
        <Login />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {currentUser.email}</h1>
      <button onClick={handleLogout}>Logout</button>
      <h2>Your Items</h2>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
