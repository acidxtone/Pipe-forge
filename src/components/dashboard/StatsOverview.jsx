import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  CheckCircle2, 
  Flame, 
  Trophy,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatsOverview({ progress }) {
  const stats = [
    {
      label: "Questions Answered",
      value: progress?.total_questions_answered || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Accuracy Rate",
      value: progress?.total_questions_answered 
        ? `${Math.round((progress.total_correct / progress.total_questions_answered) * 100)}%` 
        : "0%",
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Quizzes Completed",
      value: progress?.quizzes_completed || 0,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Best Score",
      value: progress?.best_score ? `${Math.round(progress.best_score)}%` : "—",
      icon: Trophy,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Study Streak",
      value: `${progress?.study_streak_days || 0} days`,
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Full Exams",
      value: progress?.full_exams_completed || 0,
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}