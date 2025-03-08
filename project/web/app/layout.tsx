"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import "./globals.css";

import { Inter } from "next/font/google";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { BiUser } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LuBatteryCharging } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const allowedRoutes = ["/login", "/register"];
    setIsAuthenticated(!!token);

    if (!token && !allowedRoutes.includes(window.location.pathname)) {
      router.push("/login");
    }
  }, [pathname, router]);

  // If on login or register page, don't show the layout
  if (pathname === "/login" || pathname === "/register") {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="login-content">{children}</div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated && pathname !== "/login") {
    return null; // Prevent flickering before redirect
  }

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
          <div className="page-name-bar">{pathname === "/" ? "Home" : "Dashboard"}</div>

          <div className="flex flex-1">
            {/* Sidebar */}
            <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="collapsible-button"
              >
                {collapsed ? "▸" : "◂"}
              </button>

              <nav className="nav-links">
                <Link href="/" className={pathname === "/" ? "active" : ""}>
                  <AiOutlineHome size={34} /> {collapsed ? "" : "Home"}
                </Link>
                <Link href="/predictive-analysis" className={pathname === "/predictive-analysis" ? "active" : ""}>
                  <TbActivityHeartbeat size={34}/> {collapsed ? "" : "Predictive Analysis"}
                </Link>
                <Link href="/battery-tracker" className={pathname === "/battery-tracker" ? "active" : ""}>
                  <LuBatteryCharging size={34}/> {collapsed ? "" : "Battery Tracker"}
                </Link>
                <Link href="/location" className={pathname === "/location" ? "active" : ""}>
                  <FaRegMap size={34}/> {collapsed ? "" : "Location"}
                </Link>
                <button className="nav-button" onClick={() => {
                  localStorage.removeItem("authToken");
                  router.push("/login");
                }}>
                  <IoLogInOutline size={34}/> {collapsed ? "" : "Sign Out"}
                </button>
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
