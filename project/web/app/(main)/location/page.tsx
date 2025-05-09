"use client"

import { useState, useEffect } from 'react';

import Image from 'next/image';
import loader from './loader.gif';

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

  const { wearable_id } = useWearable();

  // Use JavaScript Google Maps API key defined in .env file
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined in environment variables.");
  }

  useEffect(() => {
    const fetchLocation = async () => {
      if (!wearable_id) {
        setMarkerPosition(null);

        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const apiUrl = `${baseApiUrl}/location/${wearable_id}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch location data.");
        }

        // Update marker position with fetched latitude and longitude
        setMarkerPosition({
          lat: data.latitude,
          lng: data.longitude,
        });
      } catch (err) {
        console.error("Fetch location error:", err);

        setMarkerPosition(null);
      }
    };

    fetchLocation();
  }, [wearable_id]);

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
            >
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
                        <h3>Patient Location</h3>
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
    </div>
  );
};