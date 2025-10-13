'use client';

import Lottie from 'lottie-react';

const AiAnimation = ({className}: {className?: string}) => {
  return <Lottie path="/animations/Ai.lottie" loop={true} className={className} />;
};

export default AiAnimation;
