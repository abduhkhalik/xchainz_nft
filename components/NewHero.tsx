import Image from "next/image";
import React from "react";
import CircularText from "./CircularText";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

const NewHero = ({
  heroImage = "/images/heroImage.png",
  eventImg = "/images/events.png",
  collection = "/images/vector.png",
}) => {
  return (
    <section
      className="h-[746px] overflow-hidden py-24 w-full"
      style={{
        backgroundImage: 'url("/bg/herobg.svg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-full text-[#E7E7E7] flex justify-center items-center ">
        <div className="max-w-full text-center -ml-16">
          <h1 className="uppercase font-darker font-extrabold text-9xl">
            xcainz
          </h1>
          <p className="font-jakarta font-light mx-auto contain-size">
            Leverages cutting-edge infrared technology and AI-assisted pattern
            recognition to take a 3D image of your foot and pressure
            distribution in less than 2 minutes no molds required!
          </p>
        </div>
      </div>

      <div className="w-full max-w-full grid grid-cols-3 gap-10 px-12 -mt-16">
        <div className="w-full flex flex-col justify-center items-center">
          <ArrowRight className="h-24 w-24 hover:text-[#E7E7E7] transition-all ease-in-out" />
          <div className="grid grid-cols-2 gap-10 justify-center items-center mb-10">
            <div>
              <Image
                src={collection}
                alt="collection achivment"
                width={800}
                height={800}
                quality={100}
                className="w-[121px] object-contain"
              />
              <div className="text-center text-[#E7E7E7]">
                <p>
                  Non verified <br /> Collection
                </p>
              </div>
            </div>
            <div>
              <Image
                src={collection}
                alt="collection achivment"
                width={800}
                height={800}
                quality={100}
                className="w-[121px] object-contain grayscale-50"
              />
              <div className="text-center text-[#E7E7E7]">
                <p>
                  Non verified <br /> Collection
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[#E7E7E7] text-center px-8">
              Leverages cutting-edge infrared technology and AI-assisted pattern
              recognition to take a 3D to take a 3D.
            </p>
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <Image
            src={heroImage}
            alt="Hero Image"
            width={800}
            height={600}
            className="max-w-[365px] -ml-12"
          />
        </div>
        <div className="w-full flex justify-center items-center font-jakarta">
          <Card className="relative bg-transparent backdrop-blur-sm w-[318px] pt-12">
            <div className="absolute -top-[60px] -left-12">
              <CircularText
                text="BOUNTY*STREET*HUNT*"
                onHover="speedUp"
                spinDuration={20}
                className="outline-2 inset-1 inline-block font-light z-0"
              />
            </div>
            <CardContent>
              <div className="bg-[#032D82] h-20 flex justify-center items-end rounded-lg">
                <Image
                  src={eventImg}
                  alt="events image"
                  width={800}
                  height={600}
                  className="object-cover"
                  quality={100}
                />
              </div>
              <div>
                <h2 className="uppercase text-white text-2xl text-center font-bold">
                  bounty street hunt
                </h2>
              </div>
              <div>
                <ul className="text-white font-light list-disc list-inside list-disc-blue">
                  <li>Custom</li>
                  <li>Fast</li>
                  <li>Affordable</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant={"default"}
                type="button"
                size={"icon"}
                className="bg-[#09AAFB] w-full text-black hover:bg-[#032D82]"
              >
                Get Your Groov
                <ArrowRight className="h-14 w-14" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NewHero;
