"use client"

import { useState, useEffect, useRef } from 'react';

import Image from 'next/image';
import loader from './loader.gif';

import { Snackbar, Alert } from '@mui/material';

import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

import PatientDropdownLocation from '../components/patient-component/PatientDropdownLocation';
import { useWearable } from '../context/WearableContext';

import "bootstrap/dist/css/bootstrap.min.css";
import "./location.css";

const center = {
  lat: 33.6846,
  lng: -117.8265
};

export default function LocationPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<null | { lat: number; lng: number }>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { wearable_id } = useWearable();

  const mapRef = useRef<google.maps.Map | null>(null);

  // Use JavaScript Google Maps API key defined in .env file
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined in environment variables.");
  }

  useEffect(() => {
    const fetchLocationAndPatient = async () => {
      // If wearable_id is available, set location to null & display error message
      if (!wearable_id) {
        setMarkerPosition(null);
        setPatientName(null);

        setSnackbarMessage("No patient selected.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);

        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const locationApiUrl = `${baseApiUrl}/location/${wearable_id}`;
        const patientApiUrl = `${baseApiUrl}/patients/${wearable_id}`;

        const locationResponse = await fetch(locationApiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const locationData = await locationResponse.json();
        if (!locationResponse.ok) {
          throw new Error(locationData.error || "Failed to fetch location data.");
        }

        const patientResponse = await fetch(patientApiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const patientData = await patientResponse.json();
        if (!patientResponse.ok) {
          throw new Error(locationData.error || "Failed to fetch patient data.");
        }

        // Update marker position with fetched latitude and longitude
        const newMarkerPosition = {
          lat: locationData.latitude,
          lng: locationData.longitude,
        }
        setMarkerPosition(newMarkerPosition);
        setPatientName(`${patientData.first_name} ${patientData.last_name}`);

        // Set map to pan to patient's retrieved position
        if (mapRef.current) {
          mapRef.current.panTo(newMarkerPosition);
        }

        // Upon success, display success message
        setSnackbarMessage("Patient successfully located!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

      } catch (err) {
        console.error("Fetch location error:", err);

        setMarkerPosition(null);
        setPatientName(null);

        setSnackbarMessage("Failed to fetch location data. Please select a patient.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchLocationAndPatient();
  }, [wearable_id]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  }

  return (
    <div className="google-maps">
      <LoadScript 
        googleMapsApiKey={apiKey!}
        onLoad={() => {
          console.log("Google Maps API Loaded");

          setIsLoaded(true);
        }}
        onError={(e) => console.error("LoadScript Error:", e)}
      >
        {/* Display Google Maps if loading is complete, show loader icon while it is incomplete */}
        {isLoaded ? (
          <>
            <GoogleMap 
              mapContainerClassName="map-container"
              center={center}
              zoom={10}
              onLoad={(map) => {
                mapRef.current = map;
              }}
            >
              {/* Render marker only if a patient is selected */}
              {markerPosition && (
                <>
                  {/* Red marker icon */}
                  <Marker
                    position={markerPosition}
                    onMouseOver={() => setInfoOpen(true)}
                    onMouseOut={() => setInfoOpen(false)}
                  />

                  {/* Display InfoWindow component if Marker is hovered over */}
                  {infoOpen && (
                    <InfoWindow
                      position={markerPosition}
                      options={{ pixelOffset: new google.maps.Size(0, -40) }}
                    >
                      <div 
                        className="info-window"
                        onMouseOver={() => setInfoOpen(true)}
                        onMouseOut={() => setInfoOpen(false)}
                      >
                        <h3>{patientName}</h3>
                        <div className="lat-lng">
                          <p className="text-secondary">Latitude: {markerPosition.lat}</p>
                          <p className="text-secondary">Longitude: {markerPosition.lng}</p>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </>
              )}
            </GoogleMap>
            
            <div className ="location-patient-dropdown-container">
              <PatientDropdownLocation/>
            </div>
          </>
        ) : (
          <div className="loader">
            <Image src={loader} alt="Loading" />
            <h1>Fetching Data...</h1>
          </div>
        )}
      </LoadScript>

      {/* Snackbar for displaying success/error message(s) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};