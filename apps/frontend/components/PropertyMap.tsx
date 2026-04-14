"use client";

import { MapPin, ExternalLink } from "lucide-react";

interface PropertyMapProps {
  lat: any;
  lng: any;
  propertyName?: string;
  address?: string;
  zoom?: number;
}

const PropertyMap = ({ lat, lng, propertyName }: PropertyMapProps) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  // ใช้ Google Maps Embed แบบ Iframe (ไม่ต้องใช้ API Key สำหรับการแสดงผลพิกัดทั่วไป)
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=th&z=16&output=embed`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <section className="mt-16 space-y-10">
      <div className="flex items-center justify-between">
         <h3 className="text-xs font-black uppercase tracking-[.3em] text-white/20">Location Map</h3>
         <a 
          href={googleMapsSearchUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-amber-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-all group"
         >
            <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            View on Google Maps
         </a>
      </div>
      
      <div className="group relative">
        <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0 bg-[#0a0a0f]">
          {/* Google Maps Iframe */}
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={mapUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="opacity-90 grayscale-[0.1] contrast-[1.1]"
          />
          
          {/* Subtle Overlay to blend with dark theme */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-[2.5rem]"></div>
        </div>
      </div>
    </section>
  );
};

export default PropertyMap;
