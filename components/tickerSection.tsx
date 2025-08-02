// components/TwitterTicker.tsx
"use client";

import { comments } from "@/lib/comments";
import Image from "next/image";

const TwitterTicker = () => {
  return (
    <div className="w-full bg-black border-y border-neutral-800 py-12 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee gap-16 px-6">
        {[...comments, ...comments].map((tweet, index) => (
          <div key={index} className="flex items-center gap-3 text-white">
            <Image
              src={tweet.avatar}
              alt={tweet.name}
              width={800}
              height={600}
              quality={100}
              className="rounded-full border w-14 h-14  border-white/30"
            />
            <div className="text-sm">
              <span className="font-bold">{tweet.name}</span>{" "}
              <span className="text-gray-400">{tweet.handle}</span> ·{" "}
              <span className="italic">&quot;{tweet.comment}&quot;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TwitterTicker;
