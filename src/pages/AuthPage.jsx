import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favourite sports team?",
  "What street did you grow up on?",
  "What was your childhood nickname?",
  "What is the name of your best friend from childhood?",
];

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [resetQuestion, setResetQuestion] = useState('');
  const [resetAnswer, setResetAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);

  const navigateAfterAuth = (authUser) => {
    if (authUser?.selected_year) {
      navigate(createPageUrl('Dashboard'));
    } else {
      navigate(createPageUrl('YearSelection'));
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.message);
      } else {
        navigateAfterAuth(result.user);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!fullName.trim()) { setError('Please enter your full name'); setIsSubmitting(false); return; }
      if (!securityQuestion) { setError('Please select a security question'); setIsSubmitting(false); return; }
      if (!securityAnswer.trim()) { setError('Please enter your security answer'); setIsSubmitting(false); return; }
      const result = await signUp(email, password, fullName, securityQuestion, securityAnswer);
      if (!result.success) {
        setError(result.message);
      } else {
        navigateAfterAuth(result.user);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setResetQuestion(data.securityQuestion);
      setResetStep(2);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: resetEmail, securityAnswer: resetAnswer }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setResetToken(data.resetToken);
      setResetStep(3);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStep3 = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: resetEmail, resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccessMessage(data.message);
      setTimeout(() => {
        setMode('signin');
        setSuccessMessage('');
        setResetStep(1);
        setResetEmail('');
        setResetAnswer('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setResetStep(1);
    setResetEmail('');
    setResetAnswer('');
    setResetQuestion('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const renderTitle = () => {
    if (mode === 'signin') return 'Welcome back';
    if (mode === 'signup') return 'Create your account';
    if (mode === 'forgot') {
      if (resetStep === 1) return 'Forgot password';
      if (resetStep === 2) return 'Security question';
      return 'Set new password';
    }
  };

  const renderSubtitle = () => {
    if (mode === 'signin') return 'Sign in to continue your progress';
    if (mode === 'signup') return 'Start your apprenticeship training journey';
    if (mode === 'forgot') {
      if (resetStep === 1) return 'Enter your email to get started';
      if (resetStep === 2) return 'Answer your security question to verify your identity';
      return 'Choose a new password for your account';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TradeBench</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-slate-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {renderTitle()}
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">
              {renderSubtitle()}
            </p>
          </CardHeader>
          <CardContent className="pt-4">

            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">{error}</div>}

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-medium">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
                </Button>

                <div className="text-center">
                  <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot your password?
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="text-blue-600 hover:text-blue-700 font-medium">Sign up</button>
                  </p>
                </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Security Question</label>
                  <div className="relative">
                    <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white" required>
                      <option value="">Select a question...</option>
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Security Answer</label>
                  <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Your answer"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>

                {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">{error}</div>}

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-medium">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('signin')} className="text-blue-600 hover:text-blue-700 font-medium">Sign in</button>
                  </p>
                </div>
              </form>
            )}

            {mode === 'forgot' && resetStep === 1 && (
              <form onSubmit={handleResetStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>

                {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">{error}</div>}

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-medium">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking...</> : 'Continue'}
                </Button>

                <div className="text-center">
                  <button type="button" onClick={() => switchMode('signin')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && resetStep === 2 && (
              <form onSubmit={handleResetStep2} className="space-y-4">
                <div className="bg-slate-50 text-slate-700 text-sm px-3 py-2.5 rounded-lg border border-slate-200">
                  {resetQuestion}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Answer</label>
                  <input type="text" value={resetAnswer} onChange={(e) => setResetAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>

                {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">{error}</div>}

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-medium">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify Answer'}
                </Button>

                <div className="text-center">
                  <button type="button" onClick={() => { setResetStep(1); setError(''); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && resetStep === 3 && (
              <form onSubmit={handleResetStep3} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10" required minLength={6} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required minLength={6} />
                </div>

                {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">{error}</div>}
                {successMessage && <div className="bg-green-50 text-green-700 text-sm px-3 py-2.5 rounded-lg border border-green-200">{successMessage}</div>}

                <Button type="submit" disabled={isSubmitting || !!successMessage} className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-medium">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : 'Reset Password'}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
