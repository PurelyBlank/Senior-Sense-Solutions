"use client";

import { useState, useEffect } from 'react';

import { useWearable } from "../../context/WearableContext"; 

import Link from "next/link";

import { CgProfile } from "react-icons/cg";

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Alert, Snackbar } from "@mui/material";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);


  // Generate possible height options
  const generateHeightOptions = () => {
    const heights: string[] = [];

    for (let feet = 2; feet <= 8; feet++) {
      const maxInches = feet === 8 ? 0 : 11;

      for (let inches = 0; inches <= maxInches; inches++) {
        heights.push(`${feet}'${inches}`);
      }
    }

    return heights;
  };

  const { wearable_id } = useWearable();
  // Fetch Patient rows for Select dropdown upon mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const apiUrl = `${baseApiUrl}/patients`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch patients.");
        }

        //Fetching the selected Patient every time we change pages, using wearable_id
        const patients: Patient[] = data.patients;
        const selectedPatient = patients.find((p) => p.wearable_id === wearable_id);
        if (selectedPatient) {
          setPatient(selectedPatient.patient_id.toString());
          setFirstName(selectedPatient.first_name);
          setLastName(selectedPatient.last_name);
          setGender(selectedPatient.gender || '');
          setAge(selectedPatient.age?.toString() || '');
          setHeight(selectedPatient.height || '');
          setWeight(selectedPatient.weight?.toString() || '');
        }


        setPatients(data.patients);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
        console.error("Fetch patients error:", err);
      }
    };

    fetchPatients();
  }, []);


  // Setters
  const handleRemovePatient = () => setIsRemovePatient(true);
  const handleRemoveCancel = () => setIsRemovePatient(false);
  const handleAddPatient = () => setIsAddPatient(true);
  const handleCancel = () => {
    setIsAddPatient(false);
    clearForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // need to uplaod image to the databaes 
  // retrive some link from it ? 
  const uploadImage = async () => {
    if (!selectedImage){
      console.warn("No image was selected to uplaod.");
      return null; 
    }

    try {
      const token = localStorage.getItem("authToken") // to ensure we're signed in ? 
      if (!token){
        throw new Error("No authentication token found. ");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patients/uploadImage`;
      
      const formData = new FormData(); // creates a key value pair with (image, and then the File object)
      formData.append('image', selectedImage);

      // send out request to backend 
      const response = await fetch(apiUrl, {
        method: "POST",
        headers:{
          Authorization: `Bearer ${token}`
  
        },
        body: formData, 
      });

      // response from backend 
      const data = await response.json();
      if(!response.ok){
        throw new Error (data.error || "Failed to upload image")
      }

      return data.imageUrl; 
    }
    catch (error) {
      console.log(error)
      return null;
    }
  }


  // Fetch request for adding a new Patient row
  const handleSubmitPatient = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      if (!firstName || !lastName || !deviceId) {
        throw new Error("First name, last name, and device ID are required.");
      }

      // Define expected data fields in request body
      const patientData = {
        wearable_id: parseInt(deviceId),
        first_name: firstName,
        last_name: lastName,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        height: height || null,
        weight: weight ? parseInt(weight) : null,
      };

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patients`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add patient.");
      }

      // Update patient list
      setPatients([...patients, {
        patient_id: data.patient_id,
        wearable_id: parseInt(deviceId),
        first_name: firstName,
        last_name: lastName,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
        height: height || undefined,
        weight: weight ? parseInt(weight) : undefined,
      }]);

      // Clear the input fields
      setIsAddPatient(false);
      clearForm();

      // Upon successfully adding a patient, display Snackbar
      showSuccessSnackbar("Patient added successfully!");

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      console.error("Add patient error:", err);
    }
  };

  // Fetch request for updating Patient attributes (Gender, Age, Height, Weight)
  const handleSavePatientChanges = async () => {
    if (!patient) {
      setError('Please select a patient to edit.');
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const selectedPatient = patients.find(
        (p) => `${p.patient_id}` === patient
      );
      if (!selectedPatient) {
        throw new Error('Selected patient not found.')
      }

      const patientData = {
        gender: gender || null,
        age: age ? parseInt(age) : null,
        height: height || null,
        weight: weight ? parseInt(weight) : null,
      };

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const apiUrl = `${baseApiUrl}/patients/${selectedPatient.patient_id}`;

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update patient.");
      }

      // Update patient list locally
      setPatients(patients.map((p) =>
        p.patient_id === selectedPatient.patient_id
          ? {
            patient_id: p.patient_id,
            wearable_id: p.wearable_id,
            first_name: p.first_name,
            last_name: p.last_name,
            gender: patientData.gender ?? undefined,
            age: patientData.age ?? undefined,
            height: patientData.height ?? undefined,
            weight: patientData.weight ?? undefined,
            }
          : p
      ));

      setError('');

      // Upon successfully saving changes, display Snackbar
      showSuccessSnackbar("Patient changes saved!");

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      console.error("Update patient error:", err);
    }
  }

  const handleConfirmRemovePatient = async () => {
    if (!patient) {
      setError("Please select a patient to remove.");
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      
      const selectedPatient = patients.find(
        (p) => `${p.patient_id}` === patient
      );
      if (!selectedPatient) {
        throw new Error("Selected patient not found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patients/${selectedPatient.patient_id}`;
  
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete patient.");
      }
  
      // Remove patient from dropdown
      setPatients(patients.filter((p) => p.patient_id !== selectedPatient.patient_id));
      setPatient('');
      setGender('');
      setAge('');
      setHeight('');
      setWeight('');
      setIsRemovePatient(false);
      setError('');

      // Upon successfully removing patient, display Snackbar
      showSuccessSnackbar("Patient removed successfully.");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      console.error("Remove patient error:", err);
    }
  };

  // Helper function to clear all input fields in Add Patient form
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

  const { setWearable_id } = useWearable();

  // Handle displaying of Patient attributes depending on selected Patient in dropdown
  const handlePatientChange = (event: SelectChangeEvent) => {
    const selectedId = Number(event.target.value);

    const selectedPatient = patients.find(
      (p) => p.patient_id === selectedId
    );

    if (selectedPatient) {
      setPatient(`${selectedPatient.patient_id}`);
      setGender(selectedPatient.gender || '');
      setAge(selectedPatient.age ? selectedPatient.age.toString() : '');
      setHeight(selectedPatient.height || '');
      setWeight(selectedPatient.weight ? selectedPatient.weight.toString() : '');

      setFirstName(selectedPatient.first_name ? selectedPatient.first_name.toString() : '');
      setLastName(selectedPatient.last_name ? selectedPatient.last_name.toString() : '');
      if (selectedPatient.wearable_id !== undefined) { 
        // Set wearable_id when user selects a patient in the dropdown
        setWearable_id(selectedPatient.wearable_id);
      }
    } else {
      // Clear Patient attribute fields if no Patient is selected
      setGender('');
      setAge('');
      setHeight('');
      setWeight('');
    }
  };
  const handleGenderChange = (event: SelectChangeEvent) => setGender(event.target.value as string);
  const handleAgeChange = (event: SelectChangeEvent) => setAge(event.target.value as string);
  const handleHeightChange = (event: SelectChangeEvent) => setHeight(event.target.value as string);
  const handleWeightChange = (event: SelectChangeEvent) => setWeight(event.target.value as string);
  const handleDeviceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => setDeviceId(e.target.value);

  const showSuccessSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="p-3">
      {isRemovePatient && <div className="overlay"></div>}
        {/* Patient Container */}
        <div className="patient-container container pt-4">

        <div className="dropdown-wrapper">
          <FormControl fullWidth size="small" style={{ width: 435 }}>
            <InputLabel id="select-patient">Select</InputLabel>
            <Select
              labelId="select-patient-label"
              id="select-patient"
              label="Patient"
              value={patient}
              onChange={handlePatientChange}
            >
              {patients.map((p) => (
                <MenuItem key={p.patient_id} value={p.patient_id}>
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
              <span className="patient-name">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Select a Patient"}
              </span>
              <span className="patient-info">Patient Info</span>
              {error && <div className="error-message" role="alert">{error}</div>}

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
                  <input
                    className="edit-age-slot"
                    placeholder="Edit"
                    type="number"
                    value={age}
                    onChange={handleAgeChange}
                  />
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
                      {generateHeightOptions().map((heightOption) => (
                        <MenuItem key={heightOption} value={heightOption}>
                          {heightOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Weight */}
                <div className="detail-row">
                  <div className="detail-text">
                    <span className="detail-label">Weight</span>
                    <span className="detail-value">{weight || "None specified"}</span>
                  </div>
                  <input
                    className="edit-weight-slot"
                    placeholder="Edit"
                    type="number"
                    value={weight}
                    onChange={handleWeightChange}
                  />
                </div>

                {/* Save Changes Button */}
                <button type="button" className="save-changes-button" onClick={handleSavePatientChanges}>Save Changes</button>

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
            <CgProfile/>
            <input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {error && <div className="error-message" role="alert">{error}</div>}
            <div className="patient-details">

              {/* First name */}
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

              {/* Last name */}
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

              {/* Gender */}
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Gender</span>
                </div>
                <FormControl className="add-detail-dropdown" size="small">
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
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Age */}
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

              {/* Height */}
              <div className="add-detail-row">
                <div className="add-detail-text">
                  <span className="add-detail-label">Height</span>
                </div>
                <FormControl className="add-detail-dropdown" size="small">
                  <InputLabel id="add-height-label">Height</InputLabel>
                  <Select
                    labelId="add-height-label"
                    id="add-height"
                    label="Height"
                    value={height}
                    onChange={handleHeightChange}
                  >
                    {generateHeightOptions().map((heightOption) => (
                      <MenuItem key={heightOption} value={heightOption}>
                        {heightOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Weight */}
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

              {/* Wearable ID */}
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

            {/* Cancel button */}
            <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>

            {/* Save changes button */}
            <button type="button" className="save-button" onClick={handleSubmitPatient}>Save Changes</button>
          </div>
        )}
        </div>
        {isRemovePatient && (
        <div className="center-remove-box">
          {/* Warning text */}
          <p className="title-bold">Are you sure?</p>
          <p className="subtext-gray">This action cannot be undone. This will permanently delete the patient and all associated data.</p>

          {/* Cancel button */}
          <button type='button' className='cancel-button' onClick={handleRemoveCancel}>Cancel</button>

          {/* Continue button */}
          <button type='button' className='save-button' onClick={handleConfirmRemovePatient}>Continue</button>
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}