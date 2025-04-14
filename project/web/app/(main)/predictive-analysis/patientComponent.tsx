"use client";

import * as React from 'react';

import { CgProfile } from "react-icons/cg";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

import "bootstrap/dist/css/bootstrap.min.css";
//import "./globals.css";

export default function PatientInfo() {
  const [patient, setPatient] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [age, setAge] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');

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

  return (
    <div className="main-container container p-3">

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
              <button type="button" className="remove-patient-button">Remove Patient</button>

              {/* Vertical Line Above Add Patient Button */}
              <div className="vertical-line"></div>
              {/* Add Patient Button */}
              <button type="button" className="add-patient-button">Add Patient</button>
            </div>


          </div>
        </div>

    </div>
  );
}