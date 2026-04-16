"use client"

import React, { useEffect, useState } from 'react'
import { landmarkService } from '@/services/client/landmark'
import GenericCarousel from './GenericCarousel'

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

export default function NearbyStations() {
    const [allStations, setAllStations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await landmarkService.getAllLandmarks()
                if (response.stations) {
                    // Filter to ensure unique station names
                    const uniqueStations: any[] = []
                    const seenNames = new Set()
                    
                    response.stations.forEach((station: any) => {
                        if (!seenNames.has(station.name)) {
                            seenNames.add(station.name)
                            uniqueStations.push(station)
                        }
                    })
                    
                    setAllStations(uniqueStations)
                }
            } catch (error) {
                console.error("Failed to fetch landmarks:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStations()
    }, [])

    if (loading) return null;

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 md:px-12 lg:px-16 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">สถานีใกล้เคียง</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">เข้าถึงทำเลศักยภาพด้วยการเดินทางที่สะดวกสบาย</p>
                    </div>
                </div>
            </div>

            <div className="pl-6 md:pl-12 lg:pl-16">
                <GenericCarousel>
                    {allStations.map((station) => (
                        <div 
                            key={station.id}
                            className="flex-[0_0_350px] md:flex-[0_0_400px] min-w-0 pr-6"
                        >
                            <div className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full">
                                {/* Header */}
                                <div className="px-3 pt-3 pb-4 flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-neutral-100 transition-colors uppercase tracking-tight line-clamp-1">
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
                                        className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                                        alt={station.name}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                                    
                                    {/* Stats Layers */}
                                    <div className="absolute inset-x-3 bottom-3 flex gap-2 pointer-events-none">
                                        <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 flex flex-col items-center flex-1">
                                            <span className="text-amber-500 text-[9px] font-black uppercase tracking-tight">ขายคอนโด</span>
                                            <span className="text-white text-[10px] font-bold">0</span>
                                        </div>
                                        <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 flex flex-col items-center flex-1">
                                            <span className="text-emerald-400 text-[9px] font-black uppercase tracking-tight">เช่าคอนโด</span>
                                            <span className="text-white text-[10px] font-bold">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </GenericCarousel>
            </div>
        </section>
    )
}
