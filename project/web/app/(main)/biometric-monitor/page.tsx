"use client";

import { useState, useEffect } from 'react';

import Link from "next/link";

import { CgProfile } from "react-icons/cg";
import { FiBell } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { FaHeartbeat } from "react-icons/fa";
import { MdOutlineBloodtype } from "react-icons/md";

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

import "bootstrap/dist/css/bootstrap.min.css";
import "./homepage.css";

export default function HomePage() {
  const [isAddPatient, setIsAddPatient] = useState(false);
  const [isRemovePatient, setIsRemovePatient] = useState(false);

  const [patient, setPatient] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [caretakerName, setCaretakerName] = useState('');
  const [, setError] = useState('');

  const handleRemovePatient = () => {
    setIsRemovePatient(true);
  }

  const handleRemoveCancel = () => {
    setIsRemovePatient(false);
  }

  const handleAddPatient = () => {
    setIsAddPatient(true);
  }

  const handleSubmit = () => {
    setIsAddPatient(false);
  }

  const handleCancel = () => {
    setIsAddPatient(false);
  }

  const handlePatientChange = (event: SelectChangeEvent) => {
    setPatient(event.target.value as string);
  };

  const handleGenderChange = (event: SelectChangeEvent) => {
    setGender(event.target.value as string);
  };

  const handleAgeChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const handleHeightChange = (event: SelectChangeEvent) => {
    setHeight(event.target.value as string);
  };

  const handleWeightChange = (event: SelectChangeEvent) => {
    setWeight(event.target.value as string);
  };

  const handleFetchCaretakerName = async () => {
    setError("");  // Reset error before fetching
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      console.log("Fetching with authentication token:", token);
  
      const response = await fetch("http://localhost:5000/api/biometric-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Response data:", data);

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
        <PatientComponent/>

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