import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '@/lib/AuthContext';

export default function YearSelection() {
  const { user, updateMe } = useAuth();
  const [selectedYear, setSelectedYear] = useState(user?.selected_year || null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const years = [
    { year: 1, label: "First Year", description: "Foundation and basics" },
    { year: 2, label: "Second Year", description: "Building on fundamentals" },
    { year: 3, label: "Third Year", description: "Advanced techniques" },
    { year: 4, label: "Fourth Year", description: "Mastery and specialization" }
  ];

  const handleContinue = async () => {
    if (!selectedYear) return;

    setSaving(true);
    try {
      await updateMe({ selected_year: selectedYear });
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Failed to save year selection:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Which year are you currently studying for?
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            Select your apprenticeship year to access the right study materials and track your progress
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {years.map((item) => (
              <motion.div
                key={item.year}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedYear === item.year
                      ? 'ring-4 ring-white bg-white'
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  onClick={() => setSelectedYear(item.year)}
                >
                  <CardContent className="p-6 relative">
                    {selectedYear === item.year && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    <div className="text-5xl font-bold text-slate-800 mb-2">
                      {item.year}
                    </div>
                    <div className="text-xl font-semibold text-slate-800 mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedYear || saving}
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 px-12 py-6 text-lg font-semibold"
            >
              {saving ? 'Saving...' : 'Start Studying'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
