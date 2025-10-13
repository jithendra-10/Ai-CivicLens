'use client';

import Lottie from 'lottie-react';
import animationData from '@/lib/animations/Ai Data.json';

const AiDataAnimation = ({className}: {className?: string}) => {
  return <Lottie animationData={animationData} loop={true} className={className} />;
};

export default AiDataAnimation;
