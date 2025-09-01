import * as React from "react"

// Enhanced breakpoint system
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS
type BreakpointState = Record<Breakpoint, boolean>

export function useBreakpoints() {
  const [breakpoints, setBreakpoints] = React.useState<BreakpointState>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    "2xl": false,
  })

  React.useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth
      setBreakpoints({
        sm: width >= BREAKPOINTS.sm,
        md: width >= BREAKPOINTS.md,
        lg: width >= BREAKPOINTS.lg,
        xl: width >= BREAKPOINTS.xl,
        "2xl": width >= BREAKPOINTS["2xl"],
      })
    }

    // Set initial values
    updateBreakpoints()

    // Create media query listeners for each breakpoint
    const mediaQueries = Object.entries(BREAKPOINTS).map(([key, value]) => {
      const mq = window.matchMedia(`(min-width: ${value}px)`)
      mq.addEventListener('change', updateBreakpoints)
      return mq
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateBreakpoints)
      })
    }
  }, [])

  return breakpoints
}

export function useBreakpoint(breakpoint: Breakpoint) {
  const breakpoints = useBreakpoints()
  return breakpoints[breakpoint]
}

// Enhanced mobile hook with tablet support
export function useDeviceType() {
  const breakpoints = useBreakpoints()
  
  return React.useMemo(() => {
    if (!breakpoints.md) return 'mobile'
    if (!breakpoints.lg) return 'tablet'
    return 'desktop'
  }, [breakpoints])
}

// Specific device checks
export function useIsMobile() {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

export function useIsTablet() {
  const deviceType = useDeviceType()
  return deviceType === 'tablet'
}

export function useIsDesktop() {
  const deviceType = useDeviceType()
  return deviceType === 'desktop'
}