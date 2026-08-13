import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, ArrowRight, XCircle, RotateCcw } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { Button } from '../../../../components/ui/Button';

interface Props {
  lesson: CourseLesson;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary purpose of the React 19 Compiler?',
    options: [
      'Automated memoization of component rendering and JSX trees without manual useMemo/useCallback',
      'Direct compilation of React components into native WebAssembly binary modules',
      'Replacing CSS styling with JavaScript runtime design tokens',
      'Converting all client components into server components automatically',
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    question: 'How does useActionState simplify form handling in React 19?',
    options: [
      'It manages pending state and submission response automatically for form actions',
      'It eliminates the need for HTML form elements completely',
      'It forces client-side re-rendering on every keystroke',
      'It encrypts form data using WebCrypto before sending to server',
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    question: 'What is the main benefit of Async Transitions (useTransition)?',
    options: [
      'Keeps the UI responsive and interactive during non-blocking async state updates',
      'Automatically compresses HTTP network payload sizes by 50%',
      'Suppresses all runtime JavaScript errors in production',
      'Stores component state in browser IndexedDB cache automatically',
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    question: 'What boundary constraint applies to React Server Component (RSC) props?',
    options: [
      'Props passed across the server-client boundary must be serializable',
      'Props must only be plain string literals or numbers',
      'Server components cannot accept props from parent layouts',
      'Props must be wrapped in JSON.stringify before invocation',
    ],
    correctIndex: 0,
  },
  {
    id: 5,
    question: 'What hook reads parent form pending status without prop drilling?',
    options: [
      'useFormStatus',
      'useParentForm',
      'useActionStatus',
      'useFormPending',
    ],
    correctIndex: 0,
  },
];

export const TestLessonRenderer: React.FC<Props> = ({ lesson }) => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = SAMPLE_QUIZ_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    return Math.round((correctCount / questions.length) * 100);
  };

  const scorePercent = submitted ? calculateScore() : 0;
  const passed = scorePercent >= 70;

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 space-y-5 font-sans text-xs max-w-4xl mx-auto shadow-2xs">
      {/* TEST HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-tight">{lesson.title}</h2>
          <span className="text-[11px] text-slate-500 font-normal">5 Questions • MCQ Assessment • 70% Passing Score</span>
        </div>
      </div>

      {!testStarted ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
          <div className="space-y-1">
            <span className="font-semibold text-sm text-slate-900 block">Ready to start this assessment?</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test your understanding of the concepts covered in this module. Minimum required passing score is 70%.
            </p>
          </div>
          <Button
            size="md"
            onClick={() => setTestStarted(true)}
            rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
            className="w-full sm:w-auto font-semibold px-6 min-h-[44px] bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
          >
            Start Assessment
          </Button>
        </div>
      ) : submitted ? (
        <div className={`p-6 rounded-2xl border text-center space-y-4 ${passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          {passed ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600 mx-auto" />
          )}
          <div className="space-y-1">
            <h3 className={`font-semibold text-base ${passed ? 'text-emerald-950' : 'text-red-950'}`}>
              {passed ? 'Assessment Passed!' : 'Assessment Retake Recommended'}
            </h3>
            <p className={`text-xs ${passed ? 'text-emerald-800' : 'text-red-800'}`}>
              You scored <span className="font-semibold">{scorePercent}%</span> on this knowledge check ({Math.round((scorePercent / 100) * questions.length)} of {questions.length} correct).
            </p>
          </div>
          {!passed && (
            <Button
              size="md"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4 shrink-0" />}
              className="font-semibold px-5 min-h-[44px] bg-slate-900 text-white rounded-xl cursor-pointer"
            >
              Try Again
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 border-b border-slate-100 pb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 text-xs sm:text-sm leading-relaxed">
            {currentQuestion.question}
          </div>

          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left font-medium text-xs transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-semibold ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-semibold mt-0.5 ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="font-semibold min-h-[40px] px-4 rounded-xl border-slate-200 text-slate-700 disabled:opacity-40"
            >
              Previous Question
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                size="sm"
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="font-semibold min-h-[40px] px-5 bg-blue-600 text-white rounded-xl shadow-xs disabled:opacity-40"
              >
                Next Question
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={Object.keys(selectedAnswers).length < questions.length}
                onClick={() => setSubmitted(true)}
                className="font-semibold min-h-[40px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Submit Assessment
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

