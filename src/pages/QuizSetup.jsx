import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/localClient';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Target,
  GraduationCap,
  Zap,
  Calculator,
  AlertTriangle,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import YearIndicator from '@/components/YearIndicator';

const modeConfig = {
  full_exam: {
    title: 'Full Practice Exam',
    description: 'Simulate the actual exam with 100 questions and 3-hour time limit',
    icon: GraduationCap,
    color: 'slate',
    questionCount: 100,
    timed: true,
    timeLimit: 10800
  },
  section_focus: {
    title: 'Section Focus',
    description: 'Practice specific sections to strengthen weak areas',
    icon: Target,
    color: 'blue',
    showSectionSelect: true
  },
  quick_quiz: {
    title: 'Quick Quiz',
    description: 'Short practice session for daily study',
    icon: Zap,
    color: 'purple',
    showQuestionCount: true
  },
  calculations: {
    title: 'Calculations Intensive',
    description: 'Focus on Section 5: Calculations and Science',
    icon: Calculator,
    color: 'emerald',
    section: 5
  },
  weak_areas: {
    title: 'Weak Areas Practice',
    description: 'Review questions you previously answered incorrectly',
    icon: AlertTriangle,
    color: 'amber'
  },
  bookmarked: {
    title: 'Bookmarked Questions',
    description: 'Practice your saved questions',
    icon: BookOpen,
    color: 'rose'
  }
};

const sections = [
  { num: 1, name: 'Workplace Safety and Rigging', questions: 10 },
  { num: 2, name: 'Tools, Equipment and Materials', questions: 38 },
  { num: 3, name: 'Metal Fabrication', questions: 19 },
  { num: 4, name: 'Drawings and Specifications', questions: 13 },
  { num: 5, name: 'Calculations and Science', questions: 20 }
];

