"use client";

import { useState, useEffect } from 'react';

import NotificationChart from './NotificationChart';
import StepCounterChart from './StepCounterChart';
import HeartRateChart from './HeartRateChart';
import PatientInfo from '../components/patient-component/PatientComponent';
import PatientDropdown from '../components/patient-component/PatientDropdown';

import "bootstrap/dist/css/bootstrap.min.css";
import "./page.css";

export default function HomePage() {
  const [isRemovePatient, setIsRemovePatient] = useState(false);
  const [caretakerName, setCaretakerName] = useState('');
  const [, setError] = useState('');

  const handleRemoveCancel = () => {
    setIsRemovePatient(false);
  }

  // Fetch user's first name for "Welcome back, ..." text
  const handleFetchCaretakerName = async () => {
    setError("");  // Reset error before fetching
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/caretaker-firstname`;

      const response = await fetch(apiUrl, {
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
    <div className="biometric-container">
      {isRemovePatient && <div className="overlay"></div>}
      <h1 className="display-7 fw-semibold">Welcome back, {caretakerName || "Caretaker"}.</h1>

      {/* Main Content */}
      <div className="content-container">

        {/* Patient Container */}
        <div className = "PatientInfoContainer">
          <PatientInfo/>
        </div>
        <div className="right-container">
          <NotificationChart/>
          <div className = "biometric-charts">
            <HeartRateChart/>
            <StepCounterChart/> 
          </div>
        </div>
        <div className = "patient-dropdown-container">
          <PatientDropdown/>
        </div>
      </div>

      {isRemovePatient && (
        <div className="center-remove-box">
          <p className="title-bold">Are you sure?</p>
          <p className="subtext-gray">This action cannot be undone. This will permanently delete the patient and all associated data.</p>
          <button type='button' className='cancel-button' onClick={handleRemoveCancel}>Cancel</button>
          <button type='button' className='save-button' onClick={handleRemoveCancel}>Continue</button>
        </div>
      )}
    </div>
  );
}