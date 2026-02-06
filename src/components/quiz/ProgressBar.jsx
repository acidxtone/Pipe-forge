import React from 'react';
import { cn } from "@/lib/utils";

export default function ProgressBar({ 
  current, 
  total, 
  answers = [],
  onQuestionClick 
}) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full">
      {/* Main progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-slate-800 to-slate-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: total }, (_, i) => {
          const answer = answers[i];
          const isCurrent = i + 1 === current;
          
          return (
            <button
              key={i}
              onClick={() => onQuestionClick?.(i)}
              className={cn(
                "w-6 h-6 rounded-full text-xs font-medium transition-all duration-200",
                isCurrent && "ring-2 ring-offset-2 ring-slate-400",
                answer === undefined && "bg-slate-100 text-slate-400 hover:bg-slate-200",
                answer?.correct === true && "bg-emerald-500 text-white",
                answer?.correct === false && "bg-rose-500 text-white",
                answer !== undefined && answer.correct === undefined && "bg-slate-400 text-white"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}