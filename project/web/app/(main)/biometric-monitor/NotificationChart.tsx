"use client"

import { FiBell } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";

import "./NotificationChart.css"

export default function NotificationChart(){

    return(
        <div className="notifications-box">
            <p className="fw-semibold">Notifications</p>
            <p className="abnormality-text">Abnormality Alerts</p>

            { /*Notification Rows*/ }
            <div className="notifications-details">

                <div className="notifications-row">
                    <FiBell size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Missed Pill</span>
                        <span className="notifications-summary">Medicine A at 2pm</span>
                    </div>
                </div>

                <div className="notifications-row">
                    <IoPersonOutline size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Heart Rate</span>
                        <span className="notifications-summary">Too high: 180/min at 12pm</span>
                    </div>
                </div>

                <div className="notifications-row">
                    <IoPersonOutline size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Accelerometer</span>
                        <span className="notifications-summary">A drop 2 min ago, check in with the patient</span>
                    </div>
                </div>

                <div className="notifications-row">
                    <IoPersonOutline size={20} />
                    <div className="notifications-text">
                        <span className="notifications-title">Activity</span>
                        <span className="notifications-summary">Less movement than usual in restroom, check in with the patient</span>
                    </div>
                </div>
                
            </div>
        </div>
    )
}