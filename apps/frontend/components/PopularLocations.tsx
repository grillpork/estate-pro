"use client"

import React from 'react'
import { MapPin } from 'lucide-react'
import GenericCarousel from './GenericCarousel'

const LOCATIONS = [
    { 
        id: 1, 
        name: 'อโศก', 
        englishName: 'Asoke', 
        image: 'https://prop2morrow.com/wp-content/uploads/2020/11/20201022_201101_49.jpg',
        saleCount: 887,
        rentCount: 1541
    },
    { 
        id: 2, 
        name: 'พระราม 9', 
        englishName: 'Rama 9', 
        image: 'https://cdn-cms.pgimgs.com/static/2020/08/MRT-Rama-9-Area.jpg',
        saleCount: 507,
        rentCount: 1430
    },
    { 
        id: 3, 
        name: 'ทองหล่อ', 
        englishName: 'Thong Lo', 
        image: 'https://cdn-cms.pgimgs.com/static/2020/08/shutterstock_1448443550.jpg',
        saleCount: 1030,
        rentCount: 1851
    },
    { 
        id: 4, 
        name: 'สยาม', 
        englishName: 'Siam', 
        image: 'https://propertyscout.co.th/wp-content/uploads/2022/04/1131784-728x546-1.jpg',
        saleCount: 1030,
        rentCount: 1851
    },
    { 
        id: 5, 
        name: 'เอกมัย', 
        englishName: 'Ekkamai', 
        image: 'https://static.estopolis.com/article/5afd568915f0203e5a62f3c4_5afe5db715f0203e5a62f427.jpg',
        saleCount: 720,
        rentCount: 1102
    },
]

export default function PopularLocations() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 md:px-12 lg:px-16 mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">ทำเลยอดนิยม</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">รวมย่านที่อยู่อาศัยยอดนิยมใจกลางกรุงเทพฯ</p>
                    </div>
                </div>
            </div>

            <div className="pl-6 md:pl-12 lg:pl-16">
                <GenericCarousel>
                    {LOCATIONS.map((loc) => (
                        <div 
                            key={loc.id}
                            className="flex-[0_0_350px] md:flex-[0_0_400px] min-w-0 pr-6"
                        >
                            <div className="group flex flex-col bg-neutral-800 border-2 border-black/70 rounded-[32px] p-1 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full">
                                {/* Header Text */}
                                <div className="px-3 pt-3 pb-4 flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-neutral-100 transition-colors uppercase tracking-tight line-clamp-1">
                                            {loc.name}
                                        </h3>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-[0.15em] font-black line-clamp-1">
                                            {loc.englishName}
                                        </div>
                                    </div>
                                    <div className="bg-amber-500/10 text-amber-500 p-3 rounded-full">
                                        <MapPin size={18} />
                                    </div>
                                </div>

                                {/* Main Visual */}
                                <div className="relative aspect-4/3 rounded-[24px] overflow-hidden bg-neutral-500 mt-auto">
                                    <img 
                                        src={loc.image} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={loc.name}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                    
                                    {/* Floating Stats */}
                                    <div className="absolute inset-x-3 bottom-3 flex gap-2 pointer-events-none">
                                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 flex-1 justify-center">
                                            <span className="text-amber-500 text-[9px] font-black uppercase">ขาย</span>
                                        </div>
                                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 flex-1 justify-center">
                                            <span className="text-emerald-400 text-[9px] font-black uppercase">เช่า</span>
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
