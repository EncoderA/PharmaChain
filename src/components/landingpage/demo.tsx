"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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
      className="bg-secondary h-full p-6 relative overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mouse spotlight effect */}
      {isMouseInside && (
        <motion.div
          className="absolute w-8 h-8 bg-white/20 rounded-full blur-sm z-10 pointer-events-none"
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

      {/* Parallax effect on image */}
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
        <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/dashboardPage.png" 
            alt="Demo Image"
            fill
            className="object-fill"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Demo;
