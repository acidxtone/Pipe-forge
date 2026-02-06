import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import YearIndicator from '@/components/YearIndicator';

/**
 * Year Header Component
 * Shows current study year at the top of every page
 */
const YearHeader = () => {
  const { user } = useAuth();

  if (!user?.selected_year) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">TradeBench</span>
          <span className="text-blue-200">•</span>
          <YearIndicator year={user.selected_year} />
        </div>
        <div className="text-xs text-blue-100">
          Steamfitter/Pipefitter Exam Prep
        </div>
      </div>
    </div>
  );
};

export default YearHeader;
