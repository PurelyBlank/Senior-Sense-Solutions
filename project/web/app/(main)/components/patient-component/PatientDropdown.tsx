"use client"

import { useState } from "react";

import PatientInfo from "./PatientComponent";

import "./PatientDropdown.css"

export default function PatientDropdown() {
    const [collapsed, setCollapsed] = useState(true);
  
    return (
      <>
        <div 
          className="sidebarDropdown-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span
            className="sidebarDropdown-collapsible-button"
            aria-hidden="true"
          >
            {collapsed ? "▸" : "◂"}
          </span>
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
  