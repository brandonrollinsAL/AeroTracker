import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type OSType = 'ios' | 'android' | 'windows' | 'macos' | 'other';

// Breakpoints for device type detection
const BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024
};

interface DeviceInfo {
  type: DeviceType;
  os: OSType;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
}

/**
 * A hook that detects and provides information about the current device.
 * 
 * This enables us to apply platform-specific optimizations for AeroLink's
 * cross-platform compatibility, especially for iOS Mobile and iPad devices.
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Default to desktop values for SSR
    const ssrDeviceInfo: DeviceInfo = {
      type: 'desktop',
      os: 'other',
      isIOS: false,
      isAndroid: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isPortrait: true,
      isLandscape: false,
      width: typeof window !== 'undefined' ? window.innerWidth : 1024,
      height: typeof window !== 'undefined' ? window.innerHeight : 768
    };
    
    // Return SSR values if not in browser
    if (typeof window === 'undefined') {
      return ssrDeviceInfo;
    }
    
    // Detect device type based on screen width
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let type: DeviceType = 'desktop';
    if (width <= BREAKPOINTS.MOBILE_MAX) {
      type = 'mobile';
    } else if (width <= BREAKPOINTS.TABLET_MAX) {
      type = 'tablet';
    }
    
    // Detect OS
    const userAgent = navigator.userAgent.toLowerCase();
    let os: OSType = 'other';
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      os = 'ios';
    } else if (/android/.test(userAgent)) {
      os = 'android';
    } else if (/windows/.test(userAgent)) {
      os = 'windows';
    } else if (/mac/.test(userAgent)) {
      os = 'macos';
    }
    
    return {
      type,
      os,
      isIOS: os === 'ios',
      isAndroid: os === 'android',
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
      isPortrait: height > width,
      isLandscape: width > height,
      width,
      height
    };
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let type: DeviceType = 'desktop';
      if (width <= BREAKPOINTS.MOBILE_MAX) {
        type = 'mobile';
      } else if (width <= BREAKPOINTS.TABLET_MAX) {
        type = 'tablet';
      }
      
      setDeviceInfo(prev => ({
        ...prev,
        type,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        isPortrait: height > width,
        isLandscape: width > height,
        width,
        height
      }));
    };
    
    window.addEventListener('resize', handleResize);
    // Also listen for orientation changes specifically for mobile devices
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return deviceInfo;
}

/**
 * Helper function to get device-specific styles.
 * This is useful for components that need conditional styling based on the device.
 */
export function getDeviceSpecificStyles({
  mobile = {},
  tablet = {},
  desktop = {},
  ios = {},
  android = {},
}: {
  mobile?: React.CSSProperties;
  tablet?: React.CSSProperties;
  desktop?: React.CSSProperties;
  ios?: React.CSSProperties;
  android?: React.CSSProperties;
}): React.CSSProperties {
  const { type, os } = useDevice();
  
  let styles: React.CSSProperties = {};
  
  // Apply device type specific styles
  if (type === 'mobile') {
    styles = { ...styles, ...mobile };
  } else if (type === 'tablet') {
    styles = { ...styles, ...tablet };
  } else {
    styles = { ...styles, ...desktop };
  }
  
  // Apply OS specific styles
  if (os === 'ios') {
    styles = { ...styles, ...ios };
  } else if (os === 'android') {
    styles = { ...styles, ...android };
  }
  
  return styles;
}