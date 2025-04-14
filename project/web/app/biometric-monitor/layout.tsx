"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";

import { BiUser } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LuBatteryCharging } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";

export default function BiometricLayout({ children }: { children: React.ReactNode }) {
  const pageNames: Record<string, string> = {
    "/biometric-monitor": "Home",
    "/battery-tracker": "Battery Tracker",
    "/location": "Location",
    "/predictive-analysis": "Predictive Analysis",
  };

  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">Senior Sense Solutions</div>
        <div className="dash">Dashboard</div>
        <div className="icon">
          <button><BiUser size={24} /></button>
          <span>Olivia Martin</span>
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
