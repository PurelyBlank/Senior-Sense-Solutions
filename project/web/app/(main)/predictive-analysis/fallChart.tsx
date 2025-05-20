"use client"
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import styles from "./charts.module.css";
import FallReport from "./FallReport";
import FallDetect from "./FallDetect";
import { useWearable } from "../context/WearableContext";

Chart.register(...registerables);

export default function FallChart() {
  const [trendText, setTrendText] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detectFall, setDetectFall] = useState(false);
  const [activateFallChart, setactivateFallChart] = useState(false);
  const [fallDate, setFallDate] = useState('');
  const [fallLocation, setFallLocation] = useState('');
  const [, setError] = useState('');

  const { wearable_id } = useWearable();

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

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
        throw new Error("No auth token");
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
        updateChart([], []);

        setTrendText("No data available.");

        throw new Error(data.error || "Failed to fetch patient data.");
      }

      const labels = data.falls.map((entry: any) => {
        const start = new Date(entry.week_start);
        const end = new Date(entry.week_end);

        const format = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

        return `${format(start)} - ${format(end)}`;        
      });

      const chartData = data.falls.map((entry: any) => entry.fall_count);

      updateChart(labels, chartData);

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

      updateChart([], []);

      setTrendText("No data available.");
    }
  };

  const updateChart = (labels: string[], data:number[]) => {
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
          labels, 
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
      },
    });
  };

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

  useEffect(() => {
    if (wearable_id === -1) {
      return;
    }
    fetchFallData();
    const intervalId = setInterval(fetchFallData, 10000);

    return () => clearInterval(intervalId);
  }, [wearable_id]);

   // periodically check for any potential new falls
   useEffect(() => {
      const interval = setInterval(() => {
        checkFall();
      }, 10000); // every 10 seconds currently 
  }, []);

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
};