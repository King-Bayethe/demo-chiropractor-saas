import { useEffect, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  minDistance?: number;
  maxTime?: number;
  threshold?: number;
  enableHaptic?: boolean;
}

const DEFAULT_CONFIG: Required<SwipeConfig> = {
  minDistance: 50,
  maxTime: 300,
  threshold: 10,
  enableHaptic: true,
};

export function useSwipeGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const swipeConfig = { ...DEFAULT_CONFIG, ...config };
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwipeDetected = useRef(false);

  const triggerHaptic = useCallback(() => {
    if (swipeConfig.enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [swipeConfig.enableHaptic]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isSwipeDetected.current = false;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current || isSwipeDetected.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    // Check if movement exceeds threshold
    if (Math.abs(deltaX) > swipeConfig.threshold || Math.abs(deltaY) > swipeConfig.threshold) {
      // Prevent scrolling for horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
      }
    }
  }, [swipeConfig.threshold]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current || isSwipeDetected.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    // Check if it's a valid swipe
    if (deltaTime > swipeConfig.maxTime) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < swipeConfig.minDistance && absY < swipeConfig.minDistance) return;

    isSwipeDetected.current = true;

    // Determine swipe direction
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && handlers.onSwipeRight) {
        triggerHaptic();
        handlers.onSwipeRight();
      } else if (deltaX < 0 && handlers.onSwipeLeft) {
        triggerHaptic();
        handlers.onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && handlers.onSwipeDown) {
        triggerHaptic();
        handlers.onSwipeDown();
      } else if (deltaY < 0 && handlers.onSwipeUp) {
        triggerHaptic();
        handlers.onSwipeUp();
      }
    }

    touchStart.current = null;
  }, [handlers, swipeConfig, triggerHaptic]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use passive listeners where possible for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isSwipeActive: isSwipeDetected.current,
  };
}

export function usePullToRefresh(
  elementRef: React.RefObject<HTMLElement>,
  onRefresh: () => Promise<void> | void,
  config: { threshold?: number; enableHaptic?: boolean } = {}
) {
  const { threshold = 80, enableHaptic = true } = config;
  const pullDistance = useRef(0);
  const isRefreshing = useRef(false);
  const startY = useRef(0);

  const triggerHaptic = useCallback(() => {
    if (enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  }, [enableHaptic]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing.current) return;
    
    const element = elementRef.current;
    if (!element || element.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    pullDistance.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isRefreshing.current) return;

    const element = elementRef.current;
    if (!element || element.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      pullDistance.current = Math.min(diff, threshold * 1.5);
      
      // Add visual feedback
      element.style.transform = `translateY(${pullDistance.current * 0.5}px)`;
      element.style.transition = 'none';

      // Trigger haptic feedback at threshold
      if (pullDistance.current >= threshold && !isRefreshing.current) {
        triggerHaptic();
      }

      e.preventDefault();
    }
  }, [threshold, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    const element = elementRef.current;
    if (!element || isRefreshing.current) return;

    if (pullDistance.current >= threshold) {
      isRefreshing.current = true;
      element.style.transition = 'transform 0.3s ease';
      element.style.transform = `translateY(${threshold * 0.3}px)`;

      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          element.style.transform = 'translateY(0)';
          setTimeout(() => {
            element.style.transition = '';
            isRefreshing.current = false;
          }, 300);
        }, 500);
      }
    } else {
      element.style.transition = 'transform 0.2s ease';
      element.style.transform = 'translateY(0)';
      setTimeout(() => {
        element.style.transition = '';
      }, 200);
    }

    pullDistance.current = 0;
  }, [threshold, onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing: isRefreshing.current,
    pullDistance: pullDistance.current,
  };
}