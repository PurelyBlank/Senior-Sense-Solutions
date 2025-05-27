import styles from "./charts.module.css";

interface FallDetectProps{
  patientFirstName?: string | null;
  patientLastName?: string | null;
  date: string | null;
  location: string | null; 
  setactivateFallDetect: (active: boolean) => void;
  phoneNumber?: string | null;
  wearable_id?: string | number | null;
}

const FallDetect: React.FC<FallDetectProps> = ({
  patientFirstName, 
  patientLastName, 
  date, 
  location, 
  setactivateFallDetect, 
  phoneNumber,
  wearable_id,
} ) => {
  // Helper function to set num_falls in wearable_data to 0 upon cancellation of fall(s)
  const cancelFallData = async () => {
    if (!wearable_id || !date) {
      alert("Error: Missing wearable_id or timestamp.");

      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/cancel-fall`;
  
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id,
          timestamp: date,
        }),
      });
      if (response.ok) {
        setactivateFallDetect(false);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel fall(s).");
      }

    } catch (err) {
      console.error(err);
    }
  };

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
      <p className={styles.fallText}>Contact: {phoneNumber}</p>

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
          onClick={() => cancelFallData()}
        >
          Cancel
        </button>
        <button 
          type='button' 
          className={styles.saveButton} 
          onClick={() => setactivateFallDetect(false)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};  

export default FallDetect; 