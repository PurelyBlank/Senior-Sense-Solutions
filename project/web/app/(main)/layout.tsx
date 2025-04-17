"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import { BiUser } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LuBatteryCharging } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";

import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";

export default function BiometricLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [caretakerFirstName, setCaretakerFirstName] = useState('');
  const [caretakerLastName, setCaretakerLastName] = useState('');
  const [, setError] = useState('');

  const pageNames: Record<string, string> = {
    "/biometric-monitor": "Home",
    "/battery-tracker": "Battery Tracker",
    "/location": "Location",
    "/predictive-analysis": "Predictive Analysis",
  };

  const pathname = usePathname();
  const router = useRouter();

  // Make POST request to retrieve caretaker user's first name and last name from backend
  const handleFetchCaretakerFirstAndLastName = async () => {
    setError("");  // Reset error before fetching
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const response = await fetch("http://localhost:5000/api/caretaker-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch caretaker first name and last name.");
      }
      if (!data.caretakerFirstName) {
        throw new Error("Caretaker first name not found in response.");
      }
      if (!data.caretakerLastName) {
        throw new Error("Caretaker last name not found in response.");
      }

      setCaretakerFirstName(data.caretakerFirstName);
      setCaretakerLastName(data.caretakerLastName);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);
    }
  };
  
  // Call the function on component mount or as needed
  useEffect(() => {
    handleFetchCaretakerFirstAndLastName();
  }, []);

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">Senior Sense Solutions</div>
        <div className="dash">Dashboard</div>
        <div className="icon">
          <button><BiUser size={24} /></button>
          <span>{caretakerFirstName || "Caretaker"}{" "}{caretakerLastName || "User"}</span>
          <button style={{ fontSize: "1.5rem" }}>▾</button>
        </div>
      </div>

      {/* Page Title */}
      <div className="page-name-bar">{pageNames[pathname] || "Dashboard"}</div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <button onClick={() => setCollapsed(!collapsed)} className="collapsible-button">
            {collapsed ? "▸" : "◂"}
          </button>

          {/* Navigation Links */}
          <nav className="nav-links">
            <Link href="/biometric-monitor" className={`nav-links ${pathname === "/biometric-monitor" ? "active" : ""}`}>
              <AiOutlineHome size={34} /> {collapsed ? "" : "Home"}
            </Link> 
            <Link href="/predictive-analysis" className={`nav-links ${pathname === "/predictive-analysis" ? "active" : ""}`}>
              <TbActivityHeartbeat size={34} /> {collapsed ? "" : "Predictive Analysis"}
            </Link>
            <Link href="/battery-tracker" className={`nav-links ${pathname === "/battery-tracker" ? "active" : ""}`}>
              <LuBatteryCharging size={34} /> {collapsed ? "" : "Battery Tracker"}
            </Link>
            <Link href="/location" className={`nav-links ${pathname === "/location" ? "active" : ""}`}>
              <FaRegMap size={34} /> {collapsed ? "" : "Location"}
            </Link>
            <button className="nav-button" onClick={() => {
                localStorage.removeItem("authToken"); // Remove token
                router.push("/"); // Redirect to main layout (which shows login)
            }}>
                <IoLogInOutline size={34}/> {collapsed ? "" : "Sign Out"}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
}
