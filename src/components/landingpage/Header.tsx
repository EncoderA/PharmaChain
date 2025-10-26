"use client";

import { use, useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { AnimatedThemeToggler } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Home", link: "#home" },
  { name: "About", link: "#about" },
  { name: "Services", link: "#services" },
  { name: "Contact", link: "#contact" },
];

export function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <Navbar className="top-4">
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} onItemClick={handleItemClick} />
        <div className="flex items-center space-x-2">
          <AnimatedThemeToggler className="cursor-pointer" />
          <NavbarButton
            onClick={() => router.push("/login")}
            variant="primary"
            className="bg-primary text-foreground"
          >
            Login
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center space-x-2">
            <AnimatedThemeToggler />
            <MobileNavToggle isOpen={isOpen} onClick={handleToggle} />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              onClick={handleItemClick}
              className="block text-lg font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {item.name}
            </a>
          ))}
          <div className="mt-4 flex w-full flex-col space-y-2">
            <NavbarButton
              onClick={() => router.push("/login")}
              variant="primary"
              className="w-full bg-primary text-foreground"
            >
              Login
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
