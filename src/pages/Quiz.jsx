import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import QuestionCard from '@/components/quiz/QuestionCard';
import QuizTimer from '@/components/quiz/QuizTimer';
import ProgressBar from '@/components/quiz/ProgressBar';
import ResultsCard from '@/components/quiz/ResultsCard';
import YearIndicator from '@/components/YearIndicator';

export default function Quiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  
  const mode = urlParams.get('mode') || 'quick_quiz';
  const questionCount = parseInt(urlParams.get('questions')) || 20;
  const section = urlParams.get('section');
  const isTimed = urlParams.get('timed') === 'true';
  const timeLimit = parseInt(urlParams.get('timeLimit')) || questionCount * 108;
  const difficulty = urlParams.get('difficulty') || 'mixed';
  const showExplanationsMode = urlParams.get('explanations') || 'immediate';

  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);

  const { data: allQuestions = [], isLoading } = useQuery({
    queryKey: ['questions', user?.selected_year],
    queryFn: () => api.entities.Question.filter({ year: user?.selected_year || 1 }),
    enabled: !!user
  });

  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.selected_year],
    queryFn: async () => {
      const results = await api.entities.UserProgress.filter({ created_by: user?.email, year: user?.selected_year });
      return results[0] || null;
    },
    enabled: !!user?.email && !!user?.selected_year
  });

  // Select questions based on mode
  useEffect(() => {
    if (allQuestions.length === 0) return;

    let filtered = [...allQuestions];

    // Filter by section
    if (section && section !== 'all') {
      filtered = filtered.filter(q => q.section === parseInt(section));
    }

    // Filter by difficulty
    if (difficulty !== 'mixed') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    // Filter for weak areas mode
    if (mode === 'weak_areas' && progress?.weak_questions) {
      filtered = filtered.filter(q => progress.weak_questions.includes(q.id));
    }

    // Filter for bookmarked mode
    if (mode === 'bookmarked' && progress?.bookmarked_questions) {
      filtered = filtered.filter(q => progress.bookmarked_questions.includes(q.id));
    }

    // Shuffle and limit
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // For full exam, ensure proper section distribution
    if (mode === 'full_exam' && allQuestions.length >= 100) {
      const distribution = { 1: 10, 2: 38, 3: 19, 4: 13, 5: 20 };
      const distributed = [];
      
      for (const [sec, count] of Object.entries(distribution)) {
        const sectionQs = allQuestions
          .filter(q => q.section === parseInt(sec))
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
        distributed.push(...sectionQs);
      }
      
      setQuizQuestions(distributed.sort(() => Math.random() - 0.5));
    } else {
      setQuizQuestions(selected);
    }
  }, [allQuestions, mode, section, difficulty, questionCount, progress]);

  useEffect(() => {
    if (progress?.bookmarked_questions) {
      setBookmarkedQuestions(progress.bookmarked_questions);
    }
  }, [progress]);

  const updateProgressMutation = useMutation({
    mutationFn: async (results) => {
      const existing = progress;
      const sectionScores = {};
      
      results.question_results.forEach(r => {
        if (!sectionScores[r.section]) {
          sectionScores[r.section] = { attempted: 0, correct: 0 };
        }
        sectionScores[r.section].attempted++;
        if (r.correct) sectionScores[r.section].correct++;
      });

      const mergedSectionStats = { ...(existing?.section_stats || {}) };
      Object.entries(sectionScores).forEach(([sec, data]) => {
        if (!mergedSectionStats[sec]) {
          mergedSectionStats[sec] = { attempted: 0, correct: 0 };
        }
        mergedSectionStats[sec].attempted += data.attempted;
        mergedSectionStats[sec].correct += data.correct;
      });

      const wrongIds = results.question_results
        .filter(r => !r.correct)
        .map(r => r.question_id);

      const existingWeak = existing?.weak_questions || [];
      const mergedWeak = [...new Set([...existingWeak, ...wrongIds])];

      const today = new Date().toISOString().split('T')[0];
      const lastStudy = existing?.last_study_date;
      const isConsecutive = lastStudy === new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = lastStudy === today 
        ? existing?.study_streak_days || 1
        : isConsecutive 
          ? (existing?.study_streak_days || 0) + 1 
          : 1;

      const progressData = {
        total_questions_answered: (existing?.total_questions_answered || 0) + results.total_questions,
        total_correct: (existing?.total_correct || 0) + results.correct_answers,
        quizzes_completed: (existing?.quizzes_completed || 0) + 1,
        full_exams_completed: (existing?.full_exams_completed || 0) + (mode === 'full_exam' ? 1 : 0),
        section_stats: mergedSectionStats,
        weak_questions: mergedWeak,
        bookmarked_questions: bookmarkedQuestions,
        best_score: Math.max(existing?.best_score || 0, results.score_percentage),
        study_streak_days: newStreak,
        last_study_date: today
      };

      const year = user?.selected_year;
      if (existing?.id) {
        await api.entities.UserProgress.update(existing.id, { ...progressData, _year: year });
      } else {
        await api.entities.UserProgress.create({ ...progressData, year });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress', user?.selected_year]);
    }
  });

  const currentQuestion = quizQuestions[currentIndex];

  const handleAnswerSelect = (answer) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    if (!showExplanation && showExplanationsMode === 'immediate') {
      setShowExplanation(true);
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newAnswers = [...answers, {
      question_id: currentQuestion.id,
      user_answer: selectedAnswer,
      correct: isCorrect,
      section: currentQuestion.section
    }];
    setAnswers(newAnswers);

    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = useCallback((finalAnswers) => {
    const correctCount = finalAnswers.filter(a => a.correct).length;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    const sectionScores = {};
    finalAnswers.forEach(a => {
      if (!sectionScores[a.section]) {
        sectionScores[a.section] = { total: 0, correct: 0 };
      }
      sectionScores[a.section].total++;
      if (a.correct) sectionScores[a.section].correct++;
    });

    Object.keys(sectionScores).forEach(sec => {
      sectionScores[sec].percentage = 
        (sectionScores[sec].correct / sectionScores[sec].total) * 100;
    });

    const results = {
      mode,
      total_questions: finalAnswers.length,
      correct_answers: correctCount,
      score_percentage: (correctCount / finalAnswers.length) * 100,
      time_taken_seconds: timeTaken,
      section_scores: sectionScores,
      question_results: finalAnswers,
      completed: true
    };

    updateProgressMutation.mutate(results);
    setQuizComplete(true);
  }, [startTime, mode, updateProgressMutation]);

  const handleTimeUp = () => {
    completeQuiz(answers);
  };

  const toggleBookmark = () => {
    const questionId = currentQuestion.id;
    if (bookmarkedQuestions.includes(questionId)) {
      setBookmarkedQuestions(bookmarkedQuestions.filter(id => id !== questionId));
    } else {
      setBookmarkedQuestions([...bookmarkedQuestions, questionId]);
    }
  };

  const handleExit = () => {
    if (answers.length > 0) {
      setShowExitDialog(true);
    } else {
      navigate(createPageUrl('Dashboard'));
    }
  };

  const confirmExit = () => {
    if (answers.length > 0) {
      completeQuiz(answers);
    }
    navigate(createPageUrl('Dashboard'));
  };

  if (isLoading || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const correctCount = answers.filter(a => a.correct).length;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    const sectionScores = {};
    answers.forEach(a => {
      if (!sectionScores[a.section]) {
        sectionScores[a.section] = { total: 0, correct: 0 };
      }
      sectionScores[a.section].total++;
      if (a.correct) sectionScores[a.section].correct++;
    });
    Object.keys(sectionScores).forEach(sec => {
      sectionScores[sec].percentage = 
        (sectionScores[sec].correct / sectionScores[sec].total) * 100;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <ResultsCard 
          results={{
            score_percentage: (correctCount / answers.length) * 100,
            correct_answers: correctCount,
            total_questions: answers.length,
            time_taken_seconds: timeTaken,
            section_scores: sectionScores,
            question_results: answers
          }}
          onRetry={() => window.location.reload()}
          onHome={() => navigate(createPageUrl('Dashboard'))}
          onReviewWrong={() => {
            const wrongIds = answers.filter(a => !a.correct).map(a => a.question_id);
            navigate(createPageUrl('Quiz') + `?mode=review&ids=${wrongIds.join(',')}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handleExit}>
              <X className="h-5 w-5" />
            </Button>
            
            {isTimed && (
              <QuizTimer 
                totalSeconds={timeLimit}
                onTimeUp={handleTimeUp}
                isPaused={isPaused}
                onPauseToggle={setIsPaused}
              />
            )}
            
            <div className="flex items-center gap-3">
              {user?.selected_year && <YearIndicator year={user.selected_year} />}
              <div className="text-sm font-medium text-slate-600">
                {currentIndex + 1} / {quizQuestions.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ProgressBar 
          current={currentIndex + 1}
          total={quizQuestions.length}
          answers={answers}
        />
      </div>

      {/* Question */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={quizQuestions.length}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            showExplanation={showExplanation}
            onNext={handleNext}
            isBookmarked={bookmarkedQuestions.includes(currentQuestion.id)}
            onToggleBookmark={toggleBookmark}
          />
        </AnimatePresence>
      </main>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered {answers.length} of {quizQuestions.length} questions. 
              Your progress will be saved if you exit now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>
              Exit & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}