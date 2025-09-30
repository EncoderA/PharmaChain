import React from 'react'
import { Button } from '../ui/button'

export const CTA = () => {
  return (
    <div className="py-20 px-8">
      <div className="max-w-xl mx-auto text-center flex flex-col gap-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
          Ready to Secure Your Supply Chain?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" className='border text-base border-foreground px-6 py-4 rounded-xl'>
            Start Tracking
          </Button>
        </div>
      </div>
    </div>
  )
}
