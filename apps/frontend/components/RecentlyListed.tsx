"use client"

import React, { useEffect, useState } from 'react'
import { getAllPropertiesService } from '@/services/client/property'
import GenericCarousel from './GenericCarousel'
import { MapPin, Building2, Heart } from 'lucide-react'
import Link from 'next/link'
import { favoritesService } from '@/services/client/favorites'

export default function RecentlyListed() {
    const [allProperties, setAllProperties] = useState<any[]>([])
    const [properties, setProperties] = useState<any[]>([])
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'SALE' | 'RENT'>('ALL')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [props, favs] = await Promise.all([
                getAllPropertiesService(),
                favoritesService.getMyFavorites().catch(() => [])
            ])
            
            if (Array.isArray(props)) {
                setAllProperties(props)
                setProperties(props.slice(0, 8)) // Initial load
            }
            if (Array.isArray(favs)) {
                setFavoriteIds(new Set(favs.map((f: any) => f.propertyId.toString())))
            }
        } catch (error) {
            console.error("Failed to fetch recently listed properties:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeFilter === 'ALL') {
            setProperties(allProperties.slice(0, 8))
        } else {
            const filtered = allProperties.filter(p => {
                const type = p.listingType || ""
                if (activeFilter === 'SALE') {
                    return type === 'SALES' || type === 'SALE & RENT'
                }
                if (activeFilter === 'RENT') {
                    return type === 'RENT' || type === 'SALE & RENT'
                }
                return false
            })
            setProperties(filtered.slice(0, 8))
        }
    }, [activeFilter, allProperties])

    const handleFilterClick = (filter: 'SALE' | 'RENT') => {
        setActiveFilter(prev => prev === filter ? 'ALL' : filter)
    }

    const handleToggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
        e.preventDefault()
        e.stopPropagation()
        const isFav = favoriteIds.has(propertyId.toString())
        try {
            if (isFav) {
                const favs = await favoritesService.getMyFavorites()
                const favRecord = favs.find((f: any) => f.propertyId.toString() === propertyId.toString())
                if (favRecord) {
                    await favoritesService.deleteFavorite(favRecord.id)
                    setFavoriteIds(prev => {
                        const next = new Set(prev)
                        next.delete(propertyId.toString())
                        return next
                    })
                }
            } else {
                await favoritesService.createFavorite(propertyId)
                setFavoriteIds(prev => {
                    const next = new Set(prev)
                    next.add(propertyId.toString())
                    return next
                })
            }
        } catch (error) {
            alert("Please login to save favorites")
        }
    }

    if (loading || properties.length === 0) return null;

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 md:px-12 lg:px-16 mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">ประกาศล่าสุด</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">ที่อยู่อาศัยใหม่ล่าสุดในตลาด</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleFilterClick('SALE')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                                activeFilter === 'SALE'
                                ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                            }`}
                        >
                            ขาย
                        </button>
                        <button 
                            onClick={() => handleFilterClick('RENT')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                                activeFilter === 'RENT'
                                ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                        >
                            เช่า
                        </button>
                    </div>
                </div>
            </div>

            <div className="pl-6 md:pl-12 lg:pl-16">
                <GenericCarousel>
                    {properties.map((property) => (
                        <div 
                            key={property.id}
                            className="flex-[0_0_350px] md:flex-[0_0_400px] min-w-0 pr-6"
                        >
                            <div className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full">
                                <div className="px-3 pt-3 pb-4 flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-neutral-100 transition-colors uppercase tracking-tight line-clamp-1">
                                            {property.name || "PREMIUM PROJECT"}
                                        </h3>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-[0.15em] font-black line-clamp-1">
                                            <MapPin size={10} className="text-amber-500 shrink-0" />
                                            {[property.district, property.province].filter(Boolean).join(", ") || "BANGKOK"}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleToggleFavorite(e, property.id)}
                                        className={`p-3 rounded-full transition-all duration-300 ${
                                            favoriteIds.has(property.id.toString()) 
                                            ? 'bg-red-500/10 text-red-500' 
                                            : 'bg-amber-500/10 text-amber-500 hover:bg-red-500/5 hover:text-red-400'
                                        }`}
                                    >
                                        <Heart 
                                            size={18} 
                                            fill={favoriteIds.has(property.id.toString()) ? "currentColor" : "none"} 
                                        />
                                    </button>
                                </div>

                                {/* Main Visual */}
                                <Link href={`/properties/${property.id}`} className="relative aspect-4/3 rounded-[24px] overflow-hidden bg-neutral-500 mt-auto">
                                    {property.mainImage ? (
                                        <img 
                                            src={`http://localhost:4000/${property.mainImage}`} 
                                            alt={property.name}
                                            className="w-full h-full object-cover transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <Building2 size={64} strokeWidth={1} />
                                        </div>
                                    )}

                                    {/* Floating */}
                                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none">
                                        <div className="flex gap-2">
                                            <div className="bg-black/40 backdrop-blur-sm border border-transparent px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    ฿ {Intl.NumberFormat("th-TH").format(Number(property.startingPrice) || 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-slate-900 flex items-center gap-1.5 shadow-xl leading-none">
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {property.listingType || "SALE"}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </GenericCarousel>
            </div>
        </section>
    )
}
