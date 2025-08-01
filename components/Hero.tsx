"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

const HeroSection = ({
  ratCharacterSrc = "/images/ratCharacter.png",
  tunnelSrc = "/images/tunnel.png",
  tunnelCoverSrc = "/images/tunnelcover.png",
  backgroundSrc = "/background/hero.png",
  backgroundOutSrc = "/background/street.png",
}) => {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black">
      {/* Background Image - Tidak dianimasikan */}
      <div className="absolute inset-0 z-20">
        <Image
          src={backgroundSrc}
          alt="Background wall"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="absolute inset-0 z-0 translate-x-5/12 translate-y-16">
        <Image
          src={backgroundOutSrc}
          alt="Background Street"
          width={400}
          height={400}
          objectFit="contain"
          quality={100}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-white text-3xl leading-[150%] font-rock text-center mt-8 w-xl mb-6"
        >
          XCAINZ IS A 300- PIECE MASKED NFT COLLECTION
        </motion.h1>

        {/* Image Container */}
        <div
          className="relative w-full max-w-4xl mx-auto flex justify-center items-end"
          style={{ height: "60vh" }}
        >
          {/* Button */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute right-0 bottom-1/2 transform translate-y-1/2 -translate-x-1/2 z-40"
          >
            <Button className="bg-button hover:bg-button text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
              Login with Xaman
            </Button>
          </motion.div>

          {/* Tunnel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-0 w-full flex translate-y-5/6 justify-center z-20"
          >
            <Image
              src={tunnelSrc}
              alt="Tunnel"
              width={250}
              height={250}
              objectFit="contain"
            />
          </motion.div>

          {/* Rat Character */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute left-1/4 bottom-3 transform -translate-x-2/3 translate-y-2/12 z-30"
          >
            <Image
              src={ratCharacterSrc}
              alt="Rat Character"
              width={400}
              height={600}
              objectFit="contain"
              quality={100}
            />
          </motion.div>

          {/* Tunnel Cover */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute bottom-0 transform translate-y-2/6 z-30"
          >
            <Image
              src={tunnelCoverSrc}
              alt="Tunnel Cover"
              width={250}
              height={250}
              objectFit="contain"
              quality={100}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
