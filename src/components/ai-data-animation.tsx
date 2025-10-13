'use client';

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const useLottieAnimation = (path: string) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(path)
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error('Error loading Lottie animation:', error));
  }, [path]);

  return animationData;
};

const AiDataAnimation = ({className}: {className?: string}) => {
  const animationData = useLottieAnimation('/animations/Ai Data.lottie');
   if (!animationData) return null;
  return <Lottie animationData={animationData} loop={true} className={className} />;
};

export default AiDataAnimation;
