"use client"

import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import loader from './loader.gif';

import "bootstrap/dist/css/bootstrap.min.css";
import "./location.css";

const center = {
  lat: 33.6846,
  lng: -117.8265
};

// Track position of map marker
// REPLACE WITH COORDINATES OF THE WATCH AFTER RETRIEVING FROM DATABASE
const markerPosition = {
  lat: 33.6846,
  lng: -117.8265
};

export default function LocationPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Use JavaScript Google Maps API key defined in .env file
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined in environment variables.");
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
          <GoogleMap 
            mapContainerClassName="map-container"
            center={center}
            zoom={10}
          >
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
                  <h3>Bruce Wayne</h3>
                  <div className="lat-lng">
                    <p className="text-secondary">Latitude: {markerPosition.lat}</p>
                    <p className="text-secondary">Longitude: {markerPosition.lng}</p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
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