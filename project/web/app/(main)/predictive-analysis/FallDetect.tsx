import styles from "./charts.module.css";

interface FallDetectProps{
  patientFirstName?: string | null;
  patientLastName?: string | null;
  date: string | null;
  location: string | null; 
  setactivateFallDetect: (active: boolean) => void;
}

const FallDetect: React.FC<FallDetectProps> = ({patientFirstName, patientLastName, date, location, setactivateFallDetect} ) => {
  // basic idea is that upon confirmation 
  // given date and location  adds to the database 
  const handleUpdateDatabase = async () => {
    console.log("Called handle update database.")
  }

  // Format date retrieved from database to MM/DD/YY format
  const formatDate = (isoString: string | null) => {
    if (!isoString) {
      return "";
    }

    const d = new Date(isoString);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);

    return `${mm}/${dd}/${yy}`;
  };

  return (
    <div className="center-remove-box">
      <p className={styles.fallTitle}>New Fall Detected!</p>
      <p className={styles.fallText}>Please confirm the occurrence of this fall event.</p>

      <div className={styles.fallDetailsContainer}>

        <div className={styles.detailedFallReport}>
          <div>
            <p>Patient: </p>
          </div>
          <div>
            <p>{patientFirstName} {patientLastName}</p>
          </div>
        </div>

        <div className={styles.detailedFallReport}>
          <div>
            <p>Date and Time: </p>
          </div>
          <div>
            <p>{formatDate(date)}</p>
          </div>
        </div>

        <div className={styles.detailedFallReport}>
          <div>
            <p>Location:</p>
          </div>
          <div>
            <p>({location})</p>
          </div>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button 
          type='button' 
          className={styles.cancelButton} 
          onClick={() => setactivateFallDetect(false)}
        >
          Cancel
        </button>
        <button 
          type='button' 
          className={styles.saveButton} 
          onClick={() => handleUpdateDatabase()}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};  

export default FallDetect; 