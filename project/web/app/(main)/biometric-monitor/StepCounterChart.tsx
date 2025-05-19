"use client";

import { FaWalking } from "react-icons/fa";
import { Chart, registerables } from "chart.js";
import { useEffect, useRef, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useWearable } from "../context/WearableContext";

import "./StepCounterChart.css";

Chart.register(...registerables);

function generateLabels(active: string): string[] {
  const now = new Date();

  if (active === "D") {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  }

  if (active === "W") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = now.getDay();
    const labels = [];
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (todayIndex + i) % 7;
      labels.push(days[dayIndex]);
    }
    return labels;
  }

  if (active === "M") {
    const labels = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return labels;
  }

  if (active === "6M") {
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${d.getMonth() + 1}/${d.getFullYear()}`);
    }
    return labels;
  }

  if (active === "Y") {
    const labels = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString("default", { month: "short" }) + `/${d.getFullYear()}`);
    }
    return labels;
  }

  return [];
}

export default function StepCounterChart() {
  const { wearable_id } = useWearable();
  const [active, setActive] = useState<"D" | "W" | "M" | "6M" | "Y">("D");
  const [stepCount, setStepCount] = useState(0);
  const [dailyStepCount, setDailyStepCount] = useState(0);
  const [error, setError] = useState("");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const stepGoal = 10000;
  const progress = Math.min(dailyStepCount / stepGoal, 1);
  
  const rangeMap: Record<string, string> = {
    D: "daily",
    W: "weekly",
    M: "monthly",
    "6M": "6M",
    Y: "yearly",
  };

  const fetchStepCounts = async () => {
    setError("");
    if (!wearable_id) {
      setError("Wearable ID error");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/step-count`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id,
          range: rangeMap[active],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch step count data.");
        setStepCount(0);
        updateChart([], []);
        return;
      }

      if (!data.steps || !Array.isArray(data.steps)) {
        setError("Invalid data format from server");
        setStepCount(0);
        updateChart([], []);
        return;
      }

    const labels = generateLabels(active);
    const normalizePeriod = (period: string): string => {
      if (active === "D") {
      const date = new Date(period);
        if (!isNaN(date.getTime())) {
          return date.getHours().toString().padStart(2, "0");
        }
      return period;
      }

      if (active === "W") {
        const date = new Date(period);
        return date.toLocaleDateString("en-US", { weekday: "long" });
      }

      if (active === "M") {
        const date = new Date(period);
        if (!isNaN(date.getTime())) {
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }
      }

      if (active === "6M") {
        const [year, month] = period.split("-");
        if (year && month) {
          return `${parseInt(month, 10)}/${year}`;
        }
      }

      if (active === "Y") {
        const [year, month] = period.split("-");
        if (year && month) {
          const monthNum = parseInt(month, 10);
          const yearNum = parseInt(year, 10);
          const monthName = new Date(yearNum, monthNum - 1).toLocaleString("default", { month: "short" });
          return `${monthName}/${year}`;
        }
      }

      return period;
    };
    const stepsMap = new Map<string, number>(
      data.steps.map((item: any) => [normalizePeriod(item.period), Number(item.total_steps)])
    );
    const stepsData = labels.map(label => stepsMap.get(label) || 0);

    if (active === "D") {
      labels.reverse();
      stepsData.reverse();
    }
    const totalSteps = stepsData.reduce((acc, val) => acc + val, 0);

    setStepCount(totalSteps);
    updateChart(labels, stepsData);
  } catch (err) {
    console.error("Step Count fetch error:", err);
    setError("Error fetching step count data.");
    setStepCount(0);
    updateChart([], []);
  }
};

  const fetchDailyStepCount = async () => {
  if (!wearable_id) return;

  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token");

    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
    const apiUrl = `${baseApiUrl}/step-count`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        wearable_id,
        range: "daily",
      }),
    });

    const data = await response.json();
    if (!response.ok || !Array.isArray(data.steps)) {
      setDailyStepCount(0);
      return;
    }

    const totalSteps = data.steps.reduce((acc: number, val: any) => acc + Number(val.total_steps), 0);
    setDailyStepCount(totalSteps);
  } catch (err) {
    console.error("Daily Step Count fetch error:", err);
    setDailyStepCount(0);
  }
};

  const updateChart = (labels: string[], data: number[]) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Steps",
            data,
            backgroundColor: "rgba(75, 192, 192, 1)",
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
  };

  useEffect(() => {
    fetchStepCounts();
    fetchDailyStepCount();
    const intervalId = setInterval(() => {
    fetchStepCounts();
    fetchDailyStepCount();
  }, 300000);

    return () => clearInterval(intervalId);
  }, [active, wearable_id]);

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
              strokeDashoffset={226.2 - 226.2 * progress}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s" }}
            />
          </svg>
          <FaWalking className="walking-icon" size={32} />
        </div>
        <div className="step-stats">
          <p className="step-average">{dailyStepCount.toLocaleString()} Steps</p>
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

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
