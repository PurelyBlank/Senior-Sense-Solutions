"use client"

import { useState, useEffect, useRef } from "react";

import { Chart, registerables } from "chart.js";

import { useWearable } from '../context/WearableContext';

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./charts.module.css";

Chart.register(...registerables);

export default function HeartRateChart() {
  const [, setError] = useState('');

  const { wearable_id } = useWearable();

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchHeartRateData = async () => {
    // Reset error before fetching
    setError("");

    if (!wearable_id) {
      setError("Wearable ID is not provided.");

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
        body: JSON.stringify({ wearable_id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch patient data.");
      }

      return data.heartRateData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);

      return null;
    }
  };

  useEffect(() => {
    const updateChart = async () => {
      if (!chartRef.current) {
        return;
      }

      // Fetch heart rate data
      const heartRateData = await fetchHeartRateData();
      if (!heartRateData) {
        return;
      }

      // Clean up existing chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      // Create a new chart instance
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          datasets: [
            {
              label: "Average Beats per Minute (BPM)",
              data: heartRateData,
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
              },
            },
            y: {
              ticks: {
                  precision : 0,
              }, 
              grid: {
                display: true,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
            },
          },  
        },   
      });
    };

    if (wearable_id) {
      updateChart();
    }

    // Cleanup function to destroy the chart instance
    return () => {
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
            <p>This Week&apos;s Summary (5/11/25 - 5/17/25)</p>
          </div>
          <canvas ref={chartRef} />
        </div>

        {/* Description */}
        <div className={styles.BarChartDescription}>
          <h1>Trending up by 5.2% today</h1>
          <p>Average heart rate measured in beats per minute (BPM)</p>
        </div>
      </div>
    </div>
  );
};