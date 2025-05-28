import React from 'react';

import styles from "./charts.module.css";

interface Fall {
  timestamp: string;
  latitude: number;
  longitude: number;
}

interface FallReportProps {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  setactivateFallChart: (active: boolean) => void;
  selectedWeek: (string | null);
  falls?: Fall[];
}

const FallReport: React.FC<FallReportProps> = ({
  selectedDate,
  setSelectedDate,
  setactivateFallChart,
  selectedWeek,
  falls = [],
}) => {
  return (
    <div className="center-remove-box">
      {!selectedDate ? (
        <>
          <p className="title-bold">Detected Falls During {selectedWeek || "..."}</p>
          <p>Click on an entry to view specific details about the event.</p>

          <div className={styles.fallDetailsContainer}>
            {falls.map((fall, index) => {
              const date = new Date(fall.timestamp).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <p
                  key={index}
                  className={styles.fallButton}
                  onClick={() => setSelectedDate(fall.timestamp)}
                >
                  {date}
                </p>
              );
            })}
          </div>

          <button type="button" className="cancel-button" onClick={() => setactivateFallChart(false)}>
            Exit
          </button>
        </>
      ) : (
        (() => {
          const selectedFall = falls.find(fall => fall.timestamp === selectedDate);
          if (!selectedFall) {
            return null
          }
          const shortDate = new Date(selectedFall.timestamp).toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          const fullDate = new Date(selectedFall.timestamp).toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          });

          const latitude = selectedFall.latitude;
          const longitude = selectedFall.longitude;
          return (
            <>
              <p className="fall-report-title mb-5">Detailed Fall Report for {shortDate}</p>

              <div className="mb-5">
                <div className={styles.detailedFallReport}>
                  <div><p>Date and Time: </p></div>
                  <div><p>{fullDate}</p></div>
                </div>

                <div className={styles.detailedFallReport}>
                  <div><p>Location: </p></div>
                  <div><p>({latitude}, {longitude})</p></div>
                </div>
              </div>

              <button type="button" className="cancel-button" onClick={() => setSelectedDate(null)}>
                Back
              </button>
            </>
          );
        })()
      )}
    </div>
  );
};

export default FallReport;
