import React, { ReactNode } from 'react';
import { useDevice, DeviceType, OSType } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  iosClassName?: string;
  androidClassName?: string;
  style?: React.CSSProperties;
  mobileStyle?: React.CSSProperties;
  tabletStyle?: React.CSSProperties;
  desktopStyle?: React.CSSProperties;
  iosStyle?: React.CSSProperties;
  androidStyle?: React.CSSProperties;
  onlyOn?: DeviceType[];
  hideOn?: DeviceType[];
  onlyOnOS?: OSType[];
  hideOnOS?: OSType[];
}

/**
 * A responsive container component that conditionally applies styles and
 * visibility based on device type and operating system.
 * 
 * This component helps implement iOS Mobile and iPad optimizations
 * for AeroLink's cross-platform compatibility.
 */
export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  iosClassName = '',
  androidClassName = '',
  style = {},
  mobileStyle = {},
  tabletStyle = {},
  desktopStyle = {},
  iosStyle = {},
  androidStyle = {},
  onlyOn,
  hideOn,
  onlyOnOS,
  hideOnOS,
}: ResponsiveContainerProps) {
  const { type, os, isPortrait, isLandscape } = useDevice();

  // Handle visibility based on device type
  if (onlyOn && !onlyOn.includes(type)) {
    return null;
  }

  if (hideOn && hideOn.includes(type)) {
    return null;
  }

  // Handle visibility based on OS
  if (onlyOnOS && !onlyOnOS.includes(os)) {
    return null;
  }

  if (hideOnOS && hideOnOS.includes(os)) {
    return null;
  }

  // Generate device-specific className
  let deviceClassName = '';
  if (type === 'mobile') deviceClassName = mobileClassName;
  else if (type === 'tablet') deviceClassName = tabletClassName;
  else deviceClassName = desktopClassName;

  // Generate OS-specific className
  let osClassName = '';
  if (os === 'ios') osClassName = iosClassName;
  else if (os === 'android') osClassName = androidClassName;

  // Combine all applicable classes
  const combinedClassName = cn(
    className,
    deviceClassName,
    osClassName,
    isPortrait ? 'portrait' : 'landscape'
  );

  // Combine styles
  let combinedStyle = { ...style };
  
  // Add device-specific styles
  if (type === 'mobile') combinedStyle = { ...combinedStyle, ...mobileStyle };
  else if (type === 'tablet') combinedStyle = { ...combinedStyle, ...tabletStyle };
  else combinedStyle = { ...combinedStyle, ...desktopStyle };
  
  // Add OS-specific styles
  if (os === 'ios') combinedStyle = { ...combinedStyle, ...iosStyle };
  else if (os === 'android') combinedStyle = { ...combinedStyle, ...androidStyle };
  
  return (
    <div className={combinedClassName} style={combinedStyle}>
      {children}
    </div>
  );
}

/**
 * A component that only renders on mobile devices
 */
export function MobileOnly({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOn={['mobile']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A component that only renders on tablet devices
 */
export function TabletOnly({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOn={['tablet']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A component that only renders on desktop devices
 */
export function DesktopOnly({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOn={['desktop']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A component that renders on mobile and tablet devices
 */
export function MobileAndTablet({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOn={['mobile', 'tablet']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A component that only renders on iOS devices
 */
export function IOSOnly({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOnOS={['ios']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A component that only renders on iOS mobile devices
 */
export function IOSMobileOnly({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOn={['mobile']} onlyOnOS={['ios']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * A component that only renders on iOS tablet devices (iPads)
 */
export function IOSTabletOnly({ children, className = '', style = {} }: { children: ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <ResponsiveContainer onlyOn={['tablet']} onlyOnOS={['ios']} className={className} style={style}>
      {children}
    </ResponsiveContainer>
  );
}