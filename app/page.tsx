import AboutSection from "@/components/AboutSection";
import Hero from "@/components/Hero";
import TwitterTicker from "@/components/tickerSection";
import React from "react";

const Home = () => {
  return (
    <div>
      <Hero/>
      <TwitterTicker/>
      <AboutSection/>
    </div>
  );
};

export default Home;
