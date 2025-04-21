"use client"
import { FaHeartbeat } from "react-icons/fa";

export default function HeartRateChart(){
    return(
        <div className="heartrate-box">
            <FaHeartbeat size={45} />
            <p className="heartrate-title fw-semibold">Heart Rate</p>
            <p className="heartrate-bpm fw-semibold">120 BPM</p>
            <p className="heartrate-summary fw-semibold">
              <em>
                  *Note: This heart rate reading shows the patient's pulse right now. To understand what a healthy heart rate range is, please refer to the guidelines
                  Please consult the guidelines <a href="https://www.ncbi.nlm.nih.gov/books/NBK593193/table/ch1survey.T.normal_heart_rate_by_age/" target="_blank">link/reference</a> for proper interpretation.
              </em>
            </p>
        </div>
    )
}
