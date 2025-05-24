"use client"

import { useEffect, useRef, useState } from "react";

import { Chart, registerables } from "chart.js";

import FallReport from "./FallReport";
import FallDetect from "./FallDetect";

import { useWearable } from "../context/WearableContext";

import styles from "./charts.module.css";

Chart.register(...registerables);

export default function FallChart() {
  const [trendText, setTrendText] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detectFall, setDetectFall] = useState(false);
  const [activateFallChart, setactivateFallChart] = useState(false);
  const [fallDate, setFallDate] = useState('');
  const [fallLocation, setFallLocation] = useState('');
  const [lastFallTimestamp, setLastFallTimestamp] = useState<string | null>(null);
  const [, setError] = useState('');

  const { wearable_id } = useWearable();

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchFallData = async () => {
    // Reset error before fetching
    setError("");

    if (!wearable_id) {
      setError("Wearable ID is not provided.");

      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token.");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patient-fall-chart`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id
        }),
      });

      const data = await response.json();
      if (!response.ok || !Array.isArray(data.falls)) {
        updateChart([], []);

        setTrendText("No data available.");

        throw new Error(data.error || "Failed to fetch patient data.");
      }

      type FallEntry = {
        week_start: string;
        week_end: string;
        fall_count: number;
      };

      const labels = data.falls.map((entry: FallEntry) => {
        const start = new Date(entry.week_start);
        const end = new Date(entry.week_end);

        const format = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

        return `${format(start)} - ${format(end)}`;        
      });

      const chartData = data.falls.map((entry: FallEntry) => entry.fall_count);

      updateChart(labels, chartData);

      // Trend analysis
      if (chartData.length < 2) {
        setTrendText("Not enough data to analyze weekly trend.");

      } else {
        const currentWeek = chartData[chartData.length - 1];
        const prevWeeks = chartData.slice(0, chartData.length - 1);
        const prevAvg: number = prevWeeks.reduce((a: number, b: number) => a + b, 0) / prevWeeks.length;

        if (isNaN(currentWeek) || isNaN(prevAvg) || prevAvg === 0) {
          setTrendText("Not enough data to analyze weekly trend.");

        } else {
          const difference = currentWeek - prevAvg;
          const percentage = (difference / prevAvg) * 100;

          let trend = "";
          if (Math.abs(percentage) < 0.1) {
            trend = "This week's fall count is stable compared to previous weeks.";

          } else if (percentage > 0) {
            trend = `Trending up by ${percentage.toFixed(1)}% in falls this week.`;

          } else {
            trend = `Trending down by ${Math.abs(percentage).toFixed(1)}% in falls this week.`;

          }

          setTrendText(trend);
        };
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);

      updateChart([], []);

      setTrendText("No data available.");
    }
  };

  const updateChart = (labels: string[], data:number[]) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels, 
        datasets: [
          {
            label: "# of Falls",
            data,
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
        onClick: (event, element) => {
          if (element.length > 0) {
            setactivateFallChart(true);

            setSelectedDate(null);
          }
        },
        scales: {
          x: { 
            grid: { 
              display: false 
            } 
          },
          y: { 
            ticks: { 
              precision: 0 
            }, 
            grid: { 
              display: true 
            } 
          },
        },
        plugins: { 
          legend: { 
            display: false 
          } 
        },
      },
    });
  };

  const checkFall = async () => {
    if (!wearable_id) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No auth token");
    }

    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
    const apiUrl = `${baseApiUrl}/check-fall`;

    // Catch falls within wide window
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        wearable_id,
        since,
      }),
    });
    
    const data = await response.json();
    if (data.fallDetected && data.fallDate) {
      // Only display FallDetect component if this is a new fall (different timestamp)
      if (data.fallDate !== lastFallTimestamp) {
        setFallDate(data.fallDate);
        setFallLocation(`${data.fallLocation.latitude}, ${data.fallLocation.longitude}`)

        setDetectFall(true);

        setLastFallTimestamp(data.fallDate);
      };
    };
  };

  useEffect(() => {
    if (!wearable_id) {
      return;
    }

    fetchFallData();

    const intervalId = setInterval(fetchFallData, 10000);

    return () => clearInterval(intervalId);
  }, [wearable_id]);

   // Periodically check for any potential new falls
   useEffect(() => {
    if (!wearable_id) {
      return;
    }

    // Check for falls every 10 seconds
    const interval = setInterval(() => {
      checkFall();
    }, 10000);

    return () => clearInterval(interval);
  }, [wearable_id, lastFallTimestamp]);

  return (
    <div className={styles.DoubleBarChart}>
      
      {/* Header */}
      <div className={styles.BarChartHeader}>
        <h1>Fall Detection</h1>
      </div>

      <div className={styles.BarChartDivider}></div>

      <div className={styles.BarChartContent}>
        {/* Chart */}
        <div className={styles.BarChartChart}>
          <div className={styles.BarChartChartHeader}>
            <h1>Week-by-week Summary</h1>
          </div>
          <div className={styles.chartWrapper}>
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* Description */}
        <div className={styles.BarChartDescription}>
          <h1>{trendText}</h1>
          <p>Total detected falls per week</p>
        </div>
      </div>

      {detectFall && (
        <div className="overlay">
          <FallDetect 
            date={fallDate} 
            location={fallLocation}
            setactivateFallDetect={setDetectFall}
          />
        </div>
      )}

      {/* Overlay for fall details */}
      {activateFallChart && (
        <div className="overlay">
          <FallReport
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setactivateFallChart={setactivateFallChart}
          />
        </div>
      )}
    </div>
  );
};