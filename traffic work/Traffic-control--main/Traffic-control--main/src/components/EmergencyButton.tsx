import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ambulanceIcon from "@/assets/ambulance.png";
import { useEffect } from "react";

interface EmergencyButtonProps {
  onActivate: () => void;
  isActive: boolean;
  countdown: number;
}

export const EmergencyButton = ({ onActivate, isActive, countdown }: EmergencyButtonProps) => {
  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isActive) {
      speakMessage("Emergency mode activated. Traffic is being stopped.");
    }
  }, [isActive]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {isActive && (
        <Card className="mb-4 p-4 bg-destructive/95 backdrop-blur-sm border-destructive animate-pulse">
          <div className="flex items-center gap-3">
            <img src={ambulanceIcon} alt="Ambulance" className="w-12 h-12" />
            <div>
              <p className="text-destructive-foreground font-bold text-lg">🚨 EMERGENCY MODE</p>
              <p className="text-destructive-foreground/90 text-sm">
                Traffic stopped: {countdown}s remaining
              </p>
            </div>
          </div>
        </Card>
      )}

      <Button
        onClick={onActivate}
        disabled={isActive}
        size="lg"
        className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img src={ambulanceIcon} alt="Ambulance" className="w-6 h-6 mr-2" />
        {isActive ? "Emergency Active" : "Emergency Alert"}
      </Button>
    </div>
  );
};
