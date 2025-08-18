import HolderSection from "@/components/HolderSection";
import NewHero from "@/components/NewHero";
import ProgresSection from "@/components/progresSection";
import TwitterTicker from "@/components/tickerSection";
import React from "react";

const Home = () => {
  return (
    <div>
      <NewHero />
      <TwitterTicker />
      <HolderSection />
      <ProgresSection />
    </div>
  );
};

export default Home;
