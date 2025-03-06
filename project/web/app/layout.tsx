"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";
import { BiUser } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LuBatteryCharging } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const pageNames: Record<string, string> = {
    "/": "Home (Biometric Monitoring)",
    "/biometric-monitor": "Predictive Analysis",
    "/battery-tracker": "Battery Tracker",
    "/location": "Location",
    "/login": "Login",
  };

  const currentPageName = pageNames[pathname] || "Page Not Found";

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen flex-col">
          {/* Top Bar - Fixed at the top */}
          <div className="top-bar">
            <div className="logo">Senior Sense Solutions</div>
            <div className="dash">Dashboard</div>
            <div className="icon">
              <button><FontAwesomeIcon icon={faMagnifyingGlass} flip="horizontal" className="text-2xl"/></button>
              <button><BiUser size={24}/></button>
              <span>Olivia Martin</span>
              <button style={{ fontSize: "1.5rem" }}>▾</button>
            </div>
          </div>

          {/* Golden top bar */}
          <div className="page-name-bar">
            {currentPageName} {/* Display dynamic page name */}
          </div>

          <div className="flex flex-1">
            {/* Sidebar - Below the top bar */}
            <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
              {/* Collapsible Button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="collapsible-button"
              >
                {collapsed ? "▸" : "◂"}
              </button>

              {/* Navigation Links */}
              <nav className="nav-links">
                <a href="/">
                  <AiOutlineHome size={34} />
                  {collapsed ? "" : "Home"}
                </a> {/* Biometric Monitor */}
                <a href="/biometric-monitor">
                  <TbActivityHeartbeat size={34}/>
                  {collapsed ? "" : "Predictive Analysis"}
                </a> {/*Biometric monitor page is now predictive analysis page*/}
                <a href="/battery-tracker">
                  <LuBatteryCharging size={34}/>
                  {collapsed ? "" : "Battery Tracker"}
                </a>
                <a href="/location">
                  <FaRegMap size={34}/>
                  {collapsed ? "" : "Location"}
                </a>
                <a href="/login"> 
                  <IoLogInOutline size={34}/> 
                  {collapsed ? "" : "Login"}
                </a>
              </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
