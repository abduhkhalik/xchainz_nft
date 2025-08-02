// components/AboutSection.tsx
"use client";

import Image from "next/image";

const AboutSection = ({ nftCharacter = "/images/xChainzCharacter.png" }) => {
  return (
    <section className="min-h-screen w-full bg-black overflow-hidden text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* NFT Character with Yellow Background */}
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

        {/* Text Section */}
        <div className="text-center md:text-left space-y-6 font-rock">
          <p className="text-sm font-light italic">Enter a code/link</p>
          <h1 className="text-4xl md:text-5xl font-bold font-handwritten leading-snug">
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
      </div>

      {/* Footer Description */}
      <div className="pt-24 text-center">
        <p className="text-xl md:text-2xl font-semibold">
          Xcainz is a 300-piece masked NFT collection
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
