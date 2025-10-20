"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Demo = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInside, setIsMouseInside] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsMouseInside(true);
  const handleMouseLeave = () => setIsMouseInside(false);

  return (
    <div
      className='bg-secondary h-full p-6 relative overflow-hidden cursor-pointer'
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isMouseInside && (
        <motion.div
          className="absolute w-8 h-8 bg-white/20 rounded-full blur-sm cursor-pointer z-10"
          animate={{
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          }}
        />
      )}

      <motion.div
        animate={{
          x: isMouseInside ? (mousePosition.x - 600) * 0.05 : 0,
          y: isMouseInside ? (mousePosition.y - 400) * 0.05 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <video
          src="/5750805-hd_1920_1080_24fps.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto rounded-2xl shadow-lg"
        />
      </motion.div>
    </div>
  );
};

export default Demo;
