"use client"

import { useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import Image from 'next/image';
import loader from './loader.gif';

import "bootstrap/dist/css/bootstrap.min.css";
import "./location.css";

const center = {
  lat: 33.6846,
  lng: -117.8265
};

export default function LocationPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
        {isLoaded ? (
          <GoogleMap 
            mapContainerClassName="map-container"
            center={center}
            zoom={10}
          />
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