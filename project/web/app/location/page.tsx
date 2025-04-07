"use client"

import { useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

import "bootstrap/dist/css/bootstrap.min.css";
import "./location.css";

const center = {
  lat: 33.6846,
  lng: -117.8265
};

export default function LocationPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="google-maps">
      <LoadScript 
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        onLoad={() => {
          console.log("Google Maps API Loaded");
          setIsLoaded(true);
        }}
      >
        {isLoaded ? (
          <GoogleMap 
            mapContainerClassName="map-container"
            center={center}
            zoom={10}
          />
        ) : (
          <div>Loading map...</div>
        )}
      </LoadScript>
    </div>
  );
};