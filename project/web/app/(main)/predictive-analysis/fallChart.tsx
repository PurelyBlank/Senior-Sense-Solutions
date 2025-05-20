"use client"
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import styles from "./charts.module.css";
import FallReport from "./FallReport";
import FallDetect from "./FallDetect";
import { useWearable } from "../context/WearableContext";

Chart.register(...registerables);

function generateFallChartLabels(): string[] {
  const labels: string[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7; 
    startOfWeek.setDate(startOfWeek.getDate() - day + 1 - (i * 7)); 

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); 

    const label = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
    labels.push(label);
  }

  return labels;

}

export default function FallChart() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detectFall, setDetectFall] = useState(false);
  const [activateFallChart, setactivateFallChart] = useState(false);
  const [fallDate, setFallDate] = useState('');
  const [fallLocation, setFallLocation] = useState('');
  const [, setError] = useState('');

  const { wearable_id } = useWearable();

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchFallData = async () => {
    if (!wearable_id) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

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

        throw new Error(data.error || "Failed to fetch patient data for fall chart");
      }

      const labels = data.falls.map((entry: any) => {
        const start = new Date(entry.week_start);
        const end = new Date(entry.week_end);

        const format = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

        return `${format(start)} - ${format(end)}`;        
      });

      const chartData = data.falls.map((entry: any) => entry.fall_count);

      updateChart(labels, chartData);

    } catch (err) {
      console.error("Fall count fetch error:", err);

      updateChart([], []);
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
              setSelectedDate(null); // to resset selected date 
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: { ticks: { precision: 0 }, grid: { display: true } },
          },
          plugins: { legend: { display: false } },
      },
    });
  };


  const checkFall = async () => {
      const token = localStorage.getItem("authToken");

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/check-fall`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id: 1,  
          since: new Date(Date.now() - 10020000).toISOString(), // checking falls from the last 2 hrs ish
        }),
      });
      
      // sets the fall date + location from what we retrived from the database
      const data = await response.json();
      if (data.fallDetected) {
        setFallDate(data.fallDate);
        setFallLocation(`${data.fallLocation.latitude}, ${data.fallLocation.longitude}`)
        setDetectFall(true);
      }
    };

  useEffect(() => {
    if (wearable_id === -1) {
      return;
    }
    fetchFallData();
    const intervalId = setInterval(fetchFallData, 10000);

    return () => clearInterval(intervalId);
  }, [wearable_id]);

   // periodically check for any potential new falls
   useEffect(() => {
      const interval = setInterval(() => {
        checkFall();
      }, 50000); // every 10 seconds currently 
  }, []);

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
          <p>Total detected falls per week</p>
        </div>
      </div>

      {detectFall && (
        <div className="overlay">
          <FallDetect date={fallDate} location={fallLocation}setactivateFallDetect={setDetectFall}/>
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
}
