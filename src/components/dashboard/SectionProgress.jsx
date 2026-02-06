import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

const sectionInfo = {
  1: { name: "Workplace Safety and Rigging", target: 10, color: "blue" },
  2: { name: "Tools, Equipment and Materials", target: 38, color: "purple" },
  3: { name: "Metal Fabrication", target: 19, color: "orange" },
  4: { name: "Drawings and Specifications", target: 13, color: "teal" },
  5: { name: "Calculations and Science", target: 20, color: "pink" }
};

export default function SectionProgress({ sectionStats = {} }) {
  const sections = Object.entries(sectionInfo).map(([num, info]) => {
    const stats = sectionStats[num] || { attempted: 0, correct: 0 };
    const percentage = stats.attempted > 0 
      ? Math.round((stats.correct / stats.attempted) * 100) 
      : 0;
    const status = percentage >= 70 ? "passing" : percentage > 0 ? "needs_work" : "not_started";
    
    return {
      section: num,
      ...info,
      ...stats,
      percentage,
      status
    };
  });

  const getStatusIcon = (status, percentage) => {
    if (status === "not_started") return <Minus className="h-4 w-4 text-slate-400" />;
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    return <TrendingDown className="h-4 w-4 text-rose-500" />;
  };

  const getStatusBadge = (status, percentage) => {
    if (status === "not_started") return { text: "Not Started", class: "bg-slate-100 text-slate-600" };
    if (percentage >= 85) return { text: "Excellent", class: "bg-emerald-100 text-emerald-700" };
    if (percentage >= 70) return { text: "Passing", class: "bg-blue-100 text-blue-700" };
    if (percentage >= 50) return { text: "Needs Work", class: "bg-amber-100 text-amber-700" };
    return { text: "Focus Area", class: "bg-rose-100 text-rose-700" };
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Section Progress
          <Badge variant="outline" className="font-normal">
            Exam Distribution
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => {
          const badge = getStatusBadge(section.status, section.percentage);
          
          return (
            <div key={section.section} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold",
                    `bg-${section.color}-100 text-${section.color}-700`
                  )}
                  style={{
                    backgroundColor: section.color === 'blue' ? '#dbeafe' : 
                                   section.color === 'purple' ? '#f3e8ff' :
                                   section.color === 'orange' ? '#fed7aa' :
                                   section.color === 'teal' ? '#ccfbf1' : '#fce7f3',
                    color: section.color === 'blue' ? '#1d4ed8' : 
                          section.color === 'purple' ? '#7c3aed' :
                          section.color === 'orange' ? '#c2410c' :
                          section.color === 'teal' ? '#0d9488' : '#be185d'
                  }}
                  >
                    {section.section}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{section.name}</p>
                    <p className="text-xs text-slate-500">
                      {section.target}% of exam • {section.attempted} practiced
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("font-medium", badge.class)}>
                    {badge.text}
                  </Badge>
                  {getStatusIcon(section.status, section.percentage)}
                </div>
              </div>
              
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    section.percentage >= 70 ? "bg-emerald-500" :
                    section.percentage > 0 ? "bg-amber-500" : "bg-slate-200"
                  )}
                  style={{ width: `${section.percentage}%` }}
                />
              </div>
              
              {section.status !== "not_started" && (
                <p className="text-xs text-slate-500 text-right">
                  {section.correct}/{section.attempted} correct ({section.percentage}%)
                </p>
              )}
            </div>
          );
        })}

        {Object.values(sectionStats).every(s => !s?.attempted) && (
          <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
            <AlertCircle className="h-4 w-4" />
            Start practicing to track your progress by section
          </div>
        )}
      </CardContent>
    </Card>
  );
}