"use client";

import { Moon, SunDim } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export const AnimatedThemeToggler = ({ className }: {className?: string}) => {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const changeTheme = async () => {
    if (!buttonRef.current || !document.startViewTransition) return;

    await document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = isDarkMode ? "light" : "dark";
        setTheme(newTheme); 
        setIsDarkMode(newTheme === "dark");
      });
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(
        "p-2 z-50 rounded-full bg-transparent cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
    >
      {isDarkMode ? (
        <SunDim className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};