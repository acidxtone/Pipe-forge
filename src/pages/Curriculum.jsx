import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, GraduationCap } from "lucide-react";

export default function Curriculum() {
  const sections = [
    {
      id: 1,
      name: "Workplace Safety and Rigging",
      percentage: 10,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      subtopics: [
        { code: "A", name: "Safety Legislation, Regulations & Industry Policy in the Trades", weight: 16 },
        { code: "B", name: "Climbing, Lifting, Rigging and Hoisting", weight: 25 },
        { code: "C", name: "Hazardous Material & Fire Protection", weight: 16 },
        { code: "D", name: "Apprenticeship Training Program", weight: 13 },
        { code: "E", name: "Pipe Trade Codes", weight: 13 },
        { code: "F", name: "Electrical Safety", weight: 17 }
      ]
    },
    {
      id: 2,
      name: "Tools, Equipment and Materials",
      percentage: 38,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      subtopics: [
        { code: "A", name: "Hand Tools", weight: 7 },
        { code: "B", name: "Power Tools", weight: 7 },
        { code: "C", name: "Welded Pipe and Fittings", weight: 13 },
        { code: "D", name: "Plastic Pipe and Tube", weight: 13 },
        { code: "E", name: "Threaded and Grooved Pipe", weight: 16 },
        { code: "F", name: "Tube and Tubing", weight: 13 },
        { code: "G", name: "Valves", weight: 13 },
        { code: "H", name: "Hangers, Supports and Fasteners", weight: 11 },
        { code: "I", name: "Pressure Testing", weight: 3 },
        { code: "J", name: "Pumps", weight: 4 }
      ]
    },
    {
      id: 3,
      name: "Metal Fabrication",
      percentage: 19,
      color: "bg-orange-100 text-orange-700 border-orange-200",
      subtopics: [
        { code: "A", name: "Welding Safety", weight: 9 },
        { code: "B", name: "Welding", weight: 65 },
        { code: "C", name: "Brazing and Soldering", weight: 26 }
      ]
    },
    {
      id: 4,
      name: "Drawings and Specifications",
      percentage: 13,
      color: "bg-teal-100 text-teal-700 border-teal-200",
      subtopics: [
        { code: "A", name: "Sketching and Drawing", weight: 20 },
        { code: "B", name: "Single Line Drawing", weight: 40 },
        { code: "C", name: "Drawing Interpretation", weight: 40 }
      ]
    },
    {
      id: 5,
      name: "Calculations and Science",
      percentage: 20,
      color: "bg-pink-100 text-pink-700 border-pink-200",
      subtopics: [
        { code: "A", name: "Applied Calculations", weight: 17 },
        { code: "B", name: "Perimeters, Areas, Percentage and Grade", weight: 23 },
        { code: "C", name: "Volumes and Capacities", weight: 8 },
        { code: "D", name: "Piping Offsets", weight: 13 },
        { code: "E", name: "Matter, Density and Relative Density", weight: 12 },
        { code: "F", name: "Pressure and Atmosphere", weight: 12 },
        { code: "G", name: "Principles of Electricity", weight: 15 }
      ]
    }
  ];

  const officialLinks = [
    {
      title: "Alberta Apprenticeship and Industry Training",
      description: "Official AIT website for apprenticeship information and resources",
      url: "https://tradesecrets.alberta.ca/"
    },
    {
      title: "Steamfitter-Pipefitter Program Information",
      description: "Official program details, curriculum guides, and exam information",
      url: "https://tradesecrets.alberta.ca/trades-occupations/profiles/007/"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">First Period Curriculum</h1>
          <p className="text-slate-600">
            Alberta Steamfitter/Pipefitter First Period Technical Training
          </p>
          <p className="text-sm text-slate-500 mt-1">
            8 Weeks • 30 Hours per Week • Total of 240 Hours
          </p>
        </div>

        {/* Curriculum Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section) => (
            <Card key={section.id} className="border-2 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={section.color}>
                        Section {section.id}
                      </Badge>
                      <Badge variant="outline" className="text-slate-600">
                        {section.percentage}% of Exam
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{section.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.subtopics.map((subtopic) => (
                    <div
                      key={subtopic.code}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                          {subtopic.code}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {subtopic.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {subtopic.weight}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Official Resources */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Official Resources</h2>
          <p className="text-slate-600 mb-6">
            Access official Alberta AIT resources and program information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officialLinks.map((link, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">{link.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{link.description}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Exam Information */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Entrance Examination Format</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-1">100</div>
                <div className="text-slate-300 text-sm">Multiple Choice Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-1">3 Hours</div>
                <div className="text-slate-300 text-sm">Time Limit</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-1">70%</div>
                <div className="text-slate-300 text-sm">Passing Score Required</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}