"use client";

import { useState, useEffect } from 'react';

import { CgProfile } from "react-icons/cg";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import Link from "next/link";

import "bootstrap/dist/css/bootstrap.min.css";
import "./PatientComponent.css";

// Define Patient fields
interface Patient {
  patient_id: number;
  wearable_id?: number;
  first_name: string;
  last_name: string;
  gender?: string;
  age?: number;
  height?: string;
  weight?: number;
}

export default function PatientInfo() {
  const [isAddPatient, setIsAddPatient] = useState(false);
  const [isRemovePatient, setIsRemovePatient] = useState(false);
  const [patient, setPatient] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await fetch("http://localhost:5000/api/patients", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch patients.");
        }

        setPatients(data.patients);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
        console.error("Fetch patients error:", err);
      }
    };

    fetchPatients();
  }, []);

  const handleRemovePatient = () => setIsRemovePatient(true);
  const handleRemoveCancel = () => setIsRemovePatient(false);
  const handleAddPatient = () => setIsAddPatient(true);
  const handleCancel = () => {
    setIsAddPatient(false);
    clearForm();
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      if (!firstName || !lastName || !deviceId) {
        throw new Error("First name, last name, and device ID are required.");
      }

      const patientData = {
        wearable_id: parseInt(deviceId),
        first_name: firstName,
        last_name: lastName,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        height: height || null,
        weight: weight ? parseInt(weight) : null,
      };

      const response = await fetch("http://localhost:5000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add patient.");

      // Update patient list
      setPatients([...patients, {
        patient_id: data.patient_id,
        first_name: firstName,
        last_name: lastName,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
        height: height || undefined,
        weight: weight ? parseInt(weight) : undefined,
        wearable_id: parseInt(deviceId),
      }]);

      setIsAddPatient(false);
      clearForm();

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      console.error("Add patient error:", err);
    }
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setGender('');
    setAge('');
    setHeight('');
    setWeight('');
    setDeviceId('');
    setError('');
  };

  const handlePatientChange = (event: SelectChangeEvent) => {
    setPatient(event.target.value as string);
  };

  const handleGenderChange = (event: SelectChangeEvent) => setGender(event.target.value as string);
  const handleAgeChange = (event: SelectChangeEvent) => setAge(event.target.value as string);
  const handleHeightChange = (event: SelectChangeEvent) => setHeight(event.target.value as string);
  const handleWeightChange = (event: SelectChangeEvent) => setWeight(event.target.value as string);
  const handleDeviceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => setDeviceId(e.target.value);

  return (
    <div className="p-3">
      {isRemovePatient && <div className="overlay"></div>}
        {/* Patient Container */}
        <div className="patient-container container pt-4">

        <div className="dropdown-wrapper">
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
                {patients.map((p) => (
                  <MenuItem key={p.patient_id} value={p.first_name + " " + p.last_name}>
                    {p.first_name + " " + p.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

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
            <Link href="/biometric-monitor">Import Profile Picture</Link>
            {error && <div className="error-message" role="alert">{error}</div>}
            <div className="patient-details">
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">First Name</span>
                </div>
                <input
                  className="first-name"
                  placeholder="Enter here"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Last Name</span>
                </div>
                <input
                  className="last-name"
                  placeholder="Enter here"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Gender</span>
                </div>
                <FormControl size="small" fullWidth>
                  <InputLabel id="add-gender-label">Gender</InputLabel>
                  <Select
                    labelId="add-gender-label"
                    id="add-gender"
                    label="Gender"
                    value={gender}
                    onChange={handleGenderChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Age</span>
                </div>
                <input
                  className="age-slot"
                  placeholder="Enter here"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Height</span>
                </div>
                <FormControl size="small" fullWidth>
                  <InputLabel id="add-height-label">Height</InputLabel>
                  <Select
                    labelId="add-height-label"
                    id="add-height"
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
                    <MenuItem value="6'1">6&apos;1&quot;</MenuItem>
                    <MenuItem value="6'2">6&apos;2&quot;</MenuItem>
                    <MenuItem value="6'3">6&apos;3&quot;</MenuItem>
                    <MenuItem value="6'4">6&apos;4&quot;</MenuItem>
                    <MenuItem value="6'5">6&apos;5&quot;</MenuItem>
                    <MenuItem value="6'6">6&apos;6&quot;</MenuItem>
                    <MenuItem value="6'7">6&apos;7&quot;</MenuItem>
                    <MenuItem value="6'8">6&apos;8&quot;</MenuItem>
                    <MenuItem value="6'9">6&apos;9&quot;</MenuItem>
                    <MenuItem value="6'10">6&apos;10&quot;</MenuItem>
                    <MenuItem value="6'11">6&apos;11&quot;</MenuItem>
                    <MenuItem value="7'0">7&apos;0&quot;</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Weight</span>
                </div>
                <input
                  className="weight-slot"
                  placeholder="Enter here"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Device ID</span>
                </div>
                <input
                  className="device-slot"
                  placeholder="Enter Device ID"
                  type="number"
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