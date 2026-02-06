import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QuizTimer({ 
  totalSeconds = 10800, // 3 hours default
  onTimeUp, 
  isPaused = false,
  onPauseToggle,
  showPauseButton = true
}) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [internalPaused, setInternalPaused] = useState(isPaused);

  useEffect(() => {
    if (internalPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [internalPaused, onTimeUp]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatTime = (val) => val.toString().padStart(2, '0');

  const getTimeColor = () => {
    const percentLeft = (timeLeft / totalSeconds) * 100;
    if (percentLeft <= 10) return "text-rose-600";
    if (percentLeft <= 25) return "text-amber-600";
    return "text-slate-700";
  };

  const handlePauseToggle = () => {
    setInternalPaused(!internalPaused);
    onPauseToggle?.(!internalPaused);
  };

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200">
      <Clock className={cn("h-4 w-4", getTimeColor())} />
      <span className={cn("font-mono text-lg font-semibold tracking-wider", getTimeColor())}>
        {hours > 0 && `${formatTime(hours)}:`}{formatTime(minutes)}:{formatTime(seconds)}
      </span>
      {showPauseButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePauseToggle}
          className="h-8 w-8"
        >
          {internalPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}