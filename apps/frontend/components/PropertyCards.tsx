"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, MapPin, Building2 } from 'lucide-react'
import StartChatEmptyState from './StartChatEmptyState'
import { getAllPropertiesService } from '@/services/client/property'
import { favoritesService } from '@/services/client/favorites'
import PropertyCard from './PropertyCard'
import GenericCarousel from './GenericCarousel'

type Property = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  floor?: string;
  price?: number;
  startingPrice?: number;
  address?: string;
  image?: string | null;
  mainImage?: any;
  category?: string;
  listingType?: string;
  discountActive?: boolean;
  saleNetTotal?: number;
  rentDiscountActive?: boolean;
  rentNetTotal?: number;
  rentPrice?: number;
};

interface PropertyCardsProps {
  title?: string | null;
  subtitle?: string | null;
  showViewAll?: boolean;
  limit?: number;
  data?: Property[];
  excludeId?: string;
}

const PropertyCards = ({
  title = "รายการแนะนำ",
  subtitle = "คัดสรรที่อยู่อาศัยระดับพรีเมียม เพื่อไลฟ์สไตล์ที่เหนือระดับ",
  showViewAll = true,
  limit,
  data,
  excludeId
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
          ...p,
          id: p.id.toString(),
          title: p.name || "PREMIUM PROJECT",
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

  const filteredProperties = excludeId
    ? properties.filter(p => p.id.toString() !== excludeId)
    : properties;
  const displayedProperties = limit ? filteredProperties.slice(0, limit) : filteredProperties;

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
                <PropertyCard property={property as any} />
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