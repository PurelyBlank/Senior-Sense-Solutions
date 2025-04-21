"use client"
import { MdOutlineBloodtype } from "react-icons/md";

export default function BloodOxygenChart(){
    return(
        <div className="bloodoxygen-box">
            <MdOutlineBloodtype size={45} />
            <p className="bloodoxygen-title fw-semibold">Blood Oxygen</p>
            <p className="bloodoxygen-percentage fw-semibold">88%</p>
            <p className="bloodoxygen-summary fw-semibold">
                <em>
                *Note: These readings reflect the patient's current blood oxygen level only. 
                Please consult the guidelines <a href="https://www.ncbi.nlm.nih.gov/books/NBK470348/" target="_blank">link/reference</a> or 
                professional healthcare advisor for proper interpretation.
                </em>
            </p>
        </div>

    )
}
{/* Blood Oxygen Box */}
