import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-5 right-5 md:hidden">
      <Button 
        onClick={onClick}
        size="icon" 
        className="rounded-full shadow-lg"
      >
        <span className="material-icons">filter_list</span>
      </Button>
    </div>
  );
}
