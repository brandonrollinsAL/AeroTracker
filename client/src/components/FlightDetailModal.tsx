import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveFlight } from "@/types";
import FlightDetailHeader from "./FlightDetailHeader";
import FlightStatus from "./FlightStatus";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface FlightDetailModalProps {
  flight: LiveFlight;
  isOpen: boolean;
  onClose: () => void;
}

export default function FlightDetailModal({ flight, isOpen, onClose }: FlightDetailModalProps) {
  const [activeTab, setActiveTab] = useState("liveStatus");
  
  // Fetch detailed flight information
  const { data: flightDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/api/flights/${flight.id}`],
    enabled: isOpen,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Fetch weather at destination if available
  const { data: weatherData, isLoading: isLoadingWeather } = useQuery({
    queryKey: ['/api/weather', flight.arrival?.icao],
    enabled: isOpen && !!flight.arrival?.icao,
  });
  
  // Combine the flight data with the fetched details
  const flightData = flightDetails || flight;
  
  const handleSetAlert = () => {
    // This would open an alert dialog in a real app
    console.log("Setting alert for", flight.callsign);
  };
  
  const handleShare = () => {
    // Share flight tracking link
    if (navigator.share) {
      navigator.share({
        title: `Track ${flight.callsign || flight.flightNumber}`,
        text: `Track ${flight.callsign || flight.flightNumber} from ${flight.departure?.icao} to ${flight.arrival?.icao}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white border-b border-neutral-200 flex justify-between items-center">
          <DialogTitle className="text-lg">
            Flight Details: <span className="text-primary">{flight.callsign || flight.flightNumber}</span>
          </DialogTitle>
          <DialogClose className="rounded-full hover:bg-neutral-100 p-1" />
        </DialogHeader>
        
        <div className="p-4">
          <FlightDetailHeader flight={flightData} />
          
          <div className="mb-6 border-b border-neutral-200">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-b-0">
                <TabsTrigger 
                  value="liveStatus"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
                >
                  Live Status
                </TabsTrigger>
                <TabsTrigger 
                  value="aircraftDetails"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
                >
                  Aircraft Details
                </TabsTrigger>
                <TabsTrigger 
                  value="routeHistory"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
                >
                  Route History
                </TabsTrigger>
                <TabsTrigger 
                  value="weather"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
                >
                  Weather
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="liveStatus">
                <FlightStatus 
                  flight={flightData} 
                  weather={weatherData} 
                  isLoading={isLoadingDetails}
                />
              </TabsContent>
              
              <TabsContent value="aircraftDetails">
                <div className="text-center py-10 text-neutral-500">
                  Aircraft details would be displayed here
                </div>
              </TabsContent>
              
              <TabsContent value="routeHistory">
                <div className="text-center py-10 text-neutral-500">
                  Route history would be displayed here
                </div>
              </TabsContent>
              
              <TabsContent value="weather">
                <div className="text-center py-10 text-neutral-500">
                  {isLoadingWeather ? (
                    "Loading weather data..."
                  ) : weatherData ? (
                    "Detailed weather information would be displayed here"
                  ) : (
                    "Weather data not available"
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" className="mr-2" onClick={handleSetAlert}>
              <span className="material-icons text-sm mr-1 align-text-bottom">notification_add</span>
              Set Alert
            </Button>
            <Button variant="outline" className="mr-2" onClick={handleShare}>
              <span className="material-icons text-sm mr-1 align-text-bottom">ios_share</span>
              Share
            </Button>
            <Button>
              <span className="material-icons text-sm mr-1 align-text-bottom">history</span>
              View Full History
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
