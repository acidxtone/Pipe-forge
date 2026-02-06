import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-slate-800 mb-4">Page Not Found</p>
        <p className="text-slate-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link to={createPageUrl('Dashboard')}>
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
