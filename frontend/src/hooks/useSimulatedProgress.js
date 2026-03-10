import { useEffect } from 'react';

export function useSimulatedProgress(isProcessing, setProgress) {
  useEffect(() => {
    let interval;
    if (isProcessing) {
      setProgress(15); 
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95;
          const increment = (95 - prev) * 0.1; 
          return prev + increment;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing, setProgress]);
}