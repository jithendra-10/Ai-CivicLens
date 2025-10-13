'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/animations/Ai Data.lottie';

const AiDataAnimation = ({className}: {className?: string}) => {
  return <Lottie animationData={animationData} loop={true} className={className} />;
};

export default AiDataAnimation;
