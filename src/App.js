import React, { useEffect, useState, useCallback } from 'react';
import { database } from './firebase';
import { ref, onValue, set, get } from 'firebase/database';
import './App.css';

function App() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [gasLevel, setGasLevel] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notifiedSensors, setNotifiedSensors] = useState({}); // Track notified sensors

  const checkMaintenanceReset = useCallback(async () => {
    const maintenanceRef = ref(database, 'Maintenance');
    const snapshot = await get(maintenanceRef);
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (!snapshot.exists() || now - snapshot.val() >= oneWeekInMs) {
      showNotification('Maintenance Reset: Performing a scheduled reset.');
      set(maintenanceRef, now); // Update the timestamp for the last maintenance reset
    }
  }, []); // No dependencies, so it won't recreate unnecessarily

  useEffect(() => {
    const sensorsRef = ref(database, 'Sensors');

    onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const { Temperature, 'Humidity Sensor': Humidity, 'Gas Sensor': Gas } = data;
        setTemperature(Temperature);
        setHumidity(Humidity);
        setGasLevel(Gas);
        setLastUpdated(new Date().toLocaleString());

        // Check for poor readings and notify
        const outOfBoundsSensors = [];
        const newNotifiedSensors = { ...notifiedSensors };

        if (getTemperatureStatus(Temperature) === 'poor' && !notifiedSensors['Temperature']) {
          outOfBoundsSensors.push('Temperature');
          newNotifiedSensors['Temperature'] = true; // Mark as notified
        } else if (getTemperatureStatus(Temperature) !== 'poor') {
          newNotifiedSensors['Temperature'] = false; // Reset notification state
        }

        if (getHumidityStatus(Humidity) === 'poor' && !notifiedSensors['Humidity']) {
          outOfBoundsSensors.push('Humidity');
          newNotifiedSensors['Humidity'] = true;
        } else if (getHumidityStatus(Humidity) !== 'poor') {
          newNotifiedSensors['Humidity'] = false;
        }

        if (getGasStatus(Gas) === 'poor' && !notifiedSensors['Gas Level']) {
          outOfBoundsSensors.push('Gas Level');
          newNotifiedSensors['Gas Level'] = true;
        } else if (getGasStatus(Gas) !== 'poor') {
          newNotifiedSensors['Gas Level'] = false;
        }

        setNotifiedSensors(newNotifiedSensors);

        if (outOfBoundsSensors.length > 0) {
          showNotification(`Warning: The following sensor(s) are in the "poor" range: ${outOfBoundsSensors.join(', ')}`);
        }
      }
    });

    checkMaintenanceReset(); // Check if it's time for a maintenance reset
  }, [notifiedSensors, checkMaintenanceReset]); // Add checkMaintenanceReset to the dependency array

  function getTemperatureStatus(temp) {
    if (temp === null) return '';
    if (temp >= 59 && temp <= 77) {
      return 'good';
    } else if ((temp >= 50 && temp < 59) || (temp > 77 && temp <= 86)) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }

  function getHumidityStatus(hum) {
    if (hum === null) return '';
    if (hum < 20) {
      return 'good';
    } else if (hum >= 20 && hum <= 40) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }

  function getGasStatus(gas) {
    if (gas === null) return '';
    if (gas < 200) {
      return 'good';
    } else if (gas >= 200 && gas <= 400) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }

  function showNotification(message) {
    setNotification(message);
  }

  function closeNotification() {
    setNotification(null);
  }

  return (
    <div className="app-container">
      <h1>Clean My Air Sensor Data</h1>
      {notification && (
        <div className="notification">
          <span>{notification}</span>
          <button className="close-btn" onClick={closeNotification}>×</button>
        </div>
      )}
      <div className="sensor-container">
        <div className={`sensor-card ${getTemperatureStatus(temperature)}`}>
          <h2>Temperature</h2>
          <p>{temperature !== null ? `${temperature}°F` : 'Loading...'}</p>
        </div>
        <div className={`sensor-card ${getHumidityStatus(humidity)}`}>
          <h2>Humidity</h2>
          <p>{humidity !== null ? `${humidity}%` : 'Loading...'}</p>
        </div>
        <div className={`sensor-card ${getGasStatus(gasLevel)}`}>
          <h2>Gas Level</h2>
          <p>{gasLevel !== null ? `${gasLevel} ppm` : 'Loading...'}</p>
        </div>
      </div>
      <div className="last-updated">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
}

export default App;