export default function QuizSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'quick_quiz';
  
  const [selectedSection, setSelectedSection] = useState('all');
  const [questionCount, setQuestionCount] = useState('20');
  const [timed, setTimed] = useState(false);
  const [difficulty, setDifficulty] = useState('mixed');
  const [showExplanations, setShowExplanations] = useState(true);

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const results = await api.entities.UserProgress.filter({ created_by: user?.email });
      return results[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions', user?.selected_year],
    queryFn: () => api.entities.Question.filter({ year: user?.selected_year || 1 }),
    enabled: !!user
  });

  const config = modeConfig[mode] || modeConfig.quick_quiz;
  const Icon = config.icon;

  const getAvailableQuestions = () => {
    if (mode === 'weak_areas') return progress?.weak_questions?.length || 0;
    if (mode === 'bookmarked') return progress?.bookmarked_questions?.length || 0;
    if (mode === 'calculations') return questions.filter(q => q.section === 5).length;
    if (selectedSection !== 'all') return questions.filter(q => q.section === parseInt(selectedSection)).length;
    return questions.length;
  };

  const handleStart = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    
    if (config.questionCount) {
      params.set('questions', config.questionCount);
    } else if (config.showQuestionCount) {
      params.set('questions', questionCount);
    }
    
    if (config.showSectionSelect && selectedSection !== 'all') {
      params.set('section', selectedSection);
    }
    
    if (config.section) {
      params.set('section', config.section);
    }
    
    params.set('timed', timed || config.timed ? 'true' : 'false');
    params.set('difficulty', difficulty);
    params.set('explanations', showExplanations ? 'immediate' : 'end');
    
    if (config.timeLimit) {
      params.set('timeLimit', config.timeLimit);
    } else if (timed) {
      const numQuestions = parseInt(questionCount) || 20;
      params.set('timeLimit', numQuestions * 108); // 1.8 min per question
    }

    navigate(createPageUrl('Quiz') + '?' + params.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            {user?.selected_year && <YearIndicator year={user.selected_year} />}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              `bg-${config.color}-100`
            )}
            style={{
              backgroundColor: config.color === 'slate' ? '#f1f5f9' :
                             config.color === 'blue' ? '#dbeafe' :
                             config.color === 'purple' ? '#f3e8ff' :
                             config.color === 'emerald' ? '#d1fae5' :
                             config.color === 'amber' ? '#fef3c7' : '#ffe4e6'
            }}
            >
              <Icon className="h-7 w-7" style={{
                color: config.color === 'slate' ? '#475569' :
                       config.color === 'blue' ? '#2563eb' :
                       config.color === 'purple' ? '#9333ea' :
                       config.color === 'emerald' ? '#059669' :
                       config.color === 'amber' ? '#d97706' : '#e11d48'
              }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
              <p className="text-slate-600">{config.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Section Selection */}
            {config.showSectionSelect && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Select Section</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedSection} onValueChange={setSelectedSection}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="flex-1 cursor-pointer">
                          <span className="font-medium">All Sections</span>
                          <span className="text-sm text-slate-500 ml-2">({questions.length} questions)</span>
                        </Label>
                      </div>
                      {sections.map((section) => (
                        <div key={section.num} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
                          <RadioGroupItem value={section.num.toString()} id={`section-${section.num}`} />
                          <Label htmlFor={`section-${section.num}`} className="flex-1 cursor-pointer">
                            <span className="font-medium">Section {section.num}: {section.name}</span>
                            <span className="text-sm text-slate-500 ml-2">
                              ({questions.filter(q => q.section === section.num).length} questions)
                            </span>
                          </Label>
                          <Badge variant="outline">{section.questions}% of exam</Badge>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Question Count */}
            {config.showQuestionCount && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Number of Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={questionCount} onValueChange={setQuestionCount}>
                    <div className="grid grid-cols-4 gap-3">
                      {['10', '20', '30', '50'].map((count) => (
                        <div 
                          key={count}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                            questionCount === count 
                              ? "border-slate-900 bg-slate-50" 
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => setQuestionCount(count)}
                        >
                          <RadioGroupItem value={count} id={`count-${count}`} className="sr-only" />
                          <span className="text-2xl font-bold">{count}</span>
                          <span className="text-xs text-slate-500">questions</span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Difficulty */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Difficulty Level</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'easy', label: 'Easy', desc: 'Recall & identification' },
                      { value: 'mixed', label: 'Mixed', desc: 'Balanced difficulty' },
                      { value: 'hard', label: 'Hard', desc: 'Analysis & problem-solving' }
                    ].map((option) => (
                      <div 
                        key={option.value}
                        className={cn(
                          "flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                          difficulty === option.value 
                            ? "border-slate-900 bg-slate-50" 
                            : "border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => setDifficulty(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <span className="font-semibold">{option.label}</span>
                        <span className="text-xs text-slate-500 mt-1">{option.desc}</span>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!config.timed && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium">Timed Mode</p>
                        <p className="text-sm text-slate-500">1.8 minutes per question</p>
                      </div>
                    </div>
                    <Switch checked={timed} onCheckedChange={setTimed} />
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Show Explanations</p>
                      <p className="text-sm text-slate-500">See explanations after each answer</p>
                    </div>
                  </div>
                  <Switch checked={showExplanations} onCheckedChange={setShowExplanations} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary & Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Quiz Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Questions</span>
                    <span className="font-medium">
                      {config.questionCount || questionCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Difficulty</span>
                    <span className="font-medium capitalize">{difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time Limit</span>
                    <span className="font-medium">
                      {timed || config.timed ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available</span>
                    <span className="font-medium">{getAvailableQuestions()} questions</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button 
                    onClick={handleStart}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-base"
                    disabled={getAvailableQuestions() === 0}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Quiz
                  </Button>
                  {getAvailableQuestions() === 0 && (
                    <p className="text-xs text-center text-rose-500 mt-2">
                      No questions available for this selection
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}