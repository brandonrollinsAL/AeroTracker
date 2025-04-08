import { useEffect } from 'react';
import { useDevice } from '@/hooks/use-device';

/**
 * Applies iOS-specific optimizations to ensure proper viewport behavior and touch responsiveness
 * for AeroLink apps on iOS Mobile and iPad devices.
 */
export function useIOSOptimizations() {
  const { isIOS, isMobile, isTablet } = useDevice();

  useEffect(() => {
    if (!isIOS) return;

    // Fix for iOS Safari viewport height issues when software keyboard is shown
    const fixIOSViewportHeight = () => {
      // Set viewport height as a CSS variable
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Apply iOS-specific meta tags for proper responsive behavior
    const applyIOSMetaTags = () => {
      // This helps with proper scaling and prevents unwanted zooming
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }

      // Add standalone mode meta tag for home screen apps
      const metaAppleMobileWeb = document.createElement('meta');
      metaAppleMobileWeb.setAttribute('name', 'apple-mobile-web-app-capable');
      metaAppleMobileWeb.setAttribute('content', 'yes');
      document.head.appendChild(metaAppleMobileWeb);

      // Set status bar style
      const metaStatusBar = document.createElement('meta');
      metaStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      metaStatusBar.setAttribute('content', 'black-translucent');
      document.head.appendChild(metaStatusBar);
    };

    // Optimize touch interactions for iOS devices
    const optimizeTouchInteractions = () => {
      // Disable double-tap to zoom
      const style = document.createElement('style');
      style.innerHTML = `
        * { touch-action: manipulation; }
        input, button, a, select, textarea { -webkit-tap-highlight-color: rgba(0,0,0,0); }
        /* Use safe area insets for modern iOS devices with notches */
        body {
          padding-top: env(safe-area-inset-top);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
        }
        /* Fix for 100vh issues on iOS */
        .full-height {
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
        }
      `;
      document.head.appendChild(style);
    };

    // Initialize all iOS optimizations
    applyIOSMetaTags();
    optimizeTouchInteractions();
    fixIOSViewportHeight();

    // Add event listeners for viewport height adjustments
    window.addEventListener('resize', fixIOSViewportHeight);
    window.addEventListener('orientationchange', fixIOSViewportHeight);

    // Apply iPad-specific optimizations
    if (isTablet) {
      // Enable split view compatibility for iPad
      document.body.classList.add('ios-tablet');
      
      // Add CSS for optimizing touch targets on iPad
      const iPadStyles = document.createElement('style');
      iPadStyles.innerHTML = `
        /* Optimize button and control sizes for iPad */
        .ios-tablet button, .ios-tablet .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Add support for iPad multitasking modes */
        @media (min-width: 768px) {
          .ios-tablet .support-split-view {
            max-width: 100%;
            min-width: 320px;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(iPadStyles);
    } 
    // Apply iPhone-specific optimizations
    else if (isMobile) {
      document.body.classList.add('ios-mobile');
      
      // Add CSS for optimizing layout on iPhone
      const iPhoneStyles = document.createElement('style');
      iPhoneStyles.innerHTML = `
        /* Ensure touch targets meet Apple's guidelines */
        .ios-mobile button, .ios-mobile .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Adjust font sizes for better readability on smaller screens */
        .ios-mobile {
          font-size: 16px;
        }
        
        /* Fix for bottom navigation to avoid conflicts with home indicator */
        .ios-mobile .bottom-nav {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `;
      document.head.appendChild(iPhoneStyles);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('resize', fixIOSViewportHeight);
      window.removeEventListener('orientationchange', fixIOSViewportHeight);
    };
  }, [isIOS, isMobile, isTablet]);
}

/**
 * Enables smooth scrolling and momentum-based scrolling effects for iOS devices
 */
export function useIOSScrollOptimizations(elementRef: React.RefObject<HTMLElement>) {
  const { isIOS } = useDevice();

  useEffect(() => {
    if (!isIOS || !elementRef.current) return;

    // Apply iOS-specific scrolling optimizations
    const element = elementRef.current;
    
    // Enable momentum scrolling (with type assertion for WebKit-specific property)
    (element.style as any).webkitOverflowScrolling = 'touch';
    
    // Prevent scroll chaining (overscroll that triggers browser navigation)
    element.style.overscrollBehavior = 'contain';
    
    // Optimize scroll performance
    element.style.willChange = 'scroll-position';
    
    // For absolute positioned elements, ensure proper scrolling
    if (window.getComputedStyle(element).position === 'absolute') {
      element.style.overflow = 'auto';
    }
    
  }, [isIOS, elementRef]);
}

/**
 * Detects if the web app is running in standalone mode (added to home screen)
 */
export function useIsStandaloneApp() {
  return typeof window !== 'undefined' && 
    ((window.navigator as any).standalone || 
     window.matchMedia('(display-mode: standalone)').matches);
}

/**
 * Applies appropriate scale to elements based on device pixel ratio
 * to ensure crisp rendering on iOS Retina displays
 */
export function getIOSOptimizedScale() {
  const { isIOS } = useDevice();
  
  if (!isIOS || typeof window === 'undefined') {
    return 1;
  }
  
  const pixelRatio = window.devicePixelRatio || 1;
  
  // For most elements we want 1:1 pixel mapping on iOS
  return 1 / pixelRatio;
}