"use client";

import { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "./homepage.css";
import NotificationChart from './NotificationChart';
import HeartOxygenCharts from './HeartOxygenCharts';
import PatientInfo from './PatientComponent';

export default function HomePage() {
  const [isRemovePatient, setIsRemovePatient] = useState(false);
  const [caretakerName, setCaretakerName] = useState('');
  const [, setError] = useState('');

  const handleRemoveCancel = () => {
    setIsRemovePatient(false);
  }


  const handleFetchCaretakerName = async () => {
    setError("");  // Reset error before fetching
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const response = await fetch("http://localhost:5000/api/biometric-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch caretaker name.");
      }
      if (!data.caretakerName) {
        throw new Error("Caretaker first name not found in response.");
      }

      setCaretakerName(data.caretakerName);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);
    }
  };
  
  // Call the function on component mount or as needed
  useEffect(() => {
    handleFetchCaretakerName();
  }, []);

  return (
    <div className="main-container container p-3">
      {isRemovePatient && <div className="overlay"></div>}
      <h1 className="display-7 fw-semibold">Welcome back, {caretakerName || "Caretaker"}.</h1>
      {/* Main Content */}
      <div className="content-container">
        {/* Patient Container */}
        <PatientInfo/>

        <div className="right-container">
          <NotificationChart/>
          <HeartOxygenCharts/>
        </div>

      </div>
      {isRemovePatient && (
        <div className="center-remove-box">
          <p className="title-bold">Are you absolutely sure?</p>
          <p className="subtext-gray">This action cannot be undone. This will permanently delete the patient and associated data.</p>
          <button type='button' className='cancel-button' onClick={handleRemoveCancel}>Cancel</button>
          <button type='button' className='save-button' onClick={handleRemoveCancel}>Continue</button> {/*Will change to work with backend*/}
        </div>
      )}
    </div>
  );
}