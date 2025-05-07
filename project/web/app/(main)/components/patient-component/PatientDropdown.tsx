"use client"

import { useState } from "react";

import "./PatientDropdown.css"
import PatientInfo from "./PatientComponent";

export default function PatientDropdown() {
    const [collapsed, setCollapsed] = useState(true);
  
    return (
      <>
        <div className="sidebarDropdown-toggle">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebarDropdown-collapsible-button"
          >
            {collapsed ? "▸" : "◂"}
          </button>
        </div>
  
        {!collapsed && (
          <div className="sidebarDropdown-panel">
            <div className="patient-dropdown-content">
              <PatientInfo />
            </div>
          </div>
        )}
      </>
    );
  }
  