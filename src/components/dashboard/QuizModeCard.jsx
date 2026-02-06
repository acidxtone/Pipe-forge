import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function QuizModeCard({ 
  mode, 
  title, 
  description, 
  icon: Icon, 
  color, 
  badge,
  onClick,
  disabled = false
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    emerald: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    amber: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
    rose: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700",
    slate: "from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Card 
        className={cn(
          "border-0 shadow-md cursor-pointer overflow-hidden transition-shadow",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
        )}
        onClick={disabled ? undefined : onClick}
      >
        <CardContent className="p-0">
          <div className={cn(
            "bg-gradient-to-br text-white p-6",
            colorClasses[color]
          )}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6" />
              </div>
              {badge && (
                <Badge className="bg-white/20 text-white border-0 font-medium">
                  {badge}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-white/80 text-sm mb-4">{description}</p>
            <div className="flex items-center text-sm font-medium">
              Start Quiz
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}