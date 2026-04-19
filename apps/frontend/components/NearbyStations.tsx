"use client"

import React, { useEffect, useState } from 'react'
import { landmarkService } from '@/services/client/landmark'
import { getAllPropertiesService } from '@/services/client/property'
import GenericCarousel from './GenericCarousel'
import { useRouter, useSearchParams } from 'next/navigation'

const LINE_COLORS: { [key: string]: string } = {
    'Blue': '#0055A4',
    'Purple': '#702C8D',
    'Sukhumvit': '#80C342', 
    'Yellow': '#FFD100',
}

const LINE_LABELS: { [key: string]: string } = {
    'Sukhumvit': 'สายสุขุมวิท',
    'Blue': 'สายสีน้ำเงิน',
    'Purple': 'สายสีม่วง',
}

const STATION_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/f/f2/%28THA-Bangkok%29_BTS_890-990_%40_Talat_Phlu_2024-02-12.jpg";

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

export default function NearbyStations() {
    const [allStations, setAllStations] = useState<any[]>([])
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'BTS' | 'MRT'>('ALL')
    const router = useRouter()
    const searchParams = useSearchParams()
    const stationType = searchParams.get('stationType')

    useEffect(() => {
        if (stationType === 'MRT') {
            setActiveFilter('MRT');
        } else if (stationType === 'BTS') {
            setActiveFilter('BTS');
        }
    }, [stationType]);

    // เพิ่มตัวดักจับสัญญาณ (Custom Event Listener)
    useEffect(() => {
        const handleFilterEvent = (e: any) => {
            if (e.detail) {
                setActiveFilter(e.detail);
            }
        };
        window.addEventListener('filterStations', handleFilterEvent);
        return () => window.removeEventListener('filterStations', handleFilterEvent);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both stations and properties in parallel
                const [stationsRes, propertiesRes] = await Promise.all([
                    landmarkService.getAllLandmarks(),
                    getAllPropertiesService()
                ])

                if (stationsRes.stations) {
                    const uniqueStations: any[] = []
                    const seenNames = new Set()
                    
                    stationsRes.stations.forEach((station: any) => {
                        if (!seenNames.has(station.name)) {
                            seenNames.add(station.name)
                            uniqueStations.push(station)
                        }
                    })
                    setAllStations(uniqueStations)
                }

                if (Array.isArray(propertiesRes)) {
                    setProperties(propertiesRes)
                }

            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return null;

    const filteredStations = allStations.filter(station => {
        if (activeFilter === 'ALL') return true;
        return station.type === activeFilter;
    });

    const handleStationClick = (stationName: string, lat: number, lng: number) => {
        router.push(`/properties?station=${encodeURIComponent(stationName)}&lat=${lat}&lng=${lng}&radius=3`);
    }

    const getPropertyCounts = (stationLat: number, stationLng: number) => {
        let sale = 0;
        let rent = 0;
        
        properties.forEach(p => {
            const propLat = parseFloat(p.latitude);
            const propLng = parseFloat(p.longitude);
            
            const distance = calculateDistance(stationLat, stationLng, propLat, propLng);
            
            // Check if within 3km radius
            if (distance <= 3) {
                const type = p.listingType?.toUpperCase() || "";
                if (type === 'SALES' || type === 'SALE & RENT') sale++;
                if (type === 'RENT' || type === 'SALE & RENT') rent++;
            }
        });
        
        return { sale, rent };
    }

    return (
        <section id="nearby-stations" className="py-20 relative overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 md:px-12 lg:px-16 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">สถานีใกล้เคียง</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">ค้นหาโครงการใกล้สถานีรถไฟฟ้าภายในรัศมี 3 กิโลเมตร</p>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                        {[
                            { id: 'ALL', label: 'ทั้งหมด' },
                            { id: 'BTS', label: 'BTS' },
                            { id: 'MRT', label: 'MRT' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id as any)}
                                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                                    activeFilter === filter.id
                                        ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20"
                                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pl-6 md:pl-12 lg:pl-16">
                <GenericCarousel>
                    {filteredStations.map((station) => {
                        const counts = getPropertyCounts(station.latitude, station.longitude);
                        return (
                            <div 
                                key={station.id}
                                onClick={() => handleStationClick(station.name, station.latitude, station.longitude)}
                                className="flex-[0_0_350px] md:flex-[0_0_400px] min-w-0 pr-6 cursor-pointer"
                            >
                                <div className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full active:scale-[0.98]">
                                    {/* Header */}
                                    <div className="px-3 pt-3 pb-4 flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-neutral-100 transition-colors uppercase tracking-tight line-clamp-1 group-hover:text-amber-500">
                                                {station.name}
                                            </h3>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-[0.15em] font-black line-clamp-1">
                                                <div 
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: LINE_COLORS[station.line] || '#fff' }}
                                                />
                                                {LINE_LABELS[station.line] || station.line} Line
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl shrink-0">
                                           <span className="font-black text-[12px]" style={{ color: LINE_COLORS[station.line] || '#000' }}>
                                                {station.type === 'MRT' ? 'M' : 'B'}
                                           </span>
                                        </div>
                                    </div>

                                    {/* Main Visual */}
                                    <div className="relative aspect-4/3 rounded-[24px] overflow-hidden bg-neutral-500 mt-auto">
                                        <img 
                                            src={STATION_IMAGE} 
                                            className="w-full h-full object-cover opacity-60 transition-transform duration-700"
                                            alt={station.name}
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                                        
                                        {/* Stats Layers */}
                                        <div className="absolute inset-x-3 bottom-3 flex gap-2 pointer-events-none">
                                            <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 flex flex-col items-center flex-1">
                                                <span className="text-amber-500 text-[9px] font-black uppercase tracking-tight">ขายคอนโด</span>
                                                <span className="text-white text-[10px] font-bold">{counts.sale}</span>
                                            </div>
                                            <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 flex flex-col items-center flex-1">
                                                <span className="text-emerald-400 text-[9px] font-black uppercase tracking-tight">เช่าคอนโด</span>
                                                <span className="text-white text-[10px] font-bold">{counts.rent}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </GenericCarousel>
            </div>
        </section>
    )
}
