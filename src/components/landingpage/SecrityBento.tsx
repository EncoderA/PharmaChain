"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { Shield, Package, Truck, Hospital, CheckCircle } from "lucide-react"
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

const SecurityBento = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const manufacturerRef = useRef<HTMLDivElement>(null)
  const distributorRef = useRef<HTMLDivElement>(null)
  const pharmacyRef = useRef<HTMLDivElement>(null)
  const patientRef = useRef<HTMLDivElement>(null)
  const securityRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute bg-transparent inset-0 overflow-hidden p-4 h-[420px] border-none  transition-all duration-300 ease-out group-hover:scale-102 m-0">
   
      <div className="absolute inset-0 bg-background" />
      
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      <div
        className="relative flex w-full h-full items-center justify-center p-4 pb-20"
        ref={containerRef}
      >
        <Circle 
          ref={securityRef} 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-primary/30 bg-primary/10 size-12"
        >
          <Shield className="size-8 text-primary" />
        </Circle>

        <Circle 
          ref={manufacturerRef} 
          className="absolute top-2 left-12 border-accent bg-background size-12"
        >
          <Package className="size-5 text-primary" />
        </Circle>
        
        <Circle 
          ref={distributorRef} 
          className="absolute top-2 right-12 border-accent bg-background size-12"
        >
          <Truck className="size-5 text-primary" />
        </Circle>
        
        <Circle 
          ref={pharmacyRef} 
          className="absolute bottom-1/2 left-12 border-accent bg-background size-12"
        >
          <Hospital className="size-5 text-primary" />
        </Circle>
        
        <Circle 
          ref={patientRef} 
          className="absolute bottom-1/2 right-12 border-accent bg-background size-12"
        >
          <CheckCircle className="size-5 text-primary" />
        </Circle>

        {/* Animated Beams */}
        <AnimatedBeam
          duration={3}
          containerRef={containerRef}
          fromRef={manufacturerRef}
          toRef={securityRef}
          className="stroke-blue-500/60"
        />
        <AnimatedBeam
          duration={3.5}
          containerRef={containerRef}
          fromRef={distributorRef}
          toRef={securityRef}
          className="stroke-green-500/60"
        />
        <AnimatedBeam
          duration={4}
          containerRef={containerRef}
          fromRef={pharmacyRef}
          toRef={securityRef}
          className="stroke-orange-500/60"
        />
        <AnimatedBeam
          duration={4.5}
          containerRef={containerRef}
          fromRef={patientRef}
          toRef={securityRef}
          className="stroke-purple-500/60"
        />
      </div>

      {/* Floating labels */}
      {/* <div className="absolute top-2 left-2 text-xs text-slate-300 font-medium">
        Manufacturer
      </div>
      <div className="absolute top-2 right-2 text-xs text-slate-300 font-medium">
        Distributor
      </div>
      <div className="absolute bottom-1/3 left-2 text-xs text-slate-300 font-medium">
        Pharmacy
      </div>
      <div className="absolute bottom-1/3 right-2 text-xs text-slate-300 font-medium">
        Patient
      </div> */}
    </div>
  )
}

export default SecurityBento