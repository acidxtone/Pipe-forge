import React, { useState } from 'react';
import { api } from '@/api/localClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, CheckCircle, Mail, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '@/lib/AuthContext';
import { anonymousSession } from '@/lib/AnonymousSession';

export default function YearSelection() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loginMode, setLoginMode] = useState('signin'); // 'signin' or 'signup'
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const years = [
    { year: 1, label: "First Year", description: "Foundation and basics" },
    { year: 2, label: "Second Year", description: "Building on fundamentals" },
    { year: 3, label: "Third Year", description: "Advanced techniques" },
    { year: 4, label: "Fourth Year", description: "Mastery and specialization" }
  ];

  const handleContinue = async () => {
    if (!selectedYear) return;
    
    // Update anonymous session with selected year
    anonymousSession.setCurrentYear(selectedYear);
    
    setSaving(true);
    try {
      // If user is authenticated, save to their profile
      if (isAuthenticated && user) {
        await api.auth.updateMe({ selected_year: selectedYear });
      }
      navigate(createPageUrl('Study'));
    } catch (error) {
      console.error('Failed to save year selection:', error);
      setSaving(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email) return;
    
    setLoginLoading(true);
    try {
      let result;
      if (loginMode === 'signin') {
        result = await api.auth.signIn(email, 'temp-password');
      } else {
        result = await api.auth.signUp(email, 'temp-password', email.split('@')[0]);
      }
      
      if (result.success) {
        // Merge anonymous session with email account
        await anonymousSession.mergeWithEmail(email);
        setShowLoginModal(false);
        setEmail('');
        navigate(createPageUrl('Study'));
      }
    } catch (error) {
      console.error('Email auth failed:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) return;
    
    setLoginLoading(true);
    try {
      const result = await api.auth.signInWithMagicLink(email);
      if (result.success) {
        setShowLoginModal(false);
        setEmail('');
      }
    } catch (error) {
      console.error('Magic link failed:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  // Get session stats
  const sessionStats = anonymousSession.getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Anonymous Session Info */}
        {sessionStats.isAnonymous && (
          <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
            <div className="font-semibold mb-1">Anonymous Session</div>
            <div className="text-xs opacity-80">ID: {sessionStats.sessionId.slice(-8)}</div>
            <div className="text-xs opacity-80">Questions: {sessionStats.totalAnswered}</div>
            <div className="text-xs opacity-80">Sessions: {sessionStats.sessionsCount}</div>
          </div>
        )}

        {/* Authenticated User Info */}
        {isAuthenticated && user && (
          <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
            <div className="font-semibold mb-1">Logged In</div>
            <div className="text-xs opacity-80">{user.email}</div>
          </div>
        )}

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

          {/* Optional Login/Save Section */}
          {sessionStats.isAnonymous && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {isAuthenticated ? 'Progress Saved!' : 'Save Your Progress'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLoginModal(!showLoginModal)}
                  className="text-white border-white hover:bg-white/20"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isAuthenticated ? 'Account Settings' : 'Save Progress'}
                </Button>
              </div>
              {isAuthenticated ? (
                <p className="text-white/80 text-sm">
                  Your progress is automatically saved to your account. You can switch between devices seamlessly.
                </p>
              ) : (
                <p className="text-white/80 text-sm">
                  Optionally create an account to save your progress across devices and access additional features.
                </p>
              )}
            </div>
          )}

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

        {/* Login Modal */}
        {showLoginModal && !isAuthenticated && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {loginMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleEmailAuth}
                    disabled={!email || loginLoading}
                    className="flex-1"
                  >
                    {loginLoading ? 'Please wait...' : (loginMode === 'signin' ? 'Sign In' : 'Create Account')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMagicLink}
                    disabled={!email || loginLoading}
                    className="flex-1"
                  >
                    {loginLoading ? 'Please wait...' : 'Send Magic Link'}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setLoginMode(loginMode === 'signin' ? 'signup' : 'signin')}
                    className="text-slate-600 hover:text-slate-900 text-sm"
                  >
                    {loginMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}