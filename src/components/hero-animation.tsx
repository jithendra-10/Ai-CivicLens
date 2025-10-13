'use client';

import Lottie from 'lottie-react';
import animationData from '@/../public/animations/hero-animation.json';

const HeroAnimation = () => {
  return <Lottie animationData={animationData} loop={true} className="w-full max-w-md mx-auto" />;
};

export default HeroAnimation;
