"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X,
  Target
} from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  propertyId?: number;
  listingType?: string;
  propertyName?: string;
}

const PropertyGallery = ({ 
  images = [], 
  propertyId, 
  listingType,
  propertyName 
}: PropertyGalleryProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-video rounded-3xl overflow-hidden bg-[#111118] border border-white/5 flex items-center justify-center text-white/5 shadow-2xl">
        <Building2 size={120} />
      </div>
    );
  }

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-6">
      {/* Main Image View */}
      <div className="relative aspect-video lg:aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden group bg-[#111118] border border-white/5 shadow-2xl z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={images[activeImage]}
            alt={propertyName || "Property Image"}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-col gap-3">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-amber-500 text-black px-4 md:px-6 py-2 rounded-2xl text-[10px] md:text-[11px] font-black shadow-2xl uppercase tracking-[0.2em] flex items-center gap-2"
          >
            <Target size={14} className="animate-pulse" />
            {listingType === 'RENT' ? 'ให้เช่า' : 'ประกาศขาย'}
          </motion.div>
          
          <motion.span 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0f]/60 backdrop-blur-xl px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-bold border border-white/10 uppercase tracking-widest text-white/50 w-fit"
          >
            REF: #{propertyId}
          </motion.span>
        </div>

        {/* Floating Controls */}
        <div className="absolute inset-y-0 left-4 md:left-6 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={prevImage}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-amber-500 hover:border-amber-500 hover:text-black transition-all hover:scale-110 active:scale-95 shadow-2xl"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-4 md:right-6 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={nextImage}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-amber-500 hover:border-amber-500 hover:text-black transition-all hover:scale-110 active:scale-95 shadow-2xl"
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* View Fullscreen Button */}
        <button 
          onClick={() => setShowModal(true)}
          className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95 shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
        >
          <Maximize2 size={24} />
        </button>

        {/* Progress Dots */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
             <div 
               key={i} 
               className={`h-1 rounded-full transition-all duration-500 ${activeImage === i ? 'w-6 md:w-8 bg-amber-500' : 'w-1.5 md:w-2 bg-white/30'}`}
             />
          ))}
        </div>
      </div>

      {/* Thumbnail Grid Layout - Hide Scrollbar */}
      <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all duration-500 ${
              activeImage === idx 
                ? 'border-amber-500 ring-4 ring-amber-500/20 scale-95' 
                : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
            {activeImage === idx && (
               <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                  <div className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
               </div>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen Dark Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-[#0a0a0f] flex flex-col items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 hover:bg-red-500 transition-colors flex items-center justify-center text-white z-200"
            >
              <X size={32} />
            </button>
            
            <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden">
               <motion.img 
                 key={activeImage}
                 src={images[activeImage]} 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="max-w-full max-h-[80vh] object-contain rounded-2xl md:rounded-3xl shadow-2xl" 
                 alt="Enlarged view" 
               />
               
               {/* Modal Nav */}
               <button onClick={prevImage} className="absolute left-4 p-4 text-white/30 hover:text-white transition-colors">
                 <ChevronLeft size={48} />
               </button>
               <button onClick={nextImage} className="absolute right-4 p-4 text-white/30 hover:text-white transition-colors">
                 <ChevronRight size={48} />
               </button>
            </div>

            <div className="w-full flex justify-center gap-3 overflow-x-auto py-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
               {images.map((img, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveImage(idx)}
                   className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                     activeImage === idx ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/20' : 'border-white/10 opacity-30 hover:opacity-100'
                   }`}
                 >
                   <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyGallery;
