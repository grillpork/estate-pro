"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, MapPin, Building2 } from 'lucide-react'
import StartChatEmptyState from './StartChatEmptyState'
import { getAllPropertiesService } from '@/services/client/property'

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
  title = "FEATURED LISTINGS", 
  subtitle = "Hand-picked premium properties for your elite lifestyle.", 
  showViewAll = true, 
  limit,
  data
}: PropertyCardsProps) => {
    const [properties, setProperties] = useState<Property[]>(data || []);

    useEffect(() => {
        if (data) {
            setProperties(data);
            return;
        }

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
                } else {
                    console.error("API response is not an array:", response);
                }
            } catch (error) {
                console.error("Failed to fetch properties:", error);
            }
        };
        fetchProperties();
    }, [data]);

    const displayedProperties = limit ? properties.slice(0, limit) : properties;

  return (
    <div>
        {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {(title || subtitle) && (
          <div className="flex items-end justify-between mb-10">
            <div>
              {title && <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{title}</h2>}
              {subtitle && <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{subtitle}</p>}
            </div>
            {showViewAll && (
              <Link href="/properties" className="text-amber-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                VIEW ALL <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayedProperties.length > 0 ? (
            displayedProperties.map((property) => (
              <div 
                key={property.id} 
                className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 "
              >
                {/* Text Above Image */}
                <div className="px-2 pt-2 pb-3 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-100 transition-colors uppercase tracking-tight">
                      {property.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-[0.15em] font-black">
                      <MapPin size={10} className="text-amber-500" />
                      {property.address}
                    </p>
                  </div>
                  <div className=" p-3 bg-amber-500/10 rounded-full">
                   <Heart size={18} className="text-amber-500" />
                  </div>
                </div>

                {/* Main Visual */}
                <Link href={`/properties/${property.id}`} className="relative aspect-4/3 rounded-[24px] overflow-hidden bg-neutral-500">
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
            ))
          ) : (
             <StartChatEmptyState />
          )}
        </div>
      </section>
    </div>
  )
}

export default PropertyCards