"use client"
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import styles from "./charts.module.css";

Chart.register(...registerables);

export default function PatientActivity() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
  
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"],
          datasets: [
            {
              label: "# of steps",
              data: [400, 600, 500, 153, 450, 486, 89],
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
    }
  
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);
  

  return (
    <div className={styles.BarChart}>
    <div className={styles.BarChartHeader}>
      <h1>Patient Activity Chart </h1>
    </div>
  
    <div className={styles.BarChartDivider}></div>
  
    <div className={styles.BarChartContent}>
      <div className={styles.BarChartChart}>
        <div className={styles.BarChartChartHeader}>
          <h1>Patient Activity (steps)</h1>
          <p>Mar 8, 2025</p>
        </div>

        <div className={styles.chartWrapper}>
          <canvas ref={chartRef} />
        </div>
        
      </div>
  
      <div className={styles.BarChartDescription}>
        <h1>Trending down by 10.6% today</h1>
        <p>Showing patient activity measured in steps</p>
      </div>
    </div>
  </div>
  
  );
}
