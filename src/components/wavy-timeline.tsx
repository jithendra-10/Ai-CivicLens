'use client';

import { useRef, useState, useEffect } from 'react';

const howItWorks = [
  {
    step: 1,
    title: 'Report Issue',
    description: 'Citizens report civic issues by uploading a photo and location.',
  },
  {
    step: 2,
    title: 'AI Processing',
    description: 'AI analyzes the image to categorize the issue and checks for duplicates.',
  },
  {
    step: 3,
    title: 'Action Taken',
    description: 'Authorities review the AI-assisted report and take action to resolve it.',
  },
  {
    step: 4,
    title: 'Get Notified',
    description: 'Citizens receive real-time status updates and confirmation when the issue is resolved.',
  },
];

export function WavyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemTranslations, setItemTranslations] = useState<number[]>(
    Array(howItWorks.length).fill(0)
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { clientX } = event;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const cursorX = clientX - left; // Cursor position relative to the container

    const newTranslations = howItWorks.map((_, index) => {
      // Position of the center of each item
      const itemCenterX = (width / howItWorks.length) * (index + 0.5);
      const distance = Math.abs(cursorX - itemCenterX);

      // A sine wave function to create the wave effect
      // Max amplitude of the wave
      const maxAmplitude = -16; // Moves up by 16px
      // How wide the "wave" is
      const waveWidth = width / 2;
      
      if (distance < waveWidth) {
        // Calculate the wave height based on a cosine function for a smooth peak
        const translation = maxAmplitude * Math.cos((distance / waveWidth) * (Math.PI / 2));
        return translation;
      }
      
      return 0; // No translation if cursor is far
    });

    setItemTranslations(newTranslations);
  };

  const handleMouseLeave = () => {
    setItemTranslations(Array(howItWorks.length).fill(0));
  };
  
  useEffect(() => {
    const isMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMotionReduced) {
        // If user prefers reduced motion, do not apply mouse move listener
        return;
    }
  }, []);

  return (
    <section id="how-it-works" className="py-20 overflow-hidden">
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="container mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300"
        >
        <h2 className="text-center text-4xl font-bold font-headline mb-12">
          How It Works
        </h2>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" aria-hidden="true" style={{top: '24px'}}></div>
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, index) => (
              <div
                key={item.step}
                className="text-center transition-transform duration-300 ease-out"
                style={{
                  transform: `translateY(${itemTranslations[index]}px)`,
                }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-headline font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
