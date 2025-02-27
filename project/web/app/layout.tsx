"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen flex-col">
          {/* Top Bar - Fixed at the top */}
          <div className="top-bar">
            <div className="logo">Senior Sense Solutions</div>
            <div className="dash">Dashboard</div>
            <div className="icon">
              <button className="p-2 bg-gray-700 rounded-full">🔍</button>
              <button className="p-2 bg-gray-700 rounded-full">👤</button>
              <span>Olivia Martin</span>
            </div>
          </div>

          <div className="flex flex-1">
            {/* Sidebar - Below the top bar */}
            <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
              {/* Collapsible Button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="collapsible-button"
              >
                {collapsed ? "→" : "←"}
              </button>

              {/* Navigation Links */}
              <nav className="nav-links">
                <a href="/">🏠 {collapsed ? "" : "Home"}</a>
                <a href="/battery-tracker">🔋 {collapsed ? "" : "Battery Tracker"}</a>
                <a href="/biometric-monitor">🩺 {collapsed ? "" : "Biometric Monitor"}</a>
                <a href="/location">📍 {collapsed ? "" : "Location"}</a>
                <a href="/login">🔑 {collapsed ? "" : "Login"}</a>
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
