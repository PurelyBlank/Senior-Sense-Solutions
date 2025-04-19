"use client"
import { MdOutlineBloodtype } from "react-icons/md";

export default function BloodOxygenChart(){
    return(
        <div className="bottom-container">
            {/* Heart Rate Box */}
            <div className="bloodoxygen-box">
                <MdOutlineBloodtype size={45} />
                <p className="bloodoxygen-title fw-semibold">Blood Oxygen</p>
                <p className="bloodoxygen-percentage fw-semibold">88%</p>
                <p className="bloodoxygen-summary fw-semibold">↓ Lower than average</p>
            </div>

        </div>
    )
}
{/* Blood Oxygen Box */}
