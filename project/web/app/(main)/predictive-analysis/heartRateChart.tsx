"use client"

import { useState, useEffect, useRef } from "react";

import { Chart, registerables } from "chart.js";

import { useWearable } from '../context/WearableContext';

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./charts.module.css";

Chart.register(...registerables);

export default function HeartRateChart() {
  const [patientHeartRate, setPatientHeartRate] = useState('');
  const [patientTimestamp, setPatientTimestamp] = useState('');
  const [, setError] = useState('');

  const { wearable_id } = useWearable();

  const handleFetchPatientHeartRate = async () => {
    setError("");  // Reset error before fetching

    if (!wearable_id) {
      setError("Wearable ID error.");

      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patient-heartrate-chart`;

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
      if (!response.ok) {
        setPatientHeartRate("");
        setPatientTimestamp("")
        
        throw new Error(data.error || "Failed to fetch patient data.");
      }

      setPatientHeartRate(data.patientHeartRate);
      setPatientTimestamp(data.patienTimestamp);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);

      console.error(err);
    }
  };

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Clean up chart, if necessary
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      // Create a new chart instance
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Beats per minute (BPM)",
              data: [90, 100, 95, 78, 92, 94, 99],
              backgroundColor: "rgba(75, 192, 192, 1.0)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },

        options: {
            scales: {
                x: {
                  grid: {
                    display: false 
                  }
                },
                y: {
                    ticks: {
                        precision : 0
                    }, 
                    grid: {
                      display: true  
                    }
                },
            },
            plugins: {
                legend: {
                    display: false
                },
            }  
        },   
      });
    }

    if (wearable_id === -1) {
      return;
    }

    // Fetch patient heart rate
    handleFetchPatientHeartRate();

    // Set interval to fetch heart rate every 3 seconds 
    const intervalId = setInterval(handleFetchPatientHeartRate, 3000);

    // Cleanup function to destroy the chart instance
    return () => {
      clearInterval(intervalId)

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [wearable_id]);

  return (
    <div className={styles.BarChart}>
        {/* Header */}
        <div className={styles.BarChartHeader}>
            <h1>Beats per Minute (BPM)</h1>
        </div>

        {/* Divider */}
        <div className={styles.BarChartDivider}></div>
    
        <div className = {styles.BarChartContent}>
            {/* Chart */}
            <div className={styles.BarChartChart}>
                <div className = {styles.BarChartChartHeader}>
                    <h1>Heart Rate </h1>
                    <p>Week 1 (2/3 - 2/9)</p>
                </div>
                <canvas ref={chartRef} />
            </div>

            {/* Description */}
            <div className={styles.BarChartDescription}>
                <h1>Trending up by 5.2% today</h1>
                <p>Showing average heart rate measured in beats per minute (BPM) </p>
            </div>
        </div>
    </div>
  );
};