"use client"

import { FaWalking } from "react-icons/fa";
import { Chart, registerables } from "chart.js";
import { useEffect, useRef, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import "./StepCounterChart.css";

Chart.register(...registerables);

const generateData = (type: string) => {
    switch (type) {
      case "D":
        return {
          labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 300 + 50)),
        };
      case "W":
        return {
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000 + 1000)),
        };
      case "M":
        return {
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8000 + 1000)),
        };
      case "6M":
        return {
          labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
          data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 150000 + 50000)),
        };
      case "Y":
        return {
          labels: Array.from({ length: 5 }, (_, i) => `${2020 + i}`),
          data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 1000000 + 300000)),
        };
      default:
        return { labels: [], data: [] };
    }
  };

  export default function StepCounterChart() {
    const [active, setActive] = useState("D");
    const [stepCount, setStepCount] = useState(3500); 
    const stepGoal = 10000;
    const progress = Math.min(stepCount / stepGoal, 1);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
  
    useEffect(() => {
      const { labels, data } = generateData(active);
  
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
  
      const ctx = chartRef.current?.getContext("2d");
  
      if (ctx) {
        chartInstanceRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Steps",
                data,
                backgroundColor: "#33B7F7",
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1000,
                },
              },
            },
          },
        });
      }
    }, [active]);
  
    return (
      <div className="stepCounter-box">
        <div className="top-section">
            <div className="progress-ring">
            <svg width="80" height="80">
                <circle
                stroke="#e6e6e6"
                fill="transparent"
                strokeWidth="8"
                r="36"
                cx="40"
                cy="40"
                />
                <circle
                stroke="#33B7F7"
                fill="transparent"
                strokeWidth="8"
                r="36"
                cx="40"
                cy="40"
                strokeDasharray={226.2}
                strokeDashoffset={113.1}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s" }}
                />
            </svg>
            <FaWalking className="walking-icon" size={32} />
          </div>
          <div className="step-stats">
            <p className="step-average">3,500 Steps</p>
            <p className="step-sub">On Average</p>
          </div>
        </div>
        <p className="stepCounter-header">Step Counter</p>
        <div className="stepcounter-tabs">
          <ToggleButtonGroup
            value={active}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) setActive(newValue);
            }}
            color="primary"
            size="small"
          >
            {["D", "W", "M", "6M", "Y"].map((label) => (
              <ToggleButton key={label} value={label}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
  
        <div style={{ height: "200px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  }