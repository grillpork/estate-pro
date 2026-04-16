"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, MapPin, Building2 } from 'lucide-react'
import StartChatEmptyState from './StartChatEmptyState'
import { getAllPropertiesService } from '@/services/client/property'
import { favoritesService } from '@/services/client/favorites'
import GenericCarousel from './GenericCarousel'

type Property = {
  id: string;
  title: string;
  description: string | null;
  floor: string;
  price: number;
  address: string;
  image: string | null;
  category?: string;
};

interface PropertyCardsProps {
  title?: string | null;
  subtitle?: string | null;
  showViewAll?: boolean;
  limit?: number;
  data?: Property[];
}

const PropertyCards = ({ 
  title = "รายการแนะนำ", 
  subtitle = "คัดสรรที่อยู่อาศัยระดับพรีเมียม เพื่อไลฟ์สไตล์ที่เหนือระดับ", 
  showViewAll = true, 
  limit,
  data
}: PropertyCardsProps) => {
    const [properties, setProperties] = useState<Property[]>(data || []);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loadingFavs, setLoadingFavs] = useState(false);

    useEffect(() => {
        if (data) {
            setProperties(data);
        } else {
            fetchProperties();
        }
        fetchFavorites();
    }, [data]);

    const fetchProperties = async () => {
        try {
            const response = await getAllPropertiesService();
            if (Array.isArray(response)) {
                const mapped = response.map((p: any) => ({
                    id: p.id.toString(),
                    title: p.name || "PREMIUM PROJECT",
                    description: p.description,
                    floor: p.floor?.toString() || "-",
                    price: Number(p.startingPrice) || 0,
                    address: [p.district, p.province].filter(Boolean).join(", ") || "BANGKOK",
                    image: p.mainImage ? `http://localhost:4000/${p.mainImage}` : null,
                    category: p.listingType
                }));
                setProperties(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        }
    };

    const fetchFavorites = async () => {
        try {
            setLoadingFavs(true);
            const favs = await favoritesService.getMyFavorites();
            if (Array.isArray(favs)) {
                const ids = new Set(favs.map((f: any) => f.propertyId.toString()));
                setFavoriteIds(ids);
            }
        } catch (error) {
            // User might not be logged in, ignore silently
        } finally {
            setLoadingFavs(false);
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const res = await favoritesService.toggleFavorite(propertyId);
            if (res.action === "added") {
                setFavoriteIds(prev => {
                    const next = new Set(prev);
                    next.add(propertyId);
                    return next;
                });
            } else if (res.action === "removed") {
                setFavoriteIds(prev => {
                    const next = new Set(prev);
                    next.delete(propertyId);
                    return next;
                });
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            alert("Please login to save favorites");
        }
    };

    const displayedProperties = limit ? properties.slice(0, limit) : properties;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Header Container */}
      <div className="w-full px-6 md:px-12 lg:px-16 mb-10">
        {(title || subtitle) && (
          <div className="flex items-end justify-between">
            <div>
              {title && <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{title}</h2>}
              {subtitle && <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>}
            </div>
            {showViewAll && (
              <Link href="/properties" className="text-amber-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Carousel Container - Full Width Bleed */}
      <div className="pl-6 md:pl-12 lg:pl-16">
        {displayedProperties.length > 0 ? (
          <GenericCarousel>
            {displayedProperties.map((property) => (
              <div 
                key={property.id} 
                className="flex-[0_0_350px] md:flex-[0_0_400px] min-w-0 pr-6"
              >
                <div className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full">
                  {/* Text Above Image */}
                  <div className="px-3 pt-3 pb-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-100 transition-colors uppercase tracking-tight line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-[0.15em] font-black line-clamp-1">
                        <MapPin size={10} className="text-amber-500 shrink-0" />
                        {property.address}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleToggleFavorite(e, property.id)}
                      className={` p-3 rounded-full transition-all duration-300 ${
                          favoriteIds.has(property.id) 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-amber-500/10 text-amber-500 hover:bg-red-500/5 hover:text-red-400'
                      }`}
                    >
                     <Heart 
                       size={18} 
                       fill={favoriteIds.has(property.id) ? "currentColor" : "none"} 
                     />
                    </button>
                  </div>

                  {/* Main Visual */}
                  <Link href={`/properties/${property.id}`} className="relative aspect-4/3 rounded-[24px] overflow-hidden bg-neutral-500 mt-auto">
                    {property.image ? (
                      <img 
                        src={property.image} 
                        alt={property.title}
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
                        <div className="bg-black/40 backdrop-blur-sm border border-transparent px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest">฿ {Intl.NumberFormat("en-US").format(property.price)} </span>
                        </div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-slate-900 flex items-center gap-1.5 shadow-xl leading-none">
                         <span className="text-[10px] font-black uppercase tracking-widest">
                          {property.category === 'RENT' ? 'RENT' : 'SALE'}
                         </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </GenericCarousel>
        ) : (
          <div className="pr-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]">
            <StartChatEmptyState />
          </div>
        )}
      </div>
    </section>
  )
}

export default PropertyCards