import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, User, RotateCcw, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";
import YearIndicator from '@/components/YearIndicator';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, updateMe } = useAuth();
  const [showChangeYear, setShowChangeYear] = useState(false);
  const [selectedNewYear, setSelectedNewYear] = useState(null);

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const results = await api.entities.UserProgress.filter({ created_by: user?.email });
      return results[0] || null;
    },
    enabled: !!user?.email
  });

  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      if (progress?.id) {
        await api.entities.UserProgress.delete(progress.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      toast.success('Progress reset successfully');
    }
  });

  const clearBookmarksMutation = useMutation({
    mutationFn: async () => {
      if (progress?.id) {
        await api.entities.UserProgress.update(progress.id, {
          bookmarked_questions: []
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      toast.success('Bookmarks cleared');
    }
  });

  const clearWeakAreasMutation = useMutation({
    mutationFn: async () => {
      if (progress?.id) {
        await api.entities.UserProgress.update(progress.id, {
          weak_questions: []
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      toast.success('Weak areas cleared');
    }
  });

  const changeYearMutation = useMutation({
    mutationFn: async (newYear) => {
      if (progress?.id) {
        await api.entities.UserProgress.delete(progress.id);
      }
      await updateMe({ selected_year: newYear });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      setShowChangeYear(false);
      setSelectedNewYear(null);
      toast.success('Year changed successfully');
      navigate(createPageUrl('Dashboard'));
    }
  });

  const handleLogout = () => {
    api.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

        {/* Profile */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.full_name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm text-slate-500">Study Year</p>
                <div className="mt-1">
                  <YearIndicator year={user?.selected_year} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Study Statistics</CardTitle>
            <CardDescription>Your overall progress data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Total Questions</p>
                <p className="text-2xl font-bold">{progress?.total_questions_answered || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Correct Answers</p>
                <p className="text-2xl font-bold">{progress?.total_correct || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Quizzes Completed</p>
                <p className="text-2xl font-bold">{progress?.quizzes_completed || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Study Streak</p>
                <p className="text-2xl font-bold">{progress?.study_streak_days || 0} days</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Bookmarked</p>
                <p className="text-2xl font-bold">{progress?.bookmarked_questions?.length || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Weak Questions</p>
                <p className="text-2xl font-bold">{progress?.weak_questions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year Management */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Study Year
            </CardTitle>
            <CardDescription>Change your apprenticeship year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <p className="font-medium">Change Study Year</p>
                <p className="text-sm text-slate-500">Switch to a different apprenticeship year</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowChangeYear(true)}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>Manage your study data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <p className="font-medium">Clear Bookmarks</p>
                <p className="text-sm text-slate-500">Remove all bookmarked questions</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">Clear</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Bookmarks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all your bookmarked questions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => clearBookmarksMutation.mutate()}>
                      Clear Bookmarks
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <p className="font-medium">Clear Weak Areas</p>
                <p className="text-sm text-slate-500">Reset your weak questions list</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">Clear</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Weak Areas?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset your weak questions list. You'll need to practice again to identify weak areas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => clearWeakAreasMutation.mutate()}>
                      Clear Weak Areas
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200">
              <div>
                <p className="font-medium text-rose-700">Reset All Progress</p>
                <p className="text-sm text-rose-600">Delete all your study data and start fresh</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your study progress, including quiz history, 
                      section scores, bookmarks, and weak areas. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => resetProgressMutation.mutate()}
                      className="bg-rose-600 hover:bg-rose-700"
                    >
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Change Year Dialog */}
      <AlertDialog open={showChangeYear} onOpenChange={setShowChangeYear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Study Year</AlertDialogTitle>
            <AlertDialogDescription>
              Changing your study year will reset and clear all progress, logs, weak-area data, and exam results for your current year. This is done for accuracy and storage efficiency. Your account will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[1, 2, 3, 4].map(year => (
              <Button
                key={year}
                variant={selectedNewYear === year ? "default" : "outline"}
                onClick={() => setSelectedNewYear(year)}
                disabled={user?.selected_year === year}
                className="h-20"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">Year {year}</div>
                  {user?.selected_year === year && (
                    <div className="text-xs mt-1 opacity-70">Current</div>
                  )}
                </div>
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedNewYear(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => changeYearMutation.mutate(selectedNewYear)}
              disabled={!selectedNewYear || selectedNewYear === user?.selected_year}
              className="bg-slate-800 hover:bg-slate-700"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}