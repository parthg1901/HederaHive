"use client";

import Image from "next/image";
import gsap from "gsap";
import { useRef, useEffect } from "react";
import Header from "@/components/Header";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(TextPlugin);

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const largeSpheresRef = useRef<HTMLImageElement[]>([]);
  const smallSpheresRef = useRef<HTMLImageElement[]>([]);

  // GSAP animations
  useGSAP(() => {
    const animateSpheres = (spheres: HTMLImageElement[], durationOffset = 0) => {
      spheres.forEach((sphere, index) => {
        gsap.fromTo(
          sphere,
          { y: "100vh" },
          {
            y: "-150vh",
            repeat: -1,
            duration: 8 + index + durationOffset,
            ease: "power1.inOut",
            // delay: index * 0.5,
          }
        );
      });
    };

    if (largeSpheresRef.current) animateSpheres(largeSpheresRef.current);
    if (smallSpheresRef.current) animateSpheres(smallSpheresRef.current, 1);

    gsap.to("#button", {
      backgroundPosition: "200% 0",
      duration: 4,
      ease: "linear",
      repeat: -1,
    });

    gsap.fromTo(
      "#text",
      { text: "Payments that scale." },
      { text: "Payments that connect.", delay: 1, repeat: -1, duration: 3 }
    );
  });

  // Sphere rendering function
  const renderSpheres = (
    count: number,
    size: number,
    refArray: React.MutableRefObject<HTMLImageElement[]>
  ) =>
    Array.from({ length: count }).map((_, index) => (
      <Image
        key={index}
        src="/sphere.svg"
        alt="Floating sphere"
        width={size}
        height={size}
        className="absolute rounded-full opacity-70"
        style={{
          bottom: `-${Math.random() * 50 + 50}px`,
          left: `${Math.random() * 100}vw`,
        }}
        ref={(el) => {
          refArray.current[index] = el!;
        }}
      />
    ));

  return (
    <div className="relative min-h-screen w-full overflow-hidden" ref={containerRef}>
      {/* Header */}
      <Header />

      {/* Background Spheres */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        {renderSpheres(10, 50, largeSpheresRef)}
        {renderSpheres(10, 30, smallSpheresRef)}
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center h-screen gap-4">
        <h3
          id="text"
          className="lg:text-[100px] text-[60px] font-[family-name:var(--font-geist-mono)]"
        >
          Payments that scale.
        </h3>
        <button
          id="button"
          className="relative inline-block text-white p-[0.5px] font-medium rounded-xl
          bg-gradient-to-r from-yellow-500 via-purple-300 to-blue-300
          border border-transparent bg-[length:200%_200%] bg-clip-border"
        >
          <span className="block rounded-xl bg-black px-5 py-2 text-lg font-[family-name:var(--font-geist-mono)]">
            Get Started
          </span>
        </button>
      </main>
    </div>
  );
}
