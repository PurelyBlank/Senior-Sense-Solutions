"use client"

import { useState } from "react";

import "./patient-dropdown.css"

export default function PatientDropdown(){
      const [collapsed, setCollapsed] = useState(false);
      const [caretakerFirstName, setCaretakerFirstName] = useState('');
      const [caretakerLastName, setCaretakerLastName] = useState('');

    return(
        <div className={`sidebarDropdown ${collapsed ? "collapsed" : ""}`}>

        <button onClick={() => setCollapsed(!collapsed)} className="sidebarDropdown-collapsible-button ">
          {collapsed ? "▸": "◂" }
        </button>

        {/* Navigation Links */}

      </div>
    )
}