import { useState, useEffect, useMemo } from 'react';

interface ViewportDimensions {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}

interface ResponsiveConfig {
  // Layout configurations
  columns: {
    pipeline: number;
    stats: number;
    opportunities: number;
  };
  
  // Spacing and sizing
  spacing: {
    container: string;
    gap: string;
    cardPadding: string;
  };
  
  // Typography
  typography: {
    headingSize: string;
    textSize: string;
    fontScale: number;
  };
  
  // Component behaviors
  behavior: {
    useDrawerNavigation: boolean;
    useCompactCards: boolean;
    useTabsView: boolean;
    enableSwipeGestures: boolean;
    showFullStats: boolean;
    enableVirtualization: boolean;
  };
  
  // Touch and interaction
  touch: {
    minTouchTarget: number;
    enablePanZoom: boolean;
    snapToGrid: boolean;
  };
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
} as const;

/**
 * Unified responsive hook that provides comprehensive device and layout information
 */
export function useUnifiedResponsive() {
  const [viewport, setViewport] = useState<ViewportDimensions>(() => {
    if (typeof window === 'undefined') {
      return { width: 1200, height: 800, orientation: 'landscape' };
    }
    
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    // Use debounced resize handler to improve performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', updateViewport);

    // Visual viewport support for mobile browsers
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedResize);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', updateViewport);
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedResize);
      }
    };
  }, []);

  // Device information
  const deviceInfo = useMemo<DeviceInfo>(() => {
    const { width } = viewport;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    let type: DeviceInfo['type'];
    if (width < BREAKPOINTS.mobile) {
      type = 'mobile';
    } else if (width < BREAKPOINTS.tablet) {
      type = 'tablet';
    } else {
      type = 'desktop';
    }

    return {
      type,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
      isTouchDevice,
      isLandscape: viewport.orientation === 'landscape',
      isPortrait: viewport.orientation === 'portrait',
    };
  }, [viewport]);

  // Responsive configuration
  const config = useMemo<ResponsiveConfig>(() => {
    const { type } = deviceInfo;
    const { width, height } = viewport;

    switch (type) {
      case 'mobile':
        return {
          columns: {
            pipeline: 1,
            stats: 2,
            opportunities: 1,
          },
          spacing: {
            container: 'p-2',
            gap: 'gap-2',
            cardPadding: 'p-2',
          },
          typography: {
            headingSize: 'text-lg',
            textSize: 'text-sm',
            fontScale: 0.875,
          },
          behavior: {
            useDrawerNavigation: true,
            useCompactCards: true,
            useTabsView: true,
            enableSwipeGestures: true,
            showFullStats: false,
            enableVirtualization: true,
          },
          touch: {
            minTouchTarget: 44,
            enablePanZoom: false,
            snapToGrid: true,
          },
        };

      case 'tablet':
        return {
          columns: {
            pipeline: deviceInfo.isLandscape ? 4 : 2,
            stats: 4,
            opportunities: deviceInfo.isLandscape ? 3 : 2,
          },
          spacing: {
            container: 'p-3',
            gap: 'gap-3',
            cardPadding: 'p-3',
          },
          typography: {
            headingSize: 'text-xl',
            textSize: 'text-base',
            fontScale: 0.9,
          },
          behavior: {
            useDrawerNavigation: false,
            useCompactCards: false,
            useTabsView: false,
            enableSwipeGestures: true,
            showFullStats: true,
            enableVirtualization: false,
          },
          touch: {
            minTouchTarget: 44,
            enablePanZoom: true,
            snapToGrid: false,
          },
        };

      case 'desktop':
      default:
        const desktopColumns = width < BREAKPOINTS.desktop ? 4 : 6;
        return {
          columns: {
            pipeline: desktopColumns,
            stats: 4,
            opportunities: 4,
          },
          spacing: {
            container: 'p-4',
            gap: 'gap-4',
            cardPadding: 'p-4',
          },
          typography: {
            headingSize: 'text-2xl',
            textSize: 'text-base',
            fontScale: 1,
          },
          behavior: {
            useDrawerNavigation: false,
            useCompactCards: false,
            useTabsView: false,
            enableSwipeGestures: false,
            showFullStats: true,
            enableVirtualization: false,
          },
          touch: {
            minTouchTarget: 32,
            enablePanZoom: false,
            snapToGrid: false,
          },
        };
    }
  }, [deviceInfo, viewport]);

  // Utility functions
  const utilities = useMemo(() => ({
    // Get responsive value based on device type
    getValue: function<T>(values: { mobile?: T; tablet?: T; desktop?: T }): T | undefined {
      return values[deviceInfo.type] ?? values.mobile ?? values.desktop;
    },
    
    // Get responsive classes
    getClasses: function(classes: { mobile?: string; tablet?: string; desktop?: string }): string {
      return classes[deviceInfo.type] ?? classes.mobile ?? '';
    },
    
    // Check if should use specific layout
    shouldUse: {
      compactLayout: deviceInfo.isMobile || viewport.width < 768,
      tabletLayout: deviceInfo.isTablet,
      desktopLayout: deviceInfo.isDesktop,
      touchOptimizations: deviceInfo.isTouchDevice,
      virtualizedLists: config.behavior.enableVirtualization,
    },
    
    // Dynamic sizing
    sizing: {
      cardHeight: Math.max(280, Math.min(400, viewport.height * 0.5)),
      cardWidth: Math.max(240, Math.min(320, viewport.width * 0.85)),
      pipelineHeight: Math.max(400, Math.min(600, viewport.height * 0.7)),
    },
  }), [deviceInfo, viewport, config]);

  return {
    viewport,
    device: deviceInfo,
    config,
    utils: utilities,
    
    // Backward compatibility
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    shouldUseCompactLayout: utilities.shouldUse.compactLayout,
  };
}

/**
 * Specialized hook for pipeline-specific responsive behavior
 */
export function usePipelineResponsive() {
  const responsive = useUnifiedResponsive();
  
  const pipelineConfig = useMemo(() => ({
    // Column sizing for different views
    kanban: {
      columnWidth: responsive.utils.getValue({
        mobile: 280,
        tablet: 300,
        desktop: 320,
      }),
      columnsVisible: responsive.config.columns.pipeline,
      useFixedHeight: responsive.device.isMobile,
    },
    
    // Stats display
    stats: {
      columns: responsive.config.columns.stats,
      showValues: responsive.config.behavior.showFullStats,
      useCompactView: responsive.device.isMobile,
    },
    
    // Touch interactions
    touch: {
      enableSwipe: responsive.config.behavior.enableSwipeGestures,
      enablePinchZoom: responsive.config.touch.enablePanZoom,
      snapBehavior: responsive.config.touch.snapToGrid,
    },
    
    // Performance optimizations
    performance: {
      useVirtualization: responsive.config.behavior.enableVirtualization,
      lazyLoadThreshold: responsive.device.isMobile ? 2 : 5,
      maxVisibleCards: responsive.device.isMobile ? 10 : 50,
    },
  }), [responsive]);
  
  return {
    ...responsive,
    pipeline: pipelineConfig,
  };
}