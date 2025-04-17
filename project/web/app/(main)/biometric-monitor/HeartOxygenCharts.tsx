"use client"
import { FaHeartbeat } from "react-icons/fa";
import { MdOutlineBloodtype } from "react-icons/md";


export default function HeartOxygenCharts(){
    return(
        <div className="bottom-container">
            {/* Heart Rate Box */}
            <div className="heartrate-box">
                <FaHeartbeat size={45} />
                <p className="heartrate-title fw-semibold">Heart Rate</p>
                <p className="heartrate-bpm fw-semibold">120 BPM</p>
                <p className="heartrate-summary fw-semibold">↑ Higher than average</p>
            </div>

            {/* Blood Oxygen Box */}
            <div className="bloodoxygen-box">
                <MdOutlineBloodtype size={45} />
                <p className="bloodoxygen-title fw-semibold">Blood Oxygen</p>
                <p className="bloodoxygen-percentage fw-semibold">88%</p>
                <p className="bloodoxygen-summary fw-semibold">↓ Lower than average</p>
            </div>
        </div>
    )
}