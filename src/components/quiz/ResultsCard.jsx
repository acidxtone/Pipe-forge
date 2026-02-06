import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Clock, 
  RotateCcw, 
  Home, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const sectionNames = {
  1: "Workplace Safety and Rigging",
  2: "Tools, Equipment and Materials",
  3: "Metal Fabrication",
  4: "Drawings and Specifications",
  5: "Calculations and Science"
};

export default function ResultsCard({ 
  results,
  onRetry,
  onHome,
  onReviewWrong
}) {
  const { 
    score_percentage, 
    correct_answers, 
    total_questions, 
    time_taken_seconds,
    section_scores = {},
    question_results = []
  } = results;

  const passed = score_percentage >= 70;
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600' };
    if (percentage >= 85) return { grade: 'A', color: 'text-emerald-600' };
    if (percentage >= 80) return { grade: 'B+', color: 'text-blue-600' };
    if (percentage >= 75) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 70) return { grade: 'C', color: 'text-amber-600' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-rose-600' };
  };

  const { grade, color } = getGrade(score_percentage);

  const weakSections = Object.entries(section_scores)
    .filter(([_, data]) => data.percentage < 70)
    .sort((a, b) => a[1].percentage - b[1].percentage);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-0 shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className={cn(
          "p-8 text-center",
          passed 
            ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
            : "bg-gradient-to-br from-rose-500 to-orange-600"
        )}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4"
          >
            {passed ? (
              <Trophy className="h-10 w-10 text-white" />
            ) : (
              <Target className="h-10 w-10 text-white" />
            )}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-white/80">
            {passed 
              ? "You've passed this practice quiz!" 
              : "You need 70% to pass. Don't give up!"}
          </p>
        </div>

        <CardContent className="p-8">
          {/* Score */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4">
              <span className={cn("text-7xl font-bold", color)}>
                {Math.round(score_percentage)}%
              </span>
              <Badge className={cn("text-2xl px-4 py-1", color, "bg-slate-100")}>
                {grade}
              </Badge>
            </div>
            <p className="text-slate-500 mt-2">
              {correct_answers} correct out of {total_questions} questions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">{correct_answers}</p>
              <p className="text-xs text-slate-500">Correct</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <XCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">{total_questions - correct_answers}</p>
              <p className="text-xs text-slate-500">Incorrect</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">{formatTime(time_taken_seconds)}</p>
              <p className="text-xs text-slate-500">Time</p>
            </div>
          </div>

          {/* Section Breakdown */}
          {Object.keys(section_scores).length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 mb-4">Section Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(section_scores).map(([section, data]) => (
                  <div key={section} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                      {section}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 truncate max-w-[200px]">
                          {sectionNames[section]}
                        </span>
                        <span className={cn(
                          "font-medium",
                          data.percentage >= 70 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {Math.round(data.percentage)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all",
                            data.percentage >= 70 ? "bg-emerald-500" : "bg-rose-500"
                          )}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                    {data.percentage >= 70 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Areas */}
          {weakSections.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Focus Areas
              </h4>
              <p className="text-sm text-amber-700">
                Review these sections before your exam:{" "}
                {weakSections.map(([section]) => sectionNames[section]).join(", ")}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={onHome}
              className="h-12"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            {question_results.some(r => !r.correct) && (
              <Button 
                variant="outline" 
                onClick={onReviewWrong}
                className="h-12"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Review Wrong
              </Button>
            )}
            <Button 
              onClick={onRetry}
              className="h-12 col-span-2 bg-slate-900 hover:bg-slate-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}