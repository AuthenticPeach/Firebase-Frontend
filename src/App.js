import React, { useEffect, useState } from 'react';
import { database } from './firebase';
import { ref, onValue } from 'firebase/database';
import './App.css';

function App() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [gasLevel, setGasLevel] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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
        if (getTemperatureStatus(Temperature) === 'poor') {
          outOfBoundsSensors.push('Temperature');
        }
        if (getHumidityStatus(Humidity) === 'poor') {
          outOfBoundsSensors.push('Humidity');
        }
        if (getGasStatus(Gas) === 'poor') {
          outOfBoundsSensors.push('Gas Level');
        }

        if (outOfBoundsSensors.length > 0) {
          notifyUser(outOfBoundsSensors);
        }
      }
    });
  }, []);

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

  function notifyUser(sensors) {
    const sensorList = sensors.join(', ');
    window.alert(`Warning: The following sensor(s) are in the "poor" range: ${sensorList}`);
  }

  return (
    <div className="app-container">
      <h1>Clean My Air Sensor Data</h1>
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
