import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700"
};

const sectionColors = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-purple-100 text-purple-700",
  3: "bg-orange-100 text-orange-700",
  4: "bg-teal-100 text-teal-700",
  5: "bg-pink-100 text-pink-700"
};

export default function StudyQuestionCard({ question, number }) {
  const [expanded, setExpanded] = useState(true);

  const options = [
    { label: 'A', text: question.option_a },
    { label: 'B', text: question.option_b },
    { label: 'C', text: question.option_c },
    { label: 'D', text: question.option_d }
  ];

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Question {number}</span>
              <Badge className={sectionColors[question.section]}>
                Section {question.section}
              </Badge>
              <Badge className={difficultyColors[question.difficulty]}>
                {question.difficulty}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700">
                Answer: {question.correct_answer}
              </Badge>
            </div>
            <h3 className="text-base font-medium text-slate-800 leading-relaxed">
              {question.question_text}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Answer Options */}
        <div className="space-y-2">
          {options.map((option) => {
            const isCorrect = option.label === question.correct_answer;
            
            return (
              <div
                key={option.label}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
                  expanded && isCorrect 
                    ? "border-emerald-500 bg-emerald-50" 
                    : "border-slate-200 bg-white"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                  expanded && isCorrect
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                )}>
                  {option.label}
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700">{option.text}</span>
                  {expanded && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation (shown when expanded) */}
        {expanded && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">Correct Answer: {question.correct_answer}</span>
              </div>
              <p className="text-sm text-emerald-800 leading-relaxed">
                {question.explanation}
              </p>
            </div>

            {question.wrong_explanations && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-900">Why Other Options Are Wrong</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {question.wrong_explanations}
                </p>
              </div>
            )}

            {question.formula && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <span className="text-xs font-semibold text-blue-900 mb-1 block">Formula:</span>
                <code className="text-sm text-blue-800 font-mono">{question.formula}</code>
              </div>
            )}

            {question.reference && (
              <div className="text-xs text-slate-500">
                <span className="font-medium">Reference:</span> {question.reference}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}