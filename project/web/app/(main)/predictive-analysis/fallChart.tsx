"use client"
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import styles from "./charts.module.css";
import FallReport from "./FallReport";
import FallDetect from "./FallDetect";
import { useWearable } from "../context/WearableContext";

Chart.register(...registerables);

export default function FallChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const [activateFallChart, setactivateFallChart] = useState(false); 
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detectFall, setDetectFall] = useState(false);  // set true when the watch detects a fall 
  const [, setError] = useState('');
  const [fallDate, setFallDate] = useState('')
  const [fallLocation, setFallLocation] = useState('')


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

   // periodically check for any potential new falls
   useEffect(() => {
      const interval = setInterval(() => {
        checkFall();
      }, 50000); // every 10 seconds currently 

  }, []);


  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: ["1/13 - 1/19", "1/20 - 1/26", "1/27 - 2/2", "2/3 - 2/9", "2/10 - 2/16", "2/17 - 2/23"],
          datasets: [
            {
              label: "# of Falls",
              data: [0, 2, 1, 0, 0, 0],
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
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className={styles.DoubleBarChart}>
      
      {/* Header */}
      <div className={styles.BarChartHeader}>
        <h1>Fall Chart</h1>
      </div>

      <div className={styles.BarChartDivider}></div>

      <div className={styles.BarChartContent}>
        {/* Chart */}
        <div className={styles.BarChartChart}>
          <div className={styles.BarChartChartHeader}>
            <h1>Fall Chart</h1> h
            <p>Over six weeks</p>
          </div>
          <div className={styles.chartWrapper}>
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* Description */}
        <div className={styles.BarChartDescription}>
          <p>Showing total falls over the last six weeks</p>
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
