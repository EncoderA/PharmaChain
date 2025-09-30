"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { MapPin, Package2, Truck, Building2, User, Navigation } from "lucide-react"
import { AnimatedBeam } from "../ui/animated-beam"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-8 items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = "Circle"

const TrackBento = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<HTMLDivElement>(null)
  const warehouseRef = useRef<HTMLDivElement>(null)
  const transitRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)
  const trackerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute bg-background inset-0 overflow-hidden p-4 h-[420px] border-none transition-all duration-300 ease-out group-hover:scale-102 m-0">
      
      <div className="absolute inset-0 bg-background" />
      
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
    
      <div
        className="relative flex w-full h-full items-center justify-center p-4 pb-20"
        ref={containerRef}
      >
        <Circle 
          ref={originRef} 
          className="absolute top-1/4 left-8 transform -translate-y-1/2 border-accent bg-background size-12"
        >
          <Package2 className="size-6 text-primary" />
        </Circle>
        
        <Circle 
          ref={warehouseRef} 
          className="absolute top-1/4 left-36 transform -translate-x-1/2 -translate-y-1/2 border-accent bg-background size-12"
        >
          <Building2 className="size-6 text-primary" />
        </Circle>
        
        <Circle 
          ref={transitRef} 
          className="absolute top-1/4 right-38 transform translate-x-1/2 -translate-y-1/2 border-accent bg-background size-12"
        >
          <Truck className="size-6 text-primary" />
        </Circle>
        
        <Circle 
          ref={destinationRef} 
          className="absolute top-1/4 right-8 transform -translate-y-1/2 border-accent bg-background size-12"
        >
          <MapPin className="size-6 text-primary" />
        </Circle>

        <AnimatedBeam
          duration={2.5}
          containerRef={containerRef}
          fromRef={originRef}
          toRef={warehouseRef}
          className="stroke-green-500/60"
        />
        <AnimatedBeam
          duration={3}
          containerRef={containerRef}
          fromRef={warehouseRef}
          toRef={transitRef}
          className="stroke-blue-500/60"
        />
        <AnimatedBeam
          duration={3.5}
          containerRef={containerRef}
          fromRef={transitRef}
          toRef={destinationRef}
          className="stroke-orange-500/60"
        />
      </div>

    </div>
  )
}

export default TrackBento