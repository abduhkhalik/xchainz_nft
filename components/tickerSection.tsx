"use client";

import { comments } from "@/lib/comments";
import Image from "next/image";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BadgeCheck,
} from "lucide-react";

const TwitterTicker = () => {
  return (
    <div className="w-full bg-black border-y border-neutral-800 py-6 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee gap-16 px-6">
        {[...comments, ...comments].map((tweet, index) => (
          <div
            key={index}
            className="flex items-start gap-3 min-w-[300px] max-w-md text-white"
          >
            {/* Avatar */}
            <Image
              src={tweet.avatar}
              alt={tweet.name}
              width={48}
              height={48}
              className="rounded-full border border-white/20 w-12 h-12 object-cover"
            />

            {/* Tweet Content */}
            <div className="text-sm leading-tight space-y-1 font-sans">
              {/* Name & Handle */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-semibold">{tweet.name}</span>
                {tweet.verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-gray-400">@{tweet.handle}</span>
              </div>

              {/* Comment */}
              <p className="text-gray-100 max-w-[300px]">{tweet.comment}</p>

              {/* Action Icons */}
              <div className="flex gap-4 text-gray-500 text-xs pt-1">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>12</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-4 h-4" />
                  <span>34</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>87</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TwitterTicker;
