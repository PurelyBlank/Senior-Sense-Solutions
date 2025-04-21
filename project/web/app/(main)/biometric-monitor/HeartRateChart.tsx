"use client"

import { FaHeartbeat } from "react-icons/fa";
import { useState, useEffect } from 'react';

export default function HeartRateChart(){
    const [heartRate_patient, setHeartRate_patient] = useState('');

    const [, setError] = useState('');
  
    const handleFetchPatientHeartRateOxygen = async () => {
      setError("");  // Reset error before fetching
    
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
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch caretaker name.");
        }
        if (!data.heartRate_patient) {
          throw new Error("Caretaker first name not found in response.");
        }
  
        setHeartRate_patient(data.heartRate_patient);

  
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred.";
        setError(errorMessage);
        console.error(err);
      }
    };
    
  
    useEffect(() => {
        // Fetch heart rate 
        handleFetchPatientHeartRateOxygen();
    
        // Set interval to fetch heart rate every 5 seconds 
        const intervalId = setInterval(handleFetchPatientHeartRateOxygen, 5000);
    
        return () => clearInterval(intervalId);
      }, []); 
    

    return(
        <div className="heartrate-box">
            <FaHeartbeat size={45} />
            <p className="heartrate-title fw-semibold">Heart Rate</p>
            <p className="heartrate-bpm fw-semibold">{heartRate_patient || "..."} BPM</p>
            <p className="heartrate-summary fw-semibold">
              <em>
                  *Note: This heart rate reading shows the patient's pulse right now. To understand what a healthy heart rate range is, please refer to the guidelines
                  Please consult the guidelines <a href="https://www.ncbi.nlm.nih.gov/books/NBK593193/table/ch1survey.T.normal_heart_rate_by_age/" target="_blank">link/reference</a> for proper interpretation.
              </em>
            </p>
        </div>
    )
}
