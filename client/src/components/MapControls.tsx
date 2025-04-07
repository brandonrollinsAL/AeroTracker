import { Button } from "@/components/ui/button";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
}

export default function MapControls({ onZoomIn, onZoomOut, onMyLocation }: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[900]">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white rounded-full shadow-md hover:bg-neutral-100 h-9 w-9"
        onClick={onZoomIn}
      >
        <span className="material-icons text-neutral-800">add</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white rounded-full shadow-md hover:bg-neutral-100 h-9 w-9"
        onClick={onZoomOut}
      >
        <span className="material-icons text-neutral-800">remove</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white rounded-full shadow-md hover:bg-neutral-100 h-9 w-9"
      >
        <span className="material-icons text-neutral-800">layers</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white rounded-full shadow-md hover:bg-neutral-100 h-9 w-9"
        onClick={onMyLocation}
      >
        <span className="material-icons text-neutral-800">my_location</span>
      </Button>
    </div>
  );
}
