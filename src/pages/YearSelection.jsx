import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function YearSelection() {
  const [selectedYear, setSelectedYear] = useState(null);
  const navigate = useNavigate();

  const years = [
    { number: 1, title: "Period 1", description: "Basic pipefitting fundamentals", icon: "🔧" },
    { number: 2, title: "Period 2", description: "Intermediate systems and installations", icon: "⚙️" },
    { number: 3, title: "Period 3", description: "Advanced piping systems", icon: "🏭" },
    { number: 4, title: "Period 4", description: "Master level and supervision", icon: "👨‍🏫" }
  ];

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleStartStudying = () => {
    if (selectedYear) {
      navigate(`/Study?year=${selectedYear}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-slate-800 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900">TradeBench</h1>
          </div>
          <h2 className="text-2xl text-slate-700 mb-2">Steamfitter/Pipefitter Exam Prep</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Select your apprenticeship period to start studying with practice questions and study guides
          </p>
        </motion.div>

        {/* Year Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {years.map((year, index) => (
            <motion.div
              key={year.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg border-2 ${
                  selectedYear === year.number 
                    ? 'border-slate-800 bg-slate-50' 
                    : 'border-transparent hover:bg-slate-50 bg-white'
                } p-6 text-center`}
                onClick={() => handleYearSelect(year.number)}
              >
                <div className="text-4xl mb-3">{year.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {year.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{year.description}</p>
                {selectedYear === year.number && (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Start Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={handleStartStudying}
            disabled={!selectedYear}
            className="bg-slate-900 text-white hover:bg-slate-800 px-12 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            Start Studying {selectedYear && `- Period ${selectedYear}`}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
