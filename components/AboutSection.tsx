"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
  nftCharacter?: string;
};

const AboutSection = ({ nftCharacter = "/images/xChainzCharacter.png" }: Props) => {
  const controls = useAnimation();

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [inView, controls]);

  const fadeVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col items-center justify-center px-6 py-12"
    >
      {/* Background animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="moving-dots w-full h-full opacity-10" />
      </div>

      {/* Foreground content */}
      <motion.div
        variants={fadeVariant}
        initial="hidden"
        animate={controls}
        className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10"
      >
        {/* Image section */}
        <div className="flex justify-center">
          <div className="bg-amber-400 rounded-2xl w-[260px] h-[260px] flex items-center justify-center">
            <Image
              src={nftCharacter}
              alt="NFT Character"
              width={800}
              height={800}
              className="object-contain w-[200px] h-auto"
              priority
            />
          </div>
        </div>

        {/* Text section */}
        <div className="text-center md:text-left space-y-3.5 font-rock">
          <p className="text-sm font-light italic">Enter a code/link</p>
          <h1 className="text-4xl md:text-6xl font-bold">
            Lorem ipsum dolor sit amet.
          </h1>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition">
            Mint
          </button>
          <p className="text-sm md:text-base font-light max-w-md mx-auto md:mx-0">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
            nostrum id velit cum, a tempora iusto amet delectus accusamus
            veritatis sit enim vel quae unde modi soluta, minus nulla magni.
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={fadeVariant}
        initial="hidden"
        animate={controls}
        className="relative z-10 pt-24 text-center"
      >
        <p className="text-xl md:text-4xl font-bold">
          Xcainz is a 300-piece masked NFT collection
        </p>
      </motion.div>

      {/* CSS animation */}
      <style jsx>{`
        .moving-dots {
          background-image: radial-gradient(#ffffff 2px, transparent 3px);
          background-size: 30px 30px;
          animation: moveDots 30s linear infinite;
        }

        @keyframes moveDots {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 1000px 500px;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
