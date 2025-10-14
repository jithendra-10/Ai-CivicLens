'use client';

import Lottie from 'lottie-react';
import { aiDataAnimationData } from '@/lib/animations/data';

const AiDataAnimation = ({className}: {className?: string}) => {
  return (
    <div className={className}>
      <Lottie animationData={aiDataAnimationData} loop={true} className="w-full h-full" />
    </div>
    );
};

export default AiDataAnimation;
