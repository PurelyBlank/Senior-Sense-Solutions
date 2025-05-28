"use client"

import { useEffect, useRef, useState } from "react";

import { Chart, registerables } from "chart.js";

import FallReport from "./FallReport";

import { useWearable } from "../context/WearableContext";

import styles from "./charts.module.css";

Chart.register(...registerables);

interface Fall {
  timestamp: string;
  latitude: number;
  longitude: number;
}

export default function FallChart() {
  const [trendText, setTrendText] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activateFallChart, setactivateFallChart] = useState(false);
  const [, setError] = useState('');
  const [parsedSelectedWeek, setParsedSelectedWeek] = useState<string | null>(null);
  const [falls, setFalls] = useState<Fall[]>([]);

  const { wearable_id } = useWearable();

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);


  const fetchWeekData = async (selectedWeek: string) => {
    setError("");  // Reset error before fetching

    if (!wearable_id) {
      setError("Wearable ID error.");
      
      return;
    }

    if (!selectedWeek) {
      setError("Selected week is missing.");

      return;
    }
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patient-fall-chart-week`;

      const [week_start, week_end] = selectedWeek.split(" - ");


      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id,  
          week_start,
          week_end,
        }),
      });

      const data = await response.json();
      setFalls(data.falls)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);

      console.error(err);
    }
  };
  
  const stringToDate = (str: string) => {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const fetchFallData = async () => {
    // Reset error before fetching
    setError("");

    if (!wearable_id) {
      setError("Wearable ID is not provided.");

      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token.");
      }

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
        updateChart([], [], []);

        setTrendText("No data available.");

        throw new Error(data.error || "Failed to fetch patient data.");
      }

      type FallEntry = {
        week_start: string;
        week_end: string;
        fall_count: number;
      };

      const labels = data.falls.map((entry: FallEntry) => {
        const start = new Date(entry.week_start);
        const end = new Date(entry.week_end);

        const format = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

        return `${format(start)} - ${format(end)}`;        
      });

      const chartData = data.falls.map((entry: FallEntry) => entry.fall_count);

      updateChart(labels, parsedLabels, chartData);

      // Trend analysis
      if (chartData.length < 2) {
        setTrendText("Not enough data to analyze weekly trend.");

      } else {
        const currentWeek = chartData[chartData.length - 1];
        const prevWeeks = chartData.slice(0, chartData.length - 1);
        const prevAvg: number = prevWeeks.reduce((a: number, b: number) => a + b, 0) / prevWeeks.length;

        if (isNaN(currentWeek) || isNaN(prevAvg) || prevAvg === 0) {
          setTrendText("Not enough data to analyze weekly trend.");

        } else {
          const difference = currentWeek - prevAvg;
          const percentage = (difference / prevAvg) * 100;

          let trend = "";
          if (Math.abs(percentage) < 0.1) {
            trend = "This week's fall count is stable compared to previous weeks.";

          } else if (percentage > 0) {
            trend = `Trending up by ${percentage.toFixed(1)}% in falls this week.`;

          } else {
            trend = `Trending down by ${Math.abs(percentage).toFixed(1)}% in falls this week.`;

          }

          setTrendText(trend);
        };
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);

      updateChart([], [], []);

      setTrendText("No data available.");
    }
  };

  const updateChart = (labels: string[], parsedLabels: string[], data:number[]) => {
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
          labels: parsedLabels, 
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
          onClick: (event, element, chart) => {
            if (element.length > 0) {
              const clicked = element[0];
              const bar = clicked.index;
              const parsedSelectedWeek = parsedLabels[bar]; 
              const selectedWeek = labels[bar];
              
              setactivateFallChart(true);
              setSelectedDate(null); // to reset selected date 
              setParsedSelectedWeek(parsedSelectedWeek);
              //Fetch for a specific week, everytime we click
              fetchWeekData(selectedWeek);
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: { ticks: { precision: 0 }, grid: { display: true } },
          },
        },
        plugins: { 
          legend: { 
            display: false 
          } 
        },
      },
    });
  };

  useEffect(() => {
    if (!wearable_id) {
      return;
    }

    fetchFallData();
    const intervalId = setInterval(fetchFallData, 10000);

    return () => clearInterval(intervalId);
  }, [wearable_id]);

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
          <h1>{trendText}</h1>
          <p>Total detected falls per week</p>
        </div>
      </div>

      {/* Overlay for fall details */}
      {activateFallChart && (
        <div className="overlay">
          <FallReport
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setactivateFallChart={setactivateFallChart}
            selectedWeek={parsedSelectedWeek}
            falls={falls}
          />
        </div>
      )}
    </div>
  );
};