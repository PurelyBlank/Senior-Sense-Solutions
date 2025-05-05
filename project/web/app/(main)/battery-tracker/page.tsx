"use client"

import React, { useState } from 'react';
import "./battery-tracker.css";
import GaugeClient from './batteryGauge';
import BarChart from './barChart';
import PatientDropdown from "../components/patient-component/patient-dropdown";



export default function BatteryTrackerPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    return (
      <div className = "BatteryTrackerPageContainer">
        <div className="left-column">
          <GaugeClient value={80} />
        </div>

        <div className="patient-dropdown-container">
              <PatientDropdown/>
        </div>
      </div>
    );
};