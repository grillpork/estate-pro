"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Building2 } from "lucide-react";
import { favoritesService } from "@/services/client/favorites";

interface PropertyCardProps {
  property: {
    id: string | number;
    name?: string;
    title?: string;
    district?: string;
    province?: string;
    address?: string;
    startingPrice?: number;
    price?: number;
    listingType?: string;
    category?: string;
    mainImage?: any;
    image?: string | null;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const favs = await favoritesService.getMyFavorites();
      if (Array.isArray(favs)) {
        const ids = new Set(favs.map((f: any) => f.propertyId.toString()));
        setFavoriteIds(ids);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await favoritesService.toggleFavorite(propertyId);
      if (res.action === "added") {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.add(propertyId);
          return next;
        });
      } else if (res.action === "removed") {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      }
    } catch {
      alert("Please login to save favorites");
    }
  };

  // Normalization to handle different object shapes
  const idStr = String(property.id);
  const title = property.name || property.title || "PREMIUM PROJECT";
  const address = property.address || [property.district, property.province].filter(Boolean).join(", ") || "BANGKOK";
  const category = (property.listingType || property.category || "SALE").toUpperCase();
  const isRent = category === "RENT";

  // Discount Logic
  const hasDiscount = isRent ? property.rentDiscountActive : property.discountActive;
  const originalPrice = isRent ? (property.rentPrice || 0) : (property.startingPrice || property.price || 0);
  const netPrice = isRent 
    ? (property.rentDiscountActive ? (property.rentNetTotal || 0) : (property.rentPrice || 0)) 
    : (property.discountActive ? (property.saleNetTotal || 0) : (property.startingPrice || property.price || 0));
  
  // Handle image: could be an object from DB join, or string from mapping
  let img = property.image;
  if (!img && property.mainImage) {
     if (typeof property.mainImage === "string") {
        img = property.mainImage.startsWith("http") ? property.mainImage : `http://localhost:4000/${property.mainImage}`;
     } else if (property.mainImage.imagePath) {
        img = `http://localhost:4000/${property.mainImage.imagePath}`;
     }
  }

  return (
    <div className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full">
      {/* Text Above Image */}
      <div className="px-3 pt-3 pb-4 flex justify-between items-start">
        <div className="flex-1 overflow-hidden pr-2">
          <h3 className="text-lg font-bold text-neutral-100 transition-colors uppercase tracking-tight line-clamp-1 truncate">
            {title}
          </h3>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-[0.15em] font-black line-clamp-1 truncate">
            <MapPin size={10} className="text-amber-500 shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        </div>
        <button
          onClick={(e) => handleToggleFavorite(e, idStr)}
          className={`shrink-0 p-3 rounded-full transition-all duration-300 ${
            favoriteIds.has(idStr)
              ? "bg-red-500/10 text-red-500"
              : "bg-amber-500/10 text-amber-500 hover:bg-red-500/5 hover:text-red-400"
          }`}
        >
          <Heart size={18} fill={favoriteIds.has(idStr) ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Main Visual */}
      <Link href={`/properties/${idStr}`} className="relative aspect-4/3 rounded-[24px] overflow-hidden bg-neutral-500 mt-auto">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <Building2 size={64} strokeWidth={1} />
          </div>
        )}

        {/* Floating Pills Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none">
          <div className="flex gap-2">
            <div className="bg-black/40 backdrop-blur-sm border border-transparent px-3 py-1.5 rounded-xl text-white flex flex-col items-start gap-0.5 leading-none shadow-2xl">
              {hasDiscount && (
                <span className="text-[7px] font-black line-through text-white/40 uppercase tracking-tighter">
                  ฿ {Intl.NumberFormat("en-US").format(originalPrice)}
                </span>
              )}
              <span className={`text-[10px] font-black uppercase tracking-widest ${hasDiscount ? 'text-amber-400' : ''}`}>
                ฿ {Intl.NumberFormat("en-US").format(netPrice)}
              </span>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-slate-900 flex items-center gap-1.5 shadow-xl leading-none">
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isRent ? "RENT" : "SALE"}
            </span>
          </div>
        </div>

      </Link>
    </div>
  );
}
