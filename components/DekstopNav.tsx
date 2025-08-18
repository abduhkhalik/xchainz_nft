// components/DekstopNav.jsx
"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export const DekstopNav = ({ logo = "/images/logo.png" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        // Change background after scrolling 50px
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <nav
      className={`fixed w-full px-14 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black" : "bg-transparent"
      }`}
    >
      {/* Main container for the desktop layout */}
      <div className="flex justify-between items-center w-full">
        {/* Left side: Logo */}
        <div className="flex items-center space-x-8">
          <Link
            href="#"
            className="text-white text-3xl font-extrabold uppercase font-darker"
          >
            <Image
              src={logo}
              alt="logo"
              width={800}
              height={600}
              className="w-24 h-24"
              quality={100}
            />
          </Link>
        </div>

        {/* Middle: Main Navigation (Desktop only) */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-12 text-white text-lg font-semibold">
          <div className="relative group flex items-center">
            <Link
              href="#"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Browse
            </Link>
            <ChevronDown className="w-4 h-4 ml-1" />
          </div>

          <input
            type="text"
            placeholder="Enter a code/link"
            className="bg-transparent border-b-2 border-white text-white placeholder-gray-400 focus:outline-none focus:border-green-500 py-1 px-2 text-center"
          />

          <Link
            href="#"
            className="hover:text-gray-300 transition-colors duration-200"
          >
            Confab
          </Link>
        </div>

        {/* Right side: Cart and Account Button */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="#" className="bg-white p-2 rounded-full relative">
            <Badge
              variant={"default"}
              className="absolute text-white bg-black outline-1 outline-white rounded-full top-0 -right-2"
            >
              2
            </Badge>
            <ShoppingCart className="w-6 h-6 text-black hover:text-gray-800 transition-colors duration-200" />
          </Link>
          <Button
            variant={"outline"}
            className="flex items-center space-x-2 outline-1 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200"
          >
            <Link href="#account">ACCOUNT</Link>
          </Button>
        </div>

        {/* Hamburger Menu Button (Mobile only) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Appears when isMenuOpen is true) */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-8 text-white transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-8 text-white"
        >
          <X className="w-8 h-8" />
        </button>
        <Link href="#" className="text-3xl font-bold hover:text-gray-300">
          Browse
        </Link>
        <Link href="#" className="text-3xl font-bold hover:text-gray-300">
          Confab
        </Link>
        <input
          type="text"
          placeholder="Enter a code/link"
          className="bg-transparent border-b-2 border-white text-white placeholder-gray-400 text-center text-xl focus:outline-none focus:border-green-500 py-2 px-4"
        />
        <div className="flex items-center space-x-8">
          <Link href="#">
            <ShoppingCart className="w-8 h-8 hover:text-gray-300" />
          </Link>
          <Button className="flex items-center space-x-2  text-white font-semibold text-xl py-3 px-6 rounded-full ">
            <Link href="#account">ACCOUNT</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
