// src/App.js
import React, { useEffect, useState } from 'react';
import { database } from './firebase';
import { ref, onValue } from 'firebase/database';
import './App.css';


function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const itemsRef = ref(database, 'a');

    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const itemList = data ? Object.entries(data).map(([key, value]) => ({ id: key, name: value })) : [];
      setItems(itemList);
    });
  }, []);

  return (
    <div className="app-container">
      <h1>Clean My Air Sensor Data</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
