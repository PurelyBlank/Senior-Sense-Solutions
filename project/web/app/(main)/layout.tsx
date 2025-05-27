"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BiUser } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LuBatteryCharging } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";

import FallDetect from "./predictive-analysis/FallDetect";

import { WearableProvider } from "./context/WearableContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";

export default function BiometricLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [caretakerFirstName, setCaretakerFirstName] = useState('');
  const [caretakerLastName, setCaretakerLastName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [patientFirstName, setPatientFirstName] = useState<string | null>(null);
  const [patientLastName, setPatientLastName] = useState<string | null>(null);
  const [detectFall, setDetectFall] = useState(false);
  const [fallDate, setFallDate] = useState('');
  const [fallLocation, setFallLocation] = useState('');
  const [lastFallTimestamps, setLastFallTimestamps] = useState<{ [wearable_id: string]: string }>({});
  const [, setError] = useState('');

  // Ref for caretaker user dropdown
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/caretaker-fullname`;
  
      const response = await fetch(apiUrl, {
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

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/patients`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setPatients(data.patients || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      console.error(err);

      setPatients([]);
    }
  };

  const fetchPatientFalls = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No auth token");
    }

    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
    const apiUrl = `${baseApiUrl}/check-fall`;

    // Catch falls within wide window
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();

    for (const patient of patients) {
      const wearable_id = patient.wearable_id;
      if (!wearable_id) {
        continue;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          wearable_id,
          since,
        }),
      });
    
      const data = await response.json();
      if (data.fallDetected && data.fallDate) {
        // Only display FallDetect component if this is a new fall (different timestamp)
        if (lastFallTimestamps[wearable_id] !== data.fallDate) {
          setPhoneNumber(data.phoneNumber || null);
          setPatientFirstName(data.patientFirstName || null);
          setPatientLastName(data.patientLastName || null);
          setFallDate(data.fallDate);
          setFallLocation(`${data.fallLocation.latitude}, ${data.fallLocation.longitude}`)
          setDetectFall(true);

          // Update the last fall timestamp for this patient
          setLastFallTimestamps(prev => ({
            ...prev,
            [wearable_id]: data.fallDate
          }));

          break;
        };
      };
    };
  };
  
  // Call the function on component mount or as needed
  useEffect(() => {
    handleFetchCaretakerFirstAndLastName();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!patients.length) {
      return;
    }

    // Check for all patient falls every 10 seconds
    const interval = setInterval(() => {
      fetchPatientFalls();
    }, 10000);

    return () => clearInterval(interval);
  }, [patients, lastFallTimestamps]);
  
  return (
    <WearableProvider> 
      <div className="flex h-screen flex-col">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="logo">Senior Sense Solutions</div>
          <div className="dash">Dashboard</div>
          <div className="icon">
            <button>
              <BiUser size={24} />
            </button>
            <span>
              {caretakerFirstName || "Caretaker"}{" "}{caretakerLastName || "User"}
            </span>
            <div 
              className="dropdown-container" 
              ref={dropdownRef}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button 
                className="dropdown-toggle" 
                style={{ fontSize: "1.5rem" }}
                tabIndex={-1}
              ></button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item-settings"
                    onClick={() => {
                      router.push("/settings");
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className="dropdown-item-signout"
                    onClick={() => {
                      localStorage.removeItem("authToken");
                      router.push("/");
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="page-name-bar">{pageNames[pathname] || "Dashboard"}</div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="sidebar-container">
            <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

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
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className={`collapsible-button`}>
              {collapsed ? '▸' : '◂'}
            </button>
          </div>
          {/* Main Content */}
          <div className="main-content">{children}</div>
        </div>
      </div>

      {detectFall && (
        <div className="modal-overlay">
          <FallDetect 
            patientFirstName={patientFirstName}
            patientLastName={patientLastName}
            date={fallDate} 
            location={fallLocation}
            setactivateFallDetect={setDetectFall}
            phoneNumber={phoneNumber}
          />
        </div>
      )}
    </WearableProvider>
  );
};