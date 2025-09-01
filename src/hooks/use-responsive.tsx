import * as React from "react"
import { useBreakpoints, useDeviceType } from './use-breakpoints'

/**
 * Hook for responsive values based on current breakpoint
 * Usage: const padding = useResponsiveValue({ mobile: 2, tablet: 4, desktop: 6 })
 */
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
}) {
  const deviceType = useDeviceType()
  
  return React.useMemo(() => {
    switch (deviceType) {
      case 'mobile':
        return values.mobile ?? values.tablet ?? values.desktop
      case 'tablet':
        return values.tablet ?? values.desktop ?? values.mobile
      case 'desktop':
        return values.desktop ?? values.tablet ?? values.mobile
      default:
        return values.mobile
    }
  }, [deviceType, values])
}

/**
 * Hook for responsive CSS classes
 * Usage: const classes = useResponsiveClasses({ mobile: 'px-2', tablet: 'px-4', desktop: 'px-6' })
 */
export function useResponsiveClasses(classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) {
  const deviceType = useDeviceType()
  
  return React.useMemo(() => {
    const deviceClass = classes[deviceType]
    return deviceClass || classes.mobile || ''
  }, [deviceType, classes])
}

/**
 * Hook for responsive component configuration
 */
export function useResponsiveConfig() {
  const deviceType = useDeviceType()
  const breakpoints = useBreakpoints()
  
  return React.useMemo(() => ({
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet', 
    isDesktop: deviceType === 'desktop',
    isTouch: deviceType === 'mobile' || deviceType === 'tablet',
    // Grid configurations
    gridCols: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    },
    // Common padding values
    padding: {
      mobile: 'p-3',
      tablet: 'p-4', 
      desktop: 'p-6'
    },
    // Common spacing values
    spacing: {
      mobile: 'space-y-3',
      tablet: 'space-y-4',
      desktop: 'space-y-6'
    },
    // Button sizes
    buttonSize: deviceType === 'mobile' ? 'sm' : 'default',
    // Text sizes
    textSize: {
      mobile: 'text-sm',
      tablet: 'text-base',
      desktop: 'text-base'
    },
    // Dialog/modal preferences
    useDrawer: deviceType === 'mobile',
    // Table behavior
    enableHorizontalScroll: deviceType === 'mobile' || deviceType === 'tablet',
    // Animation preferences
    reduceMotion: false, // Could be enhanced with user preference
    breakpoints
  }), [deviceType, breakpoints])
}

/**
 * Hook for responsive dimensions
 */
export function useResponsiveDimensions() {
  const [dimensions, setDimensions] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dimensions
}