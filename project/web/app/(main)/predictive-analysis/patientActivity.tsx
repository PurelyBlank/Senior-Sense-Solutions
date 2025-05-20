"use client"

import { useState, useEffect, useRef } from "react";

import { Chart, registerables } from "chart.js";

import { useWearable } from '../context/WearableContext';

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./charts.module.css";

Chart.register(...registerables);

export default function PatientActivity() {
  const [weekRange, setWeekRange] = useState<string>("");
  const [trendText, setTrendText] = useState<string>("");
  const [, setError] = useState('');
  
  const { wearable_id } = useWearable();

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Fetch current patient's step data from backend
  const fetchStepData = async () => {
    // Reset error before fetching
    setError("");

    if (!wearable_id) {
      setError("Wearable ID is not provided.");

      return null;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patient-activity-chart`;

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

      return data.stepData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);

      return null;
    }
  };

  // Helper function to calculate the current week range
  const calculateWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calculate the start dates of the current week
    const startOfWeek = new Date(today);
    const differenceToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    startOfWeek.setDate(today.getDate() + differenceToMonday);

    // Calculate the end dates of the current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Format the dates as MM/DD/YY
    const formatDate = (date: Date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);

      return `${month}/${day}/${year}`;
    };

    setWeekRange(`${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`);
  };

  useEffect(() => {
    const updateChart = async () => {
      if (!chartRef.current) {
        return;
      }

      const stepData = await fetchStepData();
      if (!stepData) {
        setTrendText("No data available.");

        return;
      }

      // Trend analysis based on current patient's available heart rate data
      const today = new Date();
      const dayOfWeek = today.getDay();
      const reorderedData = [
        stepData[1], stepData[2], stepData[3],
        stepData[4], stepData[5], stepData[6], stepData[0]
      ];

      const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const todayValue = parseFloat(reorderedData[todayIdx]);
      const prevDays = reorderedData
        .map((v: string, idx: number) => idx < todayIdx ? parseFloat(v) : null)
        .filter((v: number | null): v is number => v !== null && !isNaN(v));

      let trend = "";
      if (prevDays.length === 0 || isNaN(todayValue)) {
        trend = "Not enough data to analyze today's trend.";

      } else {
        const prevAvg = prevDays.reduce((a: number, b: number) => a + b, 0) / prevDays.length;

        if (isNaN(prevAvg) || prevAvg === 0) {
          trend = "Not enough data to analyze today's trend.";

        } else {
          const difference = todayValue - prevAvg;
          const percentage = (difference / prevAvg) * 100;

          if (Math.abs(percentage) < 0.1) {
            trend = "Today's step count is stable compared to previous days.";

          } else if (percentage > 0) {
            trend = `Trending up by ${percentage.toFixed(1)}% today.`;

          } else {
            trend = `Trending down by ${Math.abs(percentage).toFixed(1)}% today.`;
          }
        }
      }
      setTrendText(trend);

      // Clean up existing chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Total Steps",
              data: reorderedData,
              backgroundColor: "rgba(75, 192, 192, 1.0)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              borderRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,                    
          maintainAspectRatio: false,        
  
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                precision: 0,
              },
              grid: {
                display: true,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    };

    let intervalId: NodeJS.Timeout;

    if (wearable_id) {
      // Calculate the current week range
      calculateWeekRange();

      // Fetch heart rate data, update chart
      updateChart();

      // Update chart every 10 seconds
      intervalId = setInterval(updateChart, 10000);
    }
  
    // Cleanup function to destroy the chart instance
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [wearable_id]);
  
  return (
    <div className={styles.BarChart}>
      {/* Header */}
      <div className={styles.BarChartHeader}>
        <h1>Patient Activity</h1>
      </div>
    
      {/* Divider */}
      <div className={styles.BarChartDivider}></div>
    
      {/* Chart */}
      <div className={styles.BarChartContent}>
        <div className={styles.BarChartChart}>
          <div className={styles.BarChartChartHeader}>
            <h1>This Week&apos;s Summary</h1>
            <p>{weekRange}</p>
          </div>

          <div className={styles.chartWrapper}>
            <canvas ref={chartRef} />
          </div>
        </div>
    
        {/* Description */}
        <div className={styles.BarChartDescription}>
          <h1>{trendText}</h1>
          <p>Patient activity measured in steps taken by the patient</p>
        </div>
      </div>
    </div>
  );
};