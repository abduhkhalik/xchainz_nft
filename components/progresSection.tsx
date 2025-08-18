"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";

const ProgresSection = () => {
  // State untuk menyimpan nilai progress (0-100)
  const [progress, setProgress] = useState(0);

  // State untuk menyimpan ID interval
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Fungsi untuk memulai pengisian botol saat hover
  const handleMouseEnter = () => {
    // Hentikan interval sebelumnya jika ada
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Set interval baru untuk menambahkan progress setiap 100ms
    const newIntervalId = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(newIntervalId);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 100);
    setIntervalId(newIntervalId);
  };

  // Fungsi untuk menghentikan pengisian botol dan mereset saat mouse keluar
  const handleMouseLeave = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setProgress(0);
  };

  return (
    <div className="bg-[#032D82] h-[611px] overflow-hidden pr-2">
      <div
        style={{
          backgroundImage: 'url("/bg/bgBlack.svg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="h-screen max-w-full grid grid-cols-2 justify-center items-center px-12"
      >
        {/* Kolom 1 */}
        <div className="text-center text-[#E7E7E7]">
          <h1 className="text-9xl font-darker uppercase font-extrabold mb-5">
            Wellcome
          </h1>
          <p className="text-center mx-auto contain-size font-thin font-jakarta w-[500px]">
            Leverages cutting-edge infrared technology and AI-assisted pattern
            recognition to take a 3D image of your foot and pressure
            distribution in less than 2 minutes no molds required!
          </p>
          <Button
            variant={"outline"}
            className="uppercase text-3xl bg-transparent mt-26 p-6 font-jakarta font-medium h-[80px]"
          >
            account
          </Button>
        </div>
        {/* Kolom 2 */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Wadah botol yang dimiringkan - rotate-12 */}
          <div
            className="relative w-24 h-80 border-4 border-[#E7E7E7] rounded-full shadow-lg overflow-hidden -rotate-12"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Isi botol ini mengikuti rotasi botol sehingga memenuhi wadah */}
            <div
              className="absolute bottom-0 w-full bg-[#E7E7E7] transition-all duration-500 ease-in-out"
              style={{ height: `${progress}%` }}
            ></div>
          </div>

          {/* Label progress */}
          <span className="text-3xl font-bold text-[#E7E7E7]">{`${Math.round(
            progress
          )}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgresSection;
