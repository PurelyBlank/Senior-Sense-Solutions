"use client"

import React, { useState } from 'react';
import "./battery-tracker.css";
import GaugeClient from './batteryGauge';
import BarChart from './barChart';
import PatientInfo from '../components/patient-component/PatientComponent';
import PatientDropdown from '../components/patient-component/patient-dropdown';


export default function BatteryTrackerPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    return (
      <div className = "BatteryTrackerPageContainer">
        <div className="left-column">
            <GaugeClient value={80} />

          {/* Navigation Bar */}
          <div style={{ margin: '16px 0', display: 'flex', gap: '8px' }}>
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as '24h' | '7d' | '30d')}
                  style={{
                    padding: '6px 12px',
                    background: timeRange === range ? '#1976d2' : '#e0e0e0',
                    color: timeRange === range ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>

          <div className="bar-chart">
            <BarChart timeRange={timeRange} />
          </div>
        </div>
        <div className="right-column">
            <PatientInfo/>
        </div>


        <div className = "patient-dropdown-container">
          <PatientDropdown/>
        </div>
        
      </div>
    );
};