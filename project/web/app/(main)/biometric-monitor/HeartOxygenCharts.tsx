"use client"
import { FaHeartbeat } from "react-icons/fa";
import { MdOutlineBloodtype } from "react-icons/md";
import { useState, useEffect } from 'react';


export default function HeartOxygenCharts(){
    const [heartRate_patient, setHeartRate_patient] = useState('');
    const [bloodOxygen_patient, setBloodOxygen_patient] = useState('');

    const [, setError] = useState('');
  
    const handleFetchPatientHeartRate = async () => {
      setError("");  // Reset error before fetching
    
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }
    
        const response = await fetch("http://localhost:5000/api/patient-heartrate", {
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
        setBloodOxygen_patient(data.bloodOxygen_patient);

  
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred.";
        setError(errorMessage);
        console.error(err);
      }
    };
    
  
    // Call the function on component mount or as needed
    useEffect(() => {
        // Fetch heart rate immediately on mount
        handleFetchPatientHeartRate();
    
        // Set interval to fetch heart rate every 5 seconds (3000ms)
        const intervalId = setInterval(handleFetchPatientHeartRate, 3000);
    
        // Cleanup the interval when the component unmounts
        return () => clearInterval(intervalId);
      }, []); // Empty dependency array means this only runs once on mount
    

    return(
        <div className="bottom-container">
            {/* Heart Rate Box */}
            <div className="heartrate-box">
                <FaHeartbeat size={45} />
                <p className="heartrate-title fw-semibold">Heart Rate</p>
                <p className="heartrate-bpm fw-semibold">{heartRate_patient || "Loading"} BPM</p>
                <p className="heartrate-summary fw-semibold">↑ Higher than average</p>
            </div>

            {/* Blood Oxygen Box */}
            <div className="bloodoxygen-box">
                <MdOutlineBloodtype size={45} />
                <p className="bloodoxygen-title fw-semibold">Blood Oxygen</p>
                <p className="bloodoxygen-percentage fw-semibold">{bloodOxygen_patient || "Loading"} %</p>
                <p className="bloodoxygen-summary fw-semibold">↓ Lower than average</p>
            </div>
        </div>
    )
}