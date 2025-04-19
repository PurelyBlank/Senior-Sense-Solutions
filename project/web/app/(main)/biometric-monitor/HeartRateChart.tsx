"use client"
import { FaHeartbeat } from "react-icons/fa";

export default function HeartRateChart(){
    return(
        <div className="heartrate-box">
            <FaHeartbeat size={45} />
            <p className="heartrate-title fw-semibold">Heart Rate</p>
            <p className="heartrate-bpm fw-semibold">120 BPM</p>
            <p className="heartrate-summary fw-semibold">↑ Higher than average</p>
        </div>
    )
}
