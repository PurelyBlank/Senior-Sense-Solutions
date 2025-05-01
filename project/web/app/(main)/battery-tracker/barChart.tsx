// BarChart.tsx
"use client"
import React, { useEffect, useRef } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto';

interface BarChartProps {
    timeRange: '24h' | '7d' | '30d';
}

export default function BarChart({ timeRange }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let labels, dataPoints;

    switch (timeRange) {
        case '24h':
            labels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
                '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
            ];
            dataPoints = [65, 59, 80, 81, 56, 55, 40, 60, 80, 100, 100, 98, 92, 87, 80, 73, 65, 53, 40, 36, 31, 22, 18, 15];
            break;
        case '7d':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            dataPoints = [90, 80, 70, 60, 50, 40, 30];
            break;
        case '30d':
            labels = Array.from({length: 30}, (_, i) => String(i + 1));
            dataPoints = Array.from({length: 30}, () => Math.floor(Math.random() * 100));
            break;
    }


    const data = {
      labels: labels,
      datasets: [{
        label: 'Battery Power',
        data: dataPoints,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration<'bar', number[], string> = {
      type: 'bar' as const,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: function(context) {
                const width = context.chart.width;
                let size = Math.round(width / 32); // tweak this factor to your needs
                size = size < 10 ? 10 : size;       // minimum size
                size = size > 18 ? 18 : size;       // maximum size
                return {
                  size: size,
                  weight: 'bold'
                };
              }
            }
          },
          tooltip: {
            enabled: true,
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 20 
            }
          }
        }
      }
      
    };

    if (chartRef.current) {
      const chartInstance = new Chart(chartRef.current, config);
      return () => chartInstance.destroy();
    }
  }, [timeRange]);

  return <canvas ref={chartRef} className="bar-chart-canvas" />;
}
