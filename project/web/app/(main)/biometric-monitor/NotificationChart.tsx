"use client"

import { FiBell } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import "./NotificationChart.css"

export default function NotificationChart(){
    const [patientHeartRate, setPatientHeartRate] = useState('');
    const [, setError] = useState('');

    const handleFetchPatientHeartRate = async () => {
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
      if (!data.patientHeartRate) {
        throw new Error("Caretaker first name not found in response.");
      }

      setPatientHeartRate(data.patientHeartRate);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);

      console.error(err);
    }
  };

  useEffect(() => {
    // Fetch heart rate 
    handleFetchPatientHeartRate();

    // Set interval to fetch heart rate every 3 seconds 
    const intervalId = setInterval(handleFetchPatientHeartRate, 3000);

    return () => clearInterval(intervalId);
  }, []); 

    return(
        <div className="notifications-box">
            <p className="fw-semibold">Notifications</p>
            <p className="abnormality-text">Abnormality Alerts</p>

            { /*Notification Rows*/ }
            <div className="notifications-details">

                <div className="notifications-row">
                    <FiBell size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Missed Pill</span>
                        <span className="notifications-summary">Medicine A at 2pm</span>
                    </div>
                </div>

                <div className="notifications-row">{/*copy over heartrate fetch and set a switch, only send alert if 80below or 100above*/}
                    <IoPersonOutline size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Heart Rate</span>
                        <span className="notifications-summary">{ patientHeartRate || "..." } BPM</span>
                    </div>
                </div>

                <div className="notifications-row">{/*create endpoints and requests to get coords from database*/}
                    {/*set up only send alert if person fallen and show location coords*/}
                    <IoPersonOutline size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Accelerometer</span>
                        <span className="notifications-summary">A drop 2 min ago, check in with the patient</span>
                    </div>
                </div>
                
            </div>
        </div>
    )
}