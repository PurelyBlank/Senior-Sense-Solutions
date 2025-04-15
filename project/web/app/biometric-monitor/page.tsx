"use client";

import { useState } from 'react';


import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";
import HeartOxygenCharts from './HeartOxygenCharts';
import NotificationChart from './NotificationChart';
import PatientComponent from './PatientComponent/PatientComponent';

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


  return (
    <div className="main-container container p-3">
      {isRemovePatient && <div className="overlay"></div>}
      <h1 className="display-7 fw-semibold">Welcome back, Olivia.</h1>

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