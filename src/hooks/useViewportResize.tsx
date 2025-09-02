import { useState, useEffect } from 'react';

interface ViewportDimensions {
  width: number;
  height: number;
  zoom: number;
  effectiveWidth: number;
  effectiveHeight: number;
  isZoomed: boolean;
}

/**
 * Hook to detect viewport changes and zoom levels
 * Provides zoom-aware responsive design utilities
 */
export function useViewportResize(): ViewportDimensions {
  const [viewport, setViewport] = useState<ViewportDimensions>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1200,
        height: 800,
        zoom: 1,
        effectiveWidth: 1200,
        effectiveHeight: 800,
        isZoomed: false,
      };
    }

    const zoom = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      zoom,
      effectiveWidth: width * zoom,
      effectiveHeight: height * zoom,
      isZoomed: zoom > 1 || width < 1200,
    };
  });

  useEffect(() => {
    const updateViewport = () => {
      const zoom = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        zoom,
        effectiveWidth: width * zoom,
        effectiveHeight: height * zoom,
        isZoomed: zoom > 1 || width < 1200,
      });
    };

    // Update on resize
    window.addEventListener('resize', updateViewport);
    
    // Update on zoom (using visualViewport if available)
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport);
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  return viewport;
}

/**
 * Hook to get layout size based on viewport and zoom
 */
export function useAdaptiveLayout() {
  const viewport = useViewportResize();
  
  return {
    ...viewport,
    // Layout variants based on effective space
    layoutSize: viewport.width < 640 ? 'xs' : viewport.width < 1024 ? 'sm' : viewport.width < 1440 ? 'md' : 'lg',
    
    // Adaptive dimensions
    cardHeight: Math.max(300, Math.min(500, viewport.height * 0.6)),
    cardWidth: Math.max(280, Math.min(400, viewport.width * 0.9)),
    
    // Responsive utilities
    shouldUseCompactLayout: viewport.width < 768 || viewport.isZoomed,
    shouldUseDrawer: viewport.width < 640,
    shouldReduceSpacing: viewport.width < 1024,
    
    // Grid configurations
    pipelineColumns: viewport.width < 640 ? 1 : viewport.width < 1024 ? 2 : viewport.width < 1440 ? 3 : 4,
    
    // Font scaling
    fontScale: viewport.width < 640 ? 0.875 : viewport.width < 1024 ? 0.9 : 1,
  };
}