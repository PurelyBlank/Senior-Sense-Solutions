"use client"

import { GoogleMap, LoadScript } from '@react-google-maps/api';

import "bootstrap/dist/css/bootstrap.min.css";
import "./location.css";

const containerStyle = {
  width: '850px',
  height: '850px'
};

const center = {
  lat: 33.6846,
  lng: -117.8265
};

export default function LocationPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log("API Key:", apiKey);

  return (
    <div className="google-maps">
      <LoadScript googleMapsApiKey={apiKey!}>
        <GoogleMap 
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
        />
      </LoadScript>
    </div>
  );
};