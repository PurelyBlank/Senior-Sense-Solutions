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

  return (
    <div className="center-remove-box">
      <p className="title-bold">New Fall Detected!</p>
      <p>Please confirm the occurrence of this fall event.</p>

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
            <p>{date}</p>
          </div>
        </div>

        <div className={styles.detailedFallReport}>
          <div>
            <p>Location:</p>
          </div>
          <div>
            <p>{location}</p>
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