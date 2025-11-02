import { useRef, useState, useEffect, useCallback } from 'react';

interface UseHorizontalScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
  scrollPosition: number;
}

export function useHorizontalScroll(): UseHorizontalScrollReturn {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    console.log('📊 Scroll State:', { 
      scrollLeft, 
      scrollWidth, 
      clientWidth, 
      canScroll: scrollWidth > clientWidth 
    });
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    setScrollPosition(scrollLeft);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Update scroll state on mount and scroll
    updateScrollState();
    scrollContainer.addEventListener('scroll', updateScrollState);

    // Horizontal scroll with mouse wheel (shift + wheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('scroll', updateScrollState);
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, [updateScrollState]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  }, [isDragging, startX, scrollLeftPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Smooth scroll functions
  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  // Attach mouse handlers to ref
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleMove = (e: MouseEvent) => handleMouseMove(e as any);
    const handleUp = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    scrollRef,
    isDragging,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    scrollPosition,
  };
}
