"use client"

import { useState, useEffect } from 'react';

import { FaHeartbeat } from "react-icons/fa";

import { useWearable } from '../context/WearableContext';

import "bootstrap/dist/css/bootstrap.min.css";
import "./page.css";

export default function HeartRateChart(){
  const [patientHeartRate, setPatientHeartRate] = useState('');
  const [, setError] = useState('');

  const { wearable_id } = useWearable();
  const { setWearable_id } = useWearable();

  const handleFetchPatientHeartRate = async () => {
    setError("");  // Reset error before fetching

    if (!wearable_id) {
      setError("Wearable ID error.");
      
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patient-heartrate`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id,  
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setPatientHeartRate("");
        
        throw new Error(data.error || "Failed to fetch heart rate data.");
      }

      setPatientHeartRate(data.patientHeartRate);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);

      console.error(err);
    }
  };

  useEffect(() => {
    if (wearable_id === -1) {
      return;
    }
    
    // Fetch heart rate 
    handleFetchPatientHeartRate();

    // Set interval to fetch heart rate every 3 seconds 
    const intervalId = setInterval(handleFetchPatientHeartRate, 3000);

    return () => clearInterval(intervalId);
  }, [wearable_id]); 

  return(
    <div className="heartrate-box">
      <FaHeartbeat size={45} />
      <p className="heartrate-title fw-semibold">Heart Rate</p>
      <p className="heartrate-bpm fw-semibold">{patientHeartRate || "..."} BPM</p>
      <p className="heartrate-summary fw-semibold">
        <em>
          *Note: This heart rate reading shows the patient&apos;s current pulse. To understand what a healthy heart rate range is, please consult these <a href="https://www.ncbi.nlm.nih.gov/books/NBK593193/table/ch1survey.T.normal_heart_rate_by_age/" target="_blank">guidelines</a> for proper interpretation.
        </em>
      </p>
    </div>
  );
};