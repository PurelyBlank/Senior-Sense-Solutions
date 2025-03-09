"use client"
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./barChart.css";

Chart.register(...registerables);

export default function BarChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // clean up chart if needed 
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
    // cleanup 
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="BarChartContainer">
        {/* Header */}
        <div className="BarChartHeader">
            <h1>Fall Chart</h1>
        </div>

        {/* Divider */}
        <div className="BarChartDivider">
        </div>
    
        <div className = "BarChartContent">
            {/* Chart */}
            <div className="BarChartChart">
                <div className = "BarChartChartHeader">
                    <h1>Fall Chart</h1>
                    <p>Over six weeks</p>
                </div>
                <canvas ref={chartRef} />
            </div>

            {/* Description */}
            <div className="BarChartDescription">
                <h1>Trending down by 50% over the last 3 weeks</h1>
                <p>Showing total falls over the last six weeks</p>
            </div>
        </div>

    </div>
  );
}
