import React from 'react';
import styles from "./charts.module.css";

interface FallReportProps {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  setactivateFallChart: (active: boolean) => void;
}

const FallReport: React.FC<FallReportProps> = ({
  selectedDate,
  setSelectedDate,
  setactivateFallChart,
}) => {
  return (
    <div className="center-remove-box">
      {!selectedDate ? (
        <>
          <p className="title-bold">Past Falls From 1/20–1/26</p>
          <p>Click on a date to see more details about the event</p>

          <div className={styles.fallDetailsContainer}>
            <h1 className={styles.fallButton} onClick={() => setSelectedDate("January 22, 2025")}>
              January 22, 2025
            </h1>
            <h1 className={styles.fallButton} onClick={() => setSelectedDate("January 24, 2025")}>
              January 24, 2025
            </h1>
          </div>

          <button type="button" className="cancel-button" onClick={() => setactivateFallChart(false)}>
            Exit
          </button>
        </>
      ) : (
        <>
          <h1 className="title-bold mb-5">Detailed Fall Report for {selectedDate}</h1>

          <div>
            <div className={styles.detailedFallReport}>
              <div><p>Date and Time: </p></div>
              <div><p>January 24, 2025 7:23 PM</p></div>
            </div>

            <div className={styles.detailedFallReport}>
              <div><p>Location: </p></div>
              <div><p>Aldrich Park, Irvine CA 92617</p></div>
            </div>
          </div>

          <button type="button" className="cancel-button" onClick={() => setSelectedDate(null)}>
            Back
          </button>
        </>
      )}
    </div>
  );
};

export default FallReport;
