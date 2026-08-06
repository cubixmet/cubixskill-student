import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlayCircle, CheckCircle2, FileText, Download } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useLearningStore } from '../../../stores/learning.store';
import { useAcademyStore } from '../../../stores/academy.store';

export const LessonPlayerPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', lessonId = 'les-3.2' } = useParams<{ academyUuid?: string; lessonId?: string }>();
  const completedLessonIds = useLearningStore((state) => state.completedLessonIds);
  const markLessonComplete = useLearningStore((state) => state.markLessonComplete);

  const academies = useAcademyStore((state) => state.academies);
  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB' };

  const [activeTab, setActiveTab] = useState<'notes' | 'resources'>('notes');
  const [noteText, setNoteText] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    'Remember to export Zustand store with persist middleware.',
  ]);

  const isCompleted = completedLessonIds.includes(lessonId);

  const handleAddNote = () => {
    if (noteText.trim()) {
      setNotesList([noteText, ...notesList]);
      setNoteText('');
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs text-left max-w-6xl mx-auto pb-12 hide-scrollbar">
      {/* 1. LESSON TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Module 3: Server Actions &amp; State Hydration</span>
          <h2 className="text-base sm:text-[18px] font-semibold text-slate-900 tracking-tight">3.2 Optimistic UI Updates &amp; Zustand Sync</h2>
        </div>

        <Button
          size="sm"
          variant={isCompleted ? 'outline' : 'primary'}
          onClick={() => markLessonComplete(lessonId)}
          leftIcon={<CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-white'}`} />}
          className="h-9 font-semibold"
          style={!isCompleted ? { backgroundColor: theme.primaryColor } : undefined}
        >
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CENTER VIDEO PLAYER & CONTENT VIEW */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center border border-slate-800">
            <div className="text-center text-white space-y-3 p-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-all shadow-xl animate-pulse"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="font-semibold text-sm block">Video Lesson Streaming Player</span>
                <span className="text-[11px] text-slate-400 font-mono">Duration: 18:45 • HD 1080p</span>
              </div>
            </div>
          </div>

          {/* LESSON DESCRIPTION */}
          <Card padding="md" className="bg-white border border-slate-200/80 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">Lesson Notes &amp; Overview</h3>
            <p className="text-slate-600 leading-relaxed font-normal">
              In this video masterclass, we examine how to implement optimistic state updates across server components and local client stores using Zustand persist middleware.
            </p>
          </Card>
        </div>

        {/* RIGHT SIDEBAR: NOTES & RESOURCES */}
        <div className="lg:col-span-4 space-y-4">
          <Card padding="md" className="bg-white border border-slate-200/80 space-y-3">
            <div className="flex border-b border-slate-100 font-semibold text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex-1 pb-2 text-center transition-all border-b-2 cursor-pointer ${
                  activeTab === 'notes' ? 'font-semibold' : 'text-slate-400 border-transparent'
                }`}
                style={{
                  color: activeTab === 'notes' ? theme.primaryColor : undefined,
                  borderBottomColor: activeTab === 'notes' ? theme.primaryColor : 'transparent',
                }}
              >
                Personal Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`flex-1 pb-2 text-center transition-all border-b-2 cursor-pointer ${
                  activeTab === 'resources' ? 'font-semibold' : 'text-slate-400 border-transparent'
                }`}
                style={{
                  color: activeTab === 'resources' ? theme.primaryColor : undefined,
                  borderBottomColor: activeTab === 'resources' ? theme.primaryColor : 'transparent',
                }}
              >
                Resources
              </button>
            </div>

            {activeTab === 'notes' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    placeholder="Add a timestamp note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 rounded-[10px] border border-slate-200 p-2 text-xs font-medium focus:outline-hidden"
                  />
                  <Button size="sm" onClick={handleAddNote} style={{ backgroundColor: theme.primaryColor }}>Save</Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
                  {notesList.map((n, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-800 font-medium">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    <span className="font-semibold text-slate-800">zustand_cheatsheet.pdf</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 hover:opacity-80 cursor-pointer" />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
