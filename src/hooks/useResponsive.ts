import { useState, useEffect } from 'react';

export function useResponsive() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsDesktop(w >= 1024);
      setIsTablet(w >= 768 && w < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isDesktop, isTablet, isMobile: !isDesktop };
}
