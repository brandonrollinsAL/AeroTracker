import React from "react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold text-primary">
              AeroTracker
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time flight tracking and aviation analytics
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h4 className="font-medium text-sm text-foreground mb-2">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy-policy">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Privacy Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Terms of Service
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-foreground mb-2">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="mailto:support@aerotracker.com" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    support@aerotracker.com
                  </a>
                </li>
                <li className="text-muted-foreground">
                  123 Aviation Way, Flight City
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border text-sm text-center text-muted-foreground">
          <p>© {currentYear} AeroTracker. All rights reserved.</p>
          <p className="mt-1 text-xs">
            Flight data provided by various aviation data providers.
          </p>
        </div>
      </div>
    </footer>
  );
}