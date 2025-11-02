import { useRef, useState, useCallback, useEffect } from 'react';

export function useKanbanScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
  }, []);

  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateScrollState();

    const handleScroll = () => {
      setIsScrolling(true);
      updateScrollState();
      
      const timeout = setTimeout(() => setIsScrolling(false), 150);
      return () => clearTimeout(timeout);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    isScrolling,
  };
}
