"use client"
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import styles from "./charts.module.css";

Chart.register(...registerables);

export default function BloodOxygenChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // clean up chart if needed 
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"],
          datasets: [
            {
              label: "Blood Oxygen Percentage",
              data: [85, 90, 87, 92, 85, 86, 94],
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
                        precision: 0,
                        callback: function (value) {
                          return value + '%';  
                        },
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
    // cleanup 
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
            <h1>Blood Oxygen Chart </h1>
        </div>

        {/* Divider */}
        <div className={styles.BarChartDivider}>
        </div>
    
        <div className = {styles.BarChartContent}>
            {/* Chart */}
            <div className={styles.BarChartChart}>
                <div className = {styles.BarChartChartHeader}>
                    <h1>Blood Oxygen</h1>
                    <p>Mar 8, 2025</p>
                </div>
                <canvas ref={chartRef} />
            </div>

            {/* Description */}
            <div className={styles.BarChartDescription}>
                <h1>Trending up by 5.2% today</h1>
                <p>Showing average blood oxygen levels over today</p>
            </div>
        </div>

    </div>
  );
}
