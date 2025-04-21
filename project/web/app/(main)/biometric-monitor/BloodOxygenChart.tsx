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
                    *Note: This is the patient&apos;s blood oxygen reading at this moment. It doesn&apos;t tell us if their oxygen is generally high or low.
                    Please consult the guidelines <a href="https://www.ncbi.nlm.nih.gov/books/NBK470348/" target="_blank">link/reference</a> proper interpretation.
                </em>
            </p>
        </div>

    )
}
{/* Blood Oxygen Box */}
