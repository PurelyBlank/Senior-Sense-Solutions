"use client"

import { useState, useEffect } from 'react';

import { FiBell } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { CgDanger } from "react-icons/cg";
import { MdOutlineMonitorHeart } from "react-icons/md";

import { useWearable } from '../context/WearableContext';

import "./NotificationChart.css"

export default function NotificationChart() {
  const [heartRateData, setHeartRateData] = useState<null | Array<{
    patient_name: string,
    heart_rate: string,
    timestamp: string,
  }>>(null);
  const [fallData, setFallData] = useState<null | Array<{
    patient_name: string,
    timestamp: string,
    longitude: number,
    latitude: number,
  }>>(null);

  // Fetch all patients' heart rate data for current caretaker user
  const fetchHeartRateData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/heart-rate-alert`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.heartRates && data.heartRates.length > 0) {
        setHeartRateData(data.heartRates);

      } else {
        setHeartRateData(null);
      }
    } catch (err) {
      setHeartRateData(null);

      console.error("Fall alert fetch error:", err);
    }
  };

  // Fetch all patients' fall data for current caretaker user
  const fetchFallData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/fall-alert`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // If there are fall notifications, set the state
      if (data.falls && data.falls.length > 0) {
        setFallData(data.falls);

      } else {
        setFallData(null); // No fall alerts
      }

    } catch (err) {
      setFallData(null);

      console.error("Fall alert fetch error:", err);
    }
  };

  useEffect(() => {
    // Fetch heart rate data
    fetchHeartRateData();

    // Fetch fall data
    fetchFallData();

    // Set interval to fetch heart rate/fall data every 3 seconds 
    const intervalId = setInterval(() => {
      fetchHeartRateData();
      fetchFallData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []); 

  // Helper function to generate heart rate alerts for all patients
  const getHeartRateAlerts = () => {
    if (!heartRateData) {
      return []
    };
    console.log("Heart rate data:", heartRateData);
    return heartRateData
      .map(hr => {
        const value = parseFloat(hr.heart_rate);
        if (isNaN(value)) return null;
        if (value <= 80) {
          return {
            patient_name: hr.patient_name,
            summary: `Too low: ${value} BPM`,
            timestamp: hr.timestamp,
          };
        } else if (value >= 100) {
          return {
            patient_name: hr.patient_name,
            summary: `Too high: ${value} BPM`,
            timestamp: hr.timestamp,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const heartRateAlerts = getHeartRateAlerts();

  return (
    <div className="notifications-box">
      <p className="fw-semibold">Notifications</p>
      <p className="abnormality-text">Abnormality Alerts</p>

      { /*Notification Rows*/ }
      <div className="notifications-details">
        {heartRateAlerts.map((alert, idx) => (
          <div key={idx} className="notifications-row">
            <MdOutlineMonitorHeart size={20} />
            <div className="notifications-text">
              <span className="notifications-title">{alert!.patient_name} - Heart Rate</span>
              <span className="notifications-summary">
                {alert!.summary}
                <br />
                {alert!.timestamp && (
                  <span>
                    Detected at {new Date(alert!.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}

        {fallData && fallData.length > 0 && fallData.map((fall, index) => (
          <div key={index} className="notifications-row">
            <CgDanger size={20} />
            <div className="notifications-text">
              <span className="notifications-title">{fall.patient_name} - Fall Detected</span>
              <span className="notifications-summary">
                Fall detected at {new Date(fall.timestamp).toLocaleTimeString()}
                <br />
                Located at ({fall.latitude.toFixed(4)}, {fall.longitude.toFixed(4)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};