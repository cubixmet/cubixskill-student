import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CheckCircle2, Play } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useLearningStore } from '../../../stores/learning.store';
import { useAcademyStore } from '../../../stores/academy.store';

export const QuizzesPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ academyUuid?: string }>();
  const quizAttempts = useLearningStore((state) => state.quizAttempts);
  const addQuizAttempt = useLearningStore((state) => state.addQuizAttempt);
  const academies = useAcademyStore((state) => state.academies);
  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB', primarySoft: '#EFF6FF' };

  const [activeQuizRunning, setActiveQuizRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleStartQuiz = () => {
    setActiveQuizRunning(true);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  const handleSubmitQuiz = () => {
    addQuizAttempt({
      quizTitle: 'React 19 Server Components Architecture',
      scorePercent: 100,
      passed: true,
    });
    setQuizFinished(true);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto hide-scrollbar">
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Knowledge Quizzes</h1>
        <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
          Test your comprehension with automated multiple choice quizzes and immediate score feedback.
        </p>
      </Card>

      {/* QUIZ RUNNER OR LIST */}
      {!activeQuizRunning ? (
        <div className="space-y-4">
          <Card padding="md" className="bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">React 19 Server Components Architecture</h3>
                <span className="text-[10px] text-slate-400 font-mono">10 Questions • 15 Minutes • Passing: 80%</span>
              </div>
              <Button size="sm" onClick={handleStartQuiz} leftIcon={<Play className="w-3.5 h-3.5" />} style={{ backgroundColor: theme.primaryColor }} className="font-semibold">
                Attempt Quiz
              </Button>
            </div>
            <p className="text-slate-600 font-normal">
              Covers React Server Components (RSC), action hydration, and compiler optimization flags.
            </p>
          </Card>

          {/* ATTEMPTS HISTORY */}
          <Card padding="md" className="bg-white border border-slate-200/80 space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 border-b border-slate-100 pb-2">Attempt History</h3>
            <div className="space-y-2">
              {quizAttempts.map((attempt) => (
                <div key={attempt.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">{attempt.quizTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Attempted: {new Date(attempt.attemptedAt).toLocaleDateString()}</span>
                  </div>
                  <Badge variant={attempt.passed ? 'success' : 'error'} size="sm">
                    Score: {attempt.scorePercent}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card padding="md" className="bg-white border border-slate-200/80 space-y-4">
          {!quizFinished ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-xs text-slate-900">Question 1 of 5</span>
                <span className="text-xs font-mono font-semibold text-rose-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time Remaining: 14:32
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-900">
                  Which hook in React 19 provides optimistic state updates before server response resolution?
                </h3>

                <div className="space-y-2">
                  {['useOptimistic()', 'useFormStatus()', 'useActionState()', 'useTransition()'].map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'shadow-2xs text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                        style={{
                          borderColor: isSelected ? theme.primaryColor : undefined,
                          backgroundColor: isSelected ? (theme.primarySoft || '#EFF6FF') : undefined,
                          color: isSelected ? theme.primaryColor : undefined,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setActiveQuizRunning(false)} className="font-semibold">Cancel</Button>
                <Button onClick={handleSubmitQuiz} disabled={selectedOption === null} style={{ backgroundColor: theme.primaryColor }} className="font-semibold">Submit Quiz</Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Quiz Completed Successfully!</h3>
              <p className="text-xs text-slate-600 font-normal">Your score: <strong className="font-semibold">100% (Passed)</strong></p>
              <Button onClick={() => setActiveQuizRunning(false)} style={{ backgroundColor: theme.primaryColor }} className="font-semibold">Back to Quizzes</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
