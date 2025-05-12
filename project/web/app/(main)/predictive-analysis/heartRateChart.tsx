"use client"

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

import styles from "./charts.module.css";

Chart.register(...registerables);

export default function HeartRateChart() {
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

    // Cleanup function to destroy the chart instance
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

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