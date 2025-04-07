import { Link } from "wouter";
import { PlaneTakeoffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fcff] p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center relative overflow-hidden bg-[#4995fd] mr-3">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4995fd] to-[#003a65] opacity-90"></div>
              <PlaneTakeoffIcon className="h-6 w-6 text-white transform rotate-45 relative z-10" />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#003a65] to-[#4995fd] bg-clip-text text-transparent">
                AeroTracker
              </span>
            </h1>
          </div>
        </div>
        
        <div className="p-8 rounded-lg border border-[#4995fd]/10 bg-white shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-[#003a65]">404</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#003a65] to-[#4995fd] mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold mb-4 text-[#003a65]">Flight Path Not Found</h3>
          <p className="text-[#003a65]/70 mb-6">
            The destination you're looking for has either been moved or doesn't exist.
            Let's redirect your flight back to safety.
          </p>
          
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#003a65]/90 hover:to-[#4995fd]/90 text-white">
              Return to Flight Deck
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}