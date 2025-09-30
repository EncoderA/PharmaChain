"use client"

import React, { useState, useEffect } from 'react'
import { Eye, FileText, Users, Clock } from 'lucide-react'

const Transparency = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { icon: FileText, label: "Data Entry", desc: "Product information recorded" },
    { icon: Eye, label: "Verification", desc: "Quality checks performed" },
    { icon: Users, label: "Stakeholder Access", desc: "All parties can view status" },
    { icon: Clock, label: "Real-time Updates", desc: "Live status monitoring" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="absolute bg-background inset-0 overflow-hidden border-none transition-all duration-300 ease-out group-hover:scale-102  p-6 -top-20">
      <div className="absolute inset-0 bg-background" />
     

      <div className="relative h-full flex flex-col justify-center">
      

        {/* Process steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === activeStep
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  isActive ? 'bg-accent/10 border-l-2 border-accent' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'border-accent bg-accent/10' : 'border-accent/30'
                }`}>
                  <Icon className={`w-4 h-4 transition-all duration-500 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium transition-all duration-500 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-xs transition-all duration-500 ${
                    isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {step.desc}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6 gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-1 rounded-full transition-all duration-500 ${
                index === activeStep ? 'bg-accent w-6' : 'bg-accent/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Transparency