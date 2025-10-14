'use client';

import Lottie from 'lottie-react';
import animationData from '@/../public/animations/hero-animation.json';

const AiDataAnimation = ({className}: {className?: string}) => {
  return <Lottie animationData={animationData} loop={true} className={className} />;
};

export default AiDataAnimation;
