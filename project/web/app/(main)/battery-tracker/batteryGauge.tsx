"use client"

import { Gauge, gaugeClasses } from '@mui/x-charts';
import { useState, useEffect } from 'react';

import { useWearable } from '../context/WearableContext';


export default function GaugeClient() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [, setError] = useState('');

  const { wearable_id } = useWearable();

  const handleFetchBatteryLevel = async () => {
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/battery-tracker`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id,  
        }),
      });

      const data = await response.json();

      setBatteryLevel(data.batteryLevel);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occured.";
      setError(errorMessage);

      console.error(err);
    }
  };

  useEffect(() => {
    // Fetch battery level
    handleFetchBatteryLevel();

    // Set interval to fetch battery every 1 min
    const intervalId = setInterval(handleFetchBatteryLevel, 60000);

    return () => clearInterval(intervalId);
  }, [wearable_id]);

  const hours = batteryLevel !== null ? (batteryLevel / 100) * 24 : 0;
  const rounded = Math.round(hours * 2) / 2;  

  return (
    <div className="gaugeChartContainer">
      <Gauge
        className="gauge-responsive"
        value={batteryLevel}
        valueMin={0}
        valueMax={100}
        width={355}
        height={355}
        sx={(theme) => ({
          [`& .${gaugeClasses.valueText}`]: {
            display: 'none',
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: '#33B7F7',
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: theme.palette.text.disabled,
          },
        })}
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        lineHeight: 1.2,
        color: '#33B7F7',
      }}>
      <div className="gauge-overlay">
        <div className="gauge-percent">{`${batteryLevel}%`}</div>
        <div className="gauge-label">{`───────\n${rounded} hours\nRemaining`}</div>
      </div>
    </div>
  </div>
  );
}