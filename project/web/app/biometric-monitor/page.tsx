"use client";

import * as React from 'react';

import { CgProfile } from "react-icons/cg";
import { FaUserCircle } from 'react-icons/fa';
import { FiBell } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { FaHeartbeat } from "react-icons/fa";
import { MdOutlineBloodtype } from "react-icons/md";
import { TextField, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";

export default function HomePage() {
  const [isAddPatient, setIsAddPatient] = React.useState(false);

  const [patient, setPatient] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [age, setAge] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [deviceId, setDeviceId] = React.useState('');

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

  return (
    <div className="main-container container p-3">
      <h1 className="display-7 fw-semibold">Welcome back, Olivia.</h1>

      {/* Main Content */}
      <div className="content-container">
        {/* Patient Container */}
        <div className="patient-container container pt-4">
          <p className="dropdown-label">Select Patient</p>
          <FormControl fullWidth size="small" style={{ width: 430 }}>
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
              <button type="button" className="btn remove-patient-button">Remove Patient</button>

              {/* Vertical Line Above Add Patient Button */}
              <div className="vertical-line"></div>

              {/* Add Patient Button */}
              <button type="button" className="btn add-patient-button" onClick={handleAddPatient}>Add Patient</button>
            </div>
          </div>
          ) : (
            <div className="add-patient-form">
              <h5>Add New Patient</h5>

              {/* Profile Icon */}
              <CgProfile className="patient-icon" size={95} />
              <button type="button" className="btn btn-link">Import Profile Picture</button>

              {/* First Name */}
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                size="small"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              {/* Last Name */}
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                size="small"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              {/* Gender */}
              <FormControl fullWidth size="small" className="mb-2">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={handleGenderChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              {/* Age */}
              <FormControl fullWidth size="small" className="mb-2">
                <InputLabel>Age</InputLabel>
                <Select
                  value={age}
                  onChange={handleAgeChange}
                  label="Age"
                >
                  {[...Array(100)].map((_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Height */}
              <FormControl fullWidth size="small" className="mb-2">
                <InputLabel>Height</InputLabel>
                <Select
                  value={height}
                  onChange={handleHeightChange}
                  label="Height"
                >
                  <MenuItem value="5'0">5&apos;0&quot;</MenuItem>
                  {/* Add other heights */}
                </Select>
              </FormControl>

              {/* Weight */}
              <FormControl fullWidth size="small" className="mb-2">
                <InputLabel>Weight</InputLabel>
                <Select
                  value={weight}
                  onChange={handleWeightChange}
                  label="Weight"
                >
                  <MenuItem value={50}>50 lbs</MenuItem>
                  {/* Add other weights */}
                </Select>
              </FormControl>

              {/* Device ID */}
              <TextField
                label="Device ID"
                variant="outlined"
                fullWidth
                size="small"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />

              {/* Action Buttons */}
              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Save Changes</button>
              </div>
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
    </div>
  );
}