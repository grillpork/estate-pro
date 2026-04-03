"use client";

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const slides = [
  { id: 1, src: "https://i.ytimg.com/vi/jW-5FLsB3-c/maxresdefault.jpg", title: "Luxury Exterior" },
  { id: 2, src: "https://reroom.ai/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FFV8miKNd3yFQsUZdiZHNqQ%2F940f8c5e-3a14-4ed1-b4f0-dc66f2b34700%2Fpublic&w=1920&q=75", title: "Modern Interior" },
  { id: 3, src: "https://img.freepik.com/premium-photo/beautiful-modern-house-generated-ai_780748-250.jpg", title: "Elite Penthouse" },
]

export default function CarouselEmbla() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      skipSnaps: false,
    },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  return (
    <div className="relative w-full h-screen overflow-hidden group">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="embla__slide relative flex-[0_0_100%] min-w-0 h-full"
            >
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={slide.src}
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-transform duration-6000 ease-linear ${index === selectedIndex ? 'scale-110' : 'scale-100'}`}
                />

                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

                <div className={`absolute inset-0 flex items-end pb-20 md:pb-32 transition-all duration-1000 ${index === selectedIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <div className="max-w-7xl mx-auto px-6 md:px-10 w-full text-white">
                    
                    <h2 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none max-w-4xl">
                      {slide.title}
                    </h2>
                    <p className="text-sm md:text-lg text-white/40 max-w-2xl font-bold uppercase tracking-widest leading-relaxed">
                      Transforming the skyline with futuristic architecture and sustainable living.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className="relative h-1.5 overflow-hidden rounded-full bg-white/20 transition-all duration-500 hover:bg-white/40"
            style={{ width: index === selectedIndex ? '4rem' : '1rem' }}
          >
            {index === selectedIndex && (
              <div
                key={selectedIndex}
                className="absolute inset-y-0 left-0 bg-white shadow-[0_0_10px_white] animate-progress-line"
                style={{ width: '100%' }}
              />
            )}
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes progress-line {F
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-progress-line {
          animation: progress-line 6000ms linear forwards;
        }
      `}</style>
    </div>
  )
}
