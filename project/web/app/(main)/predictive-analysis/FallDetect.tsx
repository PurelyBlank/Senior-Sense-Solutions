import { useState } from "react";
import { useWearable } from "../context/WearableContext";
import styles from "./charts.module.css";

interface FallDetectProps{
  date: string | null;
  location : string | null; 
  setactivateFallDetect: (active: boolean) => void;

}

const FallDetect: React.FC<FallDetectProps> = ({date, location, setactivateFallDetect} ) => {

    // basic idea is that upon confirmation 
    // given date and location  adds to the database 
    const handleUpdateDatabase = async () => {
        console.log("called handle update databse")
    }

    return(
        <div className="center-remove-box">
          <p className="title-bold">New Fall Detected!</p>
          <p>Please confirm if this fall is real or not </p>

          <div className={styles.fallDetailsContainer}>

            <div className={styles.detailedFallReport}>
              <div><p>Date and Time: </p></div>
              <div><p>{date}</p></div>
            </div>

            <div className={styles.detailedFallReport}>
              <div><p>Location:</p></div>
              <div><p>{location}</p></div>
            </div>

          </div>

        <button type='button' className='cancel-button' onClick = {() => setactivateFallDetect(false)} >Cancel</button>
        <button type='button' className='save-button' onClick = {() => handleUpdateDatabase()}>Confirm</button>
        </div>
    )
}  


export default FallDetect; 