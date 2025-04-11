import React from 'react';
import { Link } from 'wouter';
import SocialMediaShare from './SocialMediaShare';
import { Separator } from './ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">AeroTracker</h3>
            <p className="text-muted-foreground">
              Advanced flight tracking platform with real-time data, analytics, and route optimization tools.
            </p>
            <div className="pt-2">
              <SocialMediaShare showText={false} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="hover:text-primary transition-colors duration-200">
                Home
              </Link>
              <Link href="/about" className="hover:text-primary transition-colors duration-200">
                About
              </Link>
              <Link href="/features" className="hover:text-primary transition-colors duration-200">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-primary transition-colors duration-200">
                Pricing
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/blog" className="hover:text-primary transition-colors duration-200">
                Blog
              </Link>
              <Link href="/documentation" className="hover:text-primary transition-colors duration-200">
                Documentation
              </Link>
              <Link href="/faq" className="hover:text-primary transition-colors duration-200">
                FAQ
              </Link>
              <Link href="/tutorials" className="hover:text-primary transition-colors duration-200">
                Tutorials
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/terms" className="hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors duration-200">
                Cookie Policy
              </Link>
              <Link href="/gdpr" className="hover:text-primary transition-colors duration-200">
                GDPR Compliance
              </Link>
            </nav>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} AeroTracker. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted-foreground flex items-center">
              <Link href="/" className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-1"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span>Site Map</span>
              </Link>
            </span>
            <span className="text-xs text-muted-foreground">
              <a href="mailto:support@aerotracker.com" className="hover:text-primary transition-colors duration-200">
                Contact Support
              </a>
            </span>
          </div>
        </div>
        
        {/* Structured data for organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AeroTracker",
            "url": "https://aerotracker.replit.app/",
            "logo": "https://aerotracker.replit.app/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-555-123-4567",
              "contactType": "customer service",
              "email": "support@aerotracker.com"
            },
            "sameAs": [
              "https://twitter.com/aerotracker",
              "https://facebook.com/aerotracker",
              "https://linkedin.com/company/aerotracker",
              "https://instagram.com/aerotracker"
            ]
          })}
        </script>
      </div>
    </footer>
  );
}

export default Footer;