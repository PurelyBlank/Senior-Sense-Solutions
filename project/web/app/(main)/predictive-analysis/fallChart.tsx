"use client"
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import styles from "./charts.module.css";

Chart.register(...registerables);

export default function FallChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [activateFallChart, setactivateFallChart] = useState(false); 

  

  useEffect(() => {
    if (chartRef.current) {
      // clean up chart if needed 
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      /*this data will be retrived from the database at some point? */
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

          onClick : (event, element) =>{
            if (element.length > 0 ){
              setactivateFallChart(true);
            }
          },
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

        
        }
        
        
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
    <div className={styles.DoubleBarChart}>
      
        {/* Header */}
        <div className={styles.BarChartHeader}>
            <h1>Fall Chart</h1>
        </div>

        {/* Divider */}
        <div className={styles.BarChartDivider}>
        </div>
    
        <div className = {styles.BarChartContent}>
            {/* Chart */}
            <div className={styles.BarChartChart}>
              <div className={styles.BarChartChartHeader}>
                <h1>Fall Chart</h1>
                <p>Over six weeks</p>
              </div>
              <div className={styles.chartWrapper}>
                <canvas ref={chartRef} />
              </div>
            </div>


            {/* Description */}
            <div className={styles.BarChartDescription}>
                <h1>Trending down by 50% over the last 3 weeks</h1>
                <p>Showing total falls over the last six weeks</p>
            </div>
        </div>

        {activateFallChart && (
          <div className="overlay">
            <div className="center-remove-box">
              {/* Warning text */}
              <p className="title-bold">Past Falls From 1/20-1/26</p>
              <p>Click on a date to see more details about the event</p>

              <div className = {styles.fallDetailsContainer}>
                <h1 className = {styles.fallButton} onClick = {() => console.log("sdfsdf")}>January 22, 2025 </h1>
                <h1 className = {styles.fallButton} onClick = {() => console.log("test")}>January 24, 2025 </h1>
              </div>
              {/* Cancel button */}
              <button type='button' className='cancel-button' onClick={() => setactivateFallChart(false)}>Exit</button>
              {/* Continue button */}
            </div>
          </div>
        )}


    </div>
  );
}