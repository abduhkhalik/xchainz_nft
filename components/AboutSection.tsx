"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

const AboutSection = ({
  xChainzCharacter = "/images/xChainzCharacter.png",
}) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      <div className="w-full max-w-full h-full grid grid-cols-2">
        {/* Character Images */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute translate-x-12/12 translate-y-1/2 inset-0 z-0 w-[278px] h-[278px] bg-[#E9B410] rounded-[16px]"
          />
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute translate-x-6/12 translate-y-1/12 inset-0 z-1"
          >
            <Image
              src={xChainzCharacter}
              alt="Xchainz Character"
              width={200}
              height={200}
              objectFit="contain"
              quality={100}
            />
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, x: 50 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.6,
              },
            },
          }}
          className="flex flex-col -ml-10 justify-center items-start text-white"
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-rock text-sm mb-2"
          >
            Enter a code/link
          </motion.h2>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-rock w-md"
          >
            <p className="text-6xl">Lorem ipsum dolor sit amet.</p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="my-4"
          >
            <Button
              type="button"
              className="bg-button text-2xl p-4 w-[198px] h-[48px] rounded-[8px] hover:scale-3d"
            >
              Mint
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-rock w-md"
          >
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum nostrum id velit cum, a tempora iusto amet delectus
              accusamus veritatis sit enim vel quae unde modi soluta, minus
              nulla magni.
            </p>
          </motion.div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="relative flex justify-center items-center mb-10"
        >
          <p className="absolute font-bricolage bottom-0 text-white translate-x-2/3 text-center text-4xl font-medium w-md">
            Xcainz is a 300-piece masked NFT collection
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
