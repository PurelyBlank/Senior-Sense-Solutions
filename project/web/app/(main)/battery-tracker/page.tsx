"use client"

import React, { useState } from 'react';

import GaugeClient from './batteryGauge';
import PatientInfo from "../components/patient-component/PatientComponent";

import "./page.css";

export default function BatteryTrackerPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    return (
      <div className = "BatteryTrackerPageContainer">
        <div className="left-column">
          <GaugeClient/>
        </div>

        <div className="right-column">
          <PatientInfo/>
        </div>
      </div>
    );
};