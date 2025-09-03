import { useState, useEffect, useMemo, useRef } from 'react';
import { useUnifiedResponsive } from './useUnifiedResponsive';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  frameRate: number;
  scrollPerformance: number;
}

interface AccessibilityState {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface AdvancedResponsiveConfig {
  // Performance optimizations
  useVirtualScrolling: boolean;
  lazyLoadImages: boolean;
  deferNonCritical: boolean;
  optimizeAnimations: boolean;
  
  // Advanced layout features
  useContainerQueries: boolean;
  adaptiveGrid: boolean;
  dynamicSpacing: boolean;
  
  // Cross-device features
  syncPreferences: boolean;
  offlineSupport: boolean;
  progressiveBehavior: boolean;
}

export function useAdvancedResponsive() {
  const baseResponsive = useUnifiedResponsive();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    frameRate: 60,
    scrollPerformance: 100
  });
  
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    fontSize: 'medium'
  });

  const frameRateRef = useRef<number[]>([]);
  const renderStartTime = useRef<number>(0);

  // Monitor performance metrics
  useEffect(() => {
    const measurePerformance = () => {
      const now = performance.now();
      if (renderStartTime.current > 0) {
        const renderTime = now - renderStartTime.current;
        setPerformanceMetrics(prev => ({ ...prev, renderTime }));
      }
      renderStartTime.current = now;
    };

    // Measure frame rate
    const measureFrameRate = () => {
      const now = performance.now();
      frameRateRef.current.push(now);
      
      // Keep only last 60 frames
      if (frameRateRef.current.length > 60) {
        frameRateRef.current = frameRateRef.current.slice(-60);
      }
      
      if (frameRateRef.current.length >= 2) {
        const timeSpan = frameRateRef.current[frameRateRef.current.length - 1] - frameRateRef.current[0];
        const fps = Math.round((frameRateRef.current.length - 1) * 1000 / timeSpan);
        setPerformanceMetrics(prev => ({ ...prev, frameRate: fps }));
      }
      
      requestAnimationFrame(measureFrameRate);
    };

    measurePerformance();
    requestAnimationFrame(measureFrameRate);

    // Memory usage (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setPerformanceMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit 
      }));
    }
  }, []);

  // Detect accessibility preferences
  useEffect(() => {
    const updateAccessibility = () => {
      setAccessibility({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        fontSize: localStorage.getItem('fontSize') as AccessibilityState['fontSize'] || 'medium'
      });
    };

    updateAccessibility();

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)')
    ];

    mediaQueries.forEach(mq => mq.addEventListener('change', updateAccessibility));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateAccessibility));
    };
  }, []);

  // Advanced configuration based on performance and accessibility
  const advancedConfig = useMemo<AdvancedResponsiveConfig>(() => {
    const lowPerformance = performanceMetrics.frameRate < 30 || 
                          (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage > 0.8);

    return {
      // Performance optimizations
      useVirtualScrolling: lowPerformance || baseResponsive.device.isMobile,
      lazyLoadImages: true,
      deferNonCritical: lowPerformance,
      optimizeAnimations: accessibility.prefersReducedMotion || lowPerformance,
      
      // Advanced layout features
      useContainerQueries: 'container' in document.documentElement.style,
      adaptiveGrid: !lowPerformance,
      dynamicSpacing: baseResponsive.device.isDesktop && !lowPerformance,
      
      // Cross-device features
      syncPreferences: 'serviceWorker' in navigator,
      offlineSupport: 'serviceWorker' in navigator,
      progressiveBehavior: true,
    };
  }, [performanceMetrics, accessibility, baseResponsive]);

  // Dynamic font scaling
  const fontScale = useMemo(() => {
    const baseScale = accessibility.fontSize === 'large' ? 1.2 : 
                     accessibility.fontSize === 'small' ? 0.9 : 1;
    
    // Adjust for device density
    const devicePixelRatio = window.devicePixelRatio || 1;
    const densityAdjustment = devicePixelRatio > 2 ? 0.95 : 1;
    
    return baseScale * densityAdjustment * baseResponsive.config.typography.fontScale;
  }, [accessibility.fontSize, baseResponsive.config.typography.fontScale]);

  // Container query utilities
  const containerQueries = useMemo(() => ({
    getContainerClasses: (breakpoints: { sm?: string; md?: string; lg?: string }) => {
      if (!advancedConfig.useContainerQueries) {
        return baseResponsive.utils.getClasses({
          mobile: breakpoints.sm,
          tablet: breakpoints.md,
          desktop: breakpoints.lg
        });
      }
      
      return [
        breakpoints.sm && `@container (min-width: 320px) { ${breakpoints.sm} }`,
        breakpoints.md && `@container (min-width: 640px) { ${breakpoints.md} }`,
        breakpoints.lg && `@container (min-width: 1024px) { ${breakpoints.lg} }`
      ].filter(Boolean).join(' ');
    },
    
    shouldUseContainer: (element: HTMLElement) => {
      return advancedConfig.useContainerQueries && 
             element.style.containerType !== 'normal';
    }
  }), [advancedConfig.useContainerQueries, baseResponsive.utils]);

  // Adaptive grid system
  const adaptiveGrid = useMemo(() => ({
    getOptimalColumns: (itemWidth: number, containerWidth?: number) => {
      const width = containerWidth || baseResponsive.viewport.width;
      const availableWidth = width - 64; // Account for padding
      const minColumns = 1;
      const maxColumns = baseResponsive.device.isDesktop ? 6 : 
                        baseResponsive.device.isTablet ? 4 : 2;
      
      const calculatedColumns = Math.floor(availableWidth / itemWidth);
      return Math.max(minColumns, Math.min(maxColumns, calculatedColumns));
    },
    
    getDynamicSpacing: (itemCount: number) => {
      if (!advancedConfig.dynamicSpacing) return baseResponsive.config.spacing.gap;
      
      const density = itemCount / baseResponsive.config.columns.pipeline;
      return density > 1.5 ? 'gap-2' : density > 1 ? 'gap-3' : 'gap-4';
    }
  }), [baseResponsive, advancedConfig.dynamicSpacing]);

  // Performance monitoring utilities
  const performanceUtils = useMemo(() => ({
    shouldOptimize: (component: string) => {
      const thresholds = {
        animations: 30,
        virtualScrolling: 20,
        lazyLoading: 25
      };
      
      return performanceMetrics.frameRate < (thresholds as any)[component];
    },
    
    getOptimizationLevel: (): 'low' | 'medium' | 'high' => {
      if (performanceMetrics.frameRate >= 45) return 'low';
      if (performanceMetrics.frameRate >= 25) return 'medium';
      return 'high';
    },
    
    trackInteraction: (action: string) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            console.debug(`${action} performance:`, {
              duration: entry.duration,
              startTime: entry.startTime
            });
          });
        });
        
        observer.observe({ entryTypes: ['measure'] });
        performance.mark(`${action}-start`);
        
        return () => {
          performance.mark(`${action}-end`);
          performance.measure(action, `${action}-start`, `${action}-end`);
          observer.disconnect();
        };
      }
      
      return () => {};
    }
  }), [performanceMetrics]);

  return {
    ...baseResponsive,
    advanced: advancedConfig,
    accessibility,
    performance: performanceMetrics,
    fontScale,
    containerQueries,
    adaptiveGrid,
    performanceUtils,
    
    // Accessibility utilities
    a11y: {
      getAriaLabel: (base: string, context?: string) => {
        return context ? `${base} - ${context}` : base;
      },
      
      shouldReduceMotion: () => accessibility.prefersReducedMotion,
      
      getHighContrastClasses: () => accessibility.prefersHighContrast ? 
        'contrast-more border-2' : '',
      
      getFocusClasses: () => 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      
      getTouchTargetClasses: () => baseResponsive.device.isTouchDevice ? 
        'min-h-[44px] min-w-[44px]' : 'min-h-[32px] min-w-[32px]'
    },
    
    // Save user preferences
    savePreference: (key: string, value: any) => {
      try {
        localStorage.setItem(`preference-${key}`, JSON.stringify(value));
        if (advancedConfig.syncPreferences && 'serviceWorker' in navigator) {
          // Sync to service worker for cross-tab persistence
          navigator.serviceWorker.ready.then(registration => {
            registration.active?.postMessage({
              type: 'SAVE_PREFERENCE',
              key,
              value
            });
          });
        }
      } catch (error) {
        console.warn('Failed to save preference:', error);
      }
    },
    
    // Load user preferences
    loadPreference: (key: string, defaultValue?: any) => {
      try {
        const stored = localStorage.getItem(`preference-${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
      } catch (error) {
        console.warn('Failed to load preference:', error);
        return defaultValue;
      }
    }
  };
}
