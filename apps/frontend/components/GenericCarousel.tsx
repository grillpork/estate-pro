"use client"

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GenericCarouselProps {
  children: React.ReactNode;
  options?: any;
}

export default function GenericCarousel({ children, options = {} }: GenericCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    ...options,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((emblaApi: any) => {
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onSelect(emblaApi)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 -ml-3">
          {children}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={`p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl pointer-events-auto transition-all ${
            !canScrollPrev ? 'opacity-20 translate-x-4' : 'hover:bg-amber-500 hover:text-black active:scale-90 translate-x-0'
          }`}
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={`p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl pointer-events-auto transition-all ${
            !canScrollNext ? 'opacity-20 -translate-x-4' : 'hover:bg-amber-500 hover:text-black active:scale-90 translate-x-0'
          }`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}
