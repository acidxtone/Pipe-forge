import React from 'react';
import { Badge } from "@/components/ui/badge";

export default function YearIndicator({ year }) {
  const yearLabels = {
    1: "Year 1",
    2: "Year 2", 
    3: "Year 3",
    4: "Year 4"
  };

  return (
    <Badge className="bg-slate-800 text-white hover:bg-slate-700 px-3 py-1.5 text-sm font-medium">
      {yearLabels[year] || "Year 1"}
    </Badge>
  );
}