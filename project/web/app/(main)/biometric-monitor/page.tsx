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
  const [error, setError] = useState('');

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

  const handleDeviceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceId(e.target.value);
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
        <div className="patient-container container pt-4">
          <p className="dropdown-label">Select Patient</p>
          <FormControl fullWidth size="small" style={{ width: 475 }}>
            <InputLabel id="select-patient">Select</InputLabel>
            <Select
              labelId="select-patient-label"
              id="select-patient"
              label="Patient"
              value={patient}
              onChange={handlePatientChange}
            >
              <MenuItem value={"Bruce Wayne"}>Bruce Wayne</MenuItem>
              <MenuItem value={"Jane Doe"}>Jane Doe</MenuItem>
              <MenuItem value={"Alfred Hitchcock"}>Alfred Hitchcock</MenuItem>
            </Select>
          </FormControl>

          {/* Patient Box */}
          {!isAddPatient ? (
          <div className="patient-box">
            {/* Profile Icon and Patient Name */}
            <CgProfile className="patient-icon" size={95} />
            <span className="patient-name">{patient || "Select a patient"}</span>
            <span className="patient-info">Patient Info</span>

            {/* Patient Details Rows */}
            <div className="patient-details">
              {/* Gender */}
              <div className="detail-row">
                <div className="detail-text">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{gender || "None specified"}</span>
                </div>
                <FormControl size="small" className="detail-dropdown">
                  <InputLabel id="select-gender">Edit</InputLabel>
                  <Select 
                    labelId="select-gender-label" 
                    id="select-gender" 
                    label="Gender" 
                    value={gender} 
                    onChange={handleGenderChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Age */}
              <div className="detail-row">
                <div className="detail-text">
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{age || "None specified"}</span>
                </div>
                <FormControl size="small" className="detail-dropdown">
                  <InputLabel id="select-age">Edit</InputLabel>
                  <Select 
                    labelId="select-age-label"
                    id="select-age"
                    label="Age"
                    value={age}
                    onChange={handleAgeChange}
                  >
                    {[...Array(100)].map((_, i) => (
                      <MenuItem key={i} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Height */}
              <div className="detail-row">
                <div className="detail-text">
                  <span className="detail-label">Height</span>
                  <span className="detail-value">{height || "None specified"}</span>
                </div>
                <FormControl size="small" className="detail-dropdown">
                  <InputLabel id="select-height">Edit</InputLabel>
                  <Select 
                    labelId="select-height-label"
                    id="select-height"
                    label="Height"
                    value={height}
                    onChange={handleHeightChange}
                  >
                    <MenuItem value="5'0">5&apos;0&quot;</MenuItem>
                    <MenuItem value="5'1">5&apos;1&quot;</MenuItem>
                    <MenuItem value="5'2">5&apos;2&quot;</MenuItem>
                    <MenuItem value="5'3">5&apos;3&quot;</MenuItem>
                    <MenuItem value="5'4">5&apos;4&quot;</MenuItem>
                    <MenuItem value="5'5">5&apos;5&quot;</MenuItem>
                    <MenuItem value="5'6">5&apos;6&quot;</MenuItem>
                    <MenuItem value="5'7">5&apos;7&quot;</MenuItem>
                    <MenuItem value="5'8">5&apos;8&quot;</MenuItem>
                    <MenuItem value="5'9">5&apos;9&quot;</MenuItem>
                    <MenuItem value="6'0">6&apos;0&quot;</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Weight */}
              <div className="detail-row">
                <div className="detail-text">
                  <span className="detail-label">Weight</span>
                  <span className="detail-value">{weight || "None specified"}</span>
                </div>
                <FormControl size="small" className="detail-dropdown">
                  <InputLabel id="select-weight">Edit</InputLabel>
                  <Select 
                    labelId="select-weight-label" 
                    id="select-weight"
                    label="Weight"
                    value={weight}
                    onChange={handleWeightChange}
                  >
                    {[...Array(300)].map((_, i) => (
                      <MenuItem key={i} value={i + 50}>
                        {i + 50} lbs
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Remove Patient Button */}
              <button type="button" className="remove-patient-button" onClick={handleRemovePatient}>Remove Patient</button>

              {/* Vertical Line Above Add Patient Button */}
              <div className="vertical-line"></div>

              {/* Add Patient Button */}
              <button type="button" className="add-patient-button" onClick={handleAddPatient}>Add Patient</button>
            </div>
          </div>
          ) : (
            <div className="add-patient-box">
              <h5>Add New Patient</h5>
              <CgProfile className="patient-icon" size={95} />
              {/* Change link to actual destination later */}
              <Link 
                href="/biometric-monitor" 
                className="import-profile-link"
              >
                Import Profile Picture
              </Link>
              <div className="patient-details">
                {/*First name*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">First Name</span>
                  </div>
                  <input
                    className="first-name"
                    placeholder='Enter here'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                {/*Last Name*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">Last Name</span>
                  </div>
                  <input
                    className="last-name"
                    placeholder='Enter here'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                {/*Gender*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">Gender</span>
                  </div>
                  <input
                    className="gender-slot"
                    placeholder='Enter here'
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
                {/*Age*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">Age</span>
                  </div>
                  <input
                    className="age-slot"
                    placeholder='Enter here'
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                {/*Height*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">Height</span>
                  </div>
                  <input
                    className="height-slot"
                    placeholder='Enter here'
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                {/*Weight*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">Weight</span>
                  </div>
                  <input
                    className="weight-slot"
                    placeholder='Enter here'
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                {/*Device*/}
                <div className="add-detail-row">
                  <div className="add-detail-text">
                    <span className="add-detail-label">Device</span>
                  </div>
                  <input
                    className="device-slot"
                    placeholder='Enter Device ID'
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                  />
                </div>
              </div>
              <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button type="button" className="save-button" onClick={handleSubmit}>Save Changes</button>
            </div>
          )}
        </div>

        <div className="right-container">
          {/* Notifications Box */}
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
              <div className="notifications-row">
                <IoPersonOutline size={20} />
                <div className="notifications-text">
                  <span className="notifications-title">Heart Rate</span>
                  <span className="notifications-summary">Too high: 180/min at 12pm</span>
                </div>
              </div>
              <div className="notifications-row">
                <IoPersonOutline size={20} />
                <div className="notifications-text">
                  <span className="notifications-title">Accelerometer</span>
                  <span className="notifications-summary">A drop 2 min ago, check in with the patient</span>
                </div>
              </div>
              <div className="notifications-row">
                <IoPersonOutline size={20} />
                <div className="notifications-text">
                  <span className="notifications-title">Activity</span>
                  <span className="notifications-summary">Less movement than usual in restroom, check in with the patient</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-container">
            {/* Heart Rate Box */}
            <div className="heartrate-box">
              <FaHeartbeat size={45} />
              <p className="heartrate-title fw-semibold">Heart Rate</p>
              <p className="heartrate-bpm fw-semibold">120 BPM</p>
              <p className="heartrate-summary fw-semibold">↑ Higher than average</p>
            </div>

            {/* Blood Oxygen Box */}
            <div className="bloodoxygen-box">
              <MdOutlineBloodtype size={45} />
              <p className="bloodoxygen-title fw-semibold">Blood Oxygen</p>
              <p className="bloodoxygen-percentage fw-semibold">88%</p>
              <p className="bloodoxygen-summary fw-semibold">↓ Lower than average</p>
            </div>
          </div>
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