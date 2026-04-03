"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// We need to import the internal component dynamically to disable SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMapEvents as any),
  { ssr: false }
);

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  zoom?: number;
}

// Internal component for handling click events
const LocationMarker = ({ 
  lat, 
  lng, 
  onLocationSelect 
}: { 
  lat: number; 
  lng: number; 
  onLocationSelect: (lat: number, lng: number) => void 
}) => {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  const MapEvents = () => {
    const reactLeaflet = require("react-leaflet");
    reactLeaflet.useMapEvents({
      click(e: any) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  if (!L) return null;

  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <>
      <MapEvents />
      <Marker position={[lat, lng]} icon={defaultIcon} />
    </>
  );
};

const MapPicker = ({ 
  lat, 
  lng, 
  onLocationSelect, 
  zoom = 13 
}: MapPickerProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[300px] w-full bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/5 animate-pulse">
        <p className="text-white/20 text-xs font-medium">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  return (
     <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
      <MapContainer
        center={[lat || 13.7563, lng || 100.5018]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
            lat={lat || 13.7563} 
            lng={lng || 100.5018} 
            onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-1000 bg-[#0a0a0f]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-white/60 font-medium">
         คลิกบนแผนที่เพื่อระบุตำแหน่ง
      </div>
    </div>
  );
};

export default MapPicker;
