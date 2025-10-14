'use client';

import Lottie from 'lottie-react';
import { aiAnimationData } from '@/lib/animations/ai';

const AiAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <Lottie animationData={aiAnimationData} loop={true} className="w-full h-full" />
    </div>
  );
};

export default AiAnimation;
