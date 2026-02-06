import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const difficultyColors = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200"
};

const sectionColors = {
  1: "bg-blue-50 text-blue-700",
  2: "bg-purple-50 text-purple-700",
  3: "bg-orange-50 text-orange-700",
  4: "bg-teal-50 text-teal-700",
  5: "bg-pink-50 text-pink-700"
};

export default function QuestionCard({ 
  question, 
  questionNumber, 
  totalQuestions,
  selectedAnswer, 
  onAnswerSelect, 
  showExplanation,
  onNext,
  isBookmarked,
  onToggleBookmark,
  isReviewMode = false
}) {
  const [hoveredOption, setHoveredOption] = useState(null);
  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d }
  ];

  const getOptionStyle = (letter) => {
    if (!showExplanation) {
      if (selectedAnswer === letter) {
        return "border-slate-900 bg-slate-50 ring-2 ring-slate-900";
      }
      if (hoveredOption === letter) {
        return "border-slate-300 bg-slate-50";
      }
      return "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
    }
    
    if (letter === question.correct_answer) {
      return "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500";
    }
    if (selectedAnswer === letter && letter !== question.correct_answer) {
      return "border-rose-500 bg-rose-50 ring-2 ring-rose-500";
    }
    return "border-slate-200 opacity-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">
                Question {questionNumber} of {totalQuestions}
              </span>
              <Badge className={cn("font-medium", sectionColors[question.section])}>
                Section {question.section}
              </Badge>
              <Badge variant="outline" className={cn("font-medium", difficultyColors[question.difficulty])}>
                {question.difficulty}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleBookmark}
              className="text-slate-400 hover:text-amber-500"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Section Name */}
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
            {question.section_name}
          </p>

          {/* Question */}
          <h2 className="text-xl font-semibold text-slate-900 leading-relaxed mb-8">
            {question.question_text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.letter}
                onClick={() => !showExplanation && onAnswerSelect(option.letter)}
                onMouseEnter={() => setHoveredOption(option.letter)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={showExplanation}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4",
                  getOptionStyle(option.letter),
                  !showExplanation && "cursor-pointer"
                )}
              >
                <span className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0",
                  selectedAnswer === option.letter && !showExplanation
                    ? "bg-slate-900 text-white"
                    : showExplanation && option.letter === question.correct_answer
                    ? "bg-emerald-500 text-white"
                    : showExplanation && selectedAnswer === option.letter
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 text-slate-600"
                )}>
                  {showExplanation && option.letter === question.correct_answer ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : showExplanation && selectedAnswer === option.letter ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    option.letter
                  )}
                </span>
                <span className="text-slate-700 font-medium">{option.text}</span>
              </button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8"
              >
                <div className={cn(
                  "rounded-xl p-6",
                  selectedAnswer === question.correct_answer
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-rose-50 border border-rose-200"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedAnswer === question.correct_answer ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-600" />
                        <span className="font-semibold text-rose-700">
                          Incorrect - The answer is {question.correct_answer}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-slate-700 leading-relaxed mb-4">
                    {question.explanation}
                  </p>

                  {question.wrong_explanations && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-600 mb-2">Why other options are wrong:</p>
                      <p className="text-sm text-slate-600">{question.wrong_explanations}</p>
                    </div>
                  )}

                  {question.formula && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">Formula:</p>
                      <code className="text-sm bg-white px-3 py-1 rounded border text-slate-800">
                        {question.formula}
                      </code>
                    </div>
                  )}

                  {question.reference && (
                    <p className="text-xs text-slate-500 mt-4">
                      Reference: {question.reference}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={onNext}
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 h-12 text-base"
                >
                  {questionNumber === totalQuestions ? "View Results" : "Next Question"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          {!showExplanation && selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button 
                onClick={onNext}
                className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base"
              >
                Check Answer
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}