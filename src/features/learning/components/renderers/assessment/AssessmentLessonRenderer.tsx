import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, ArrowRight, XCircle, RotateCcw, HelpCircle, Loader2 } from 'lucide-react';
import type { CourseLesson } from '../../../../../stores/course.store';
import { RichTextRenderer } from '../../../../../components/ui/RichTextRenderer';
import {
  AssessmentQuestionRenderer,
  normalizeQuestionType,
  type StudentQuestion,
} from './AssessmentQuestionRenderer';

interface Props {
  lesson: CourseLesson;
  onMarkComplete?: () => Promise<void> | void;
}

export const AssessmentLessonRenderer: React.FC<Props> = ({ lesson, onMarkComplete }) => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset quiz state when switching lessons
  useEffect(() => {
    setTestStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setIsSubmitting(false);
  }, [lesson.id, (lesson as any).uuid]);

  const rawLesson = lesson as any;
  const quizObj = rawLesson.quiz || rawLesson.content?.quiz || rawLesson.content || {};

  const rawQuestions: any[] = quizObj?.questions || rawLesson.questions || [];
  const passingScore = quizObj?.passing_score ?? quizObj?.passingScore ?? 70;
  const timeLimitMinutes = quizObj?.time_limit_minutes ?? quizObj?.timeLimitMinutes;
  const instructions = quizObj?.instructions || '';

  // Normalize backend questions into standard Student internal format
  const questions: StudentQuestion[] = rawQuestions.map((q: any, idx: number) => {
    const rawOptions = q.options || q.choices || [];
    const normalizedOpts = Array.isArray(rawOptions)
      ? rawOptions.map((opt: any, oIdx: number) => ({
          id: String(opt.id || `opt-${oIdx}`),
          text: typeof opt === 'string' ? opt : opt.option_text || opt.text || opt.label || '',
        }))
      : [];

    const rawTypeStr = String(q.question_type || q.type || 'single_choice');

    return {
      id: String(q.id || `q-${idx}`),
      type: normalizeQuestionType(rawTypeStr),
      rawType: rawTypeStr,
      text: q.question_text || q.questionText || q.question || q.title || `Question ${idx + 1}`,
      explanation: q.explanation || '',
      points: q.points || 1,
      required: q.required ?? true,
      options: normalizedOpts,
    };
  });

  if (questions.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        className="w-full rounded-2xl border p-6 sm:p-8 text-center space-y-3 font-sans text-xs max-w-4xl mx-auto box-border"
      >
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
            color: 'var(--brand-primary)',
          }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
        >
          <HelpCircle className="w-6 h-6 stroke-current" />
        </div>
        <h4 style={{ color: 'var(--text-primary)' }} className="font-bold text-base">
          Quiz Not Ready
        </h4>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs max-w-md mx-auto leading-relaxed">
          This assessment does not contain any questions yet.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (newValue: any) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: newValue,
    }));
  };

  const handleSubmitAssessment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      setSubmitted(true);
      if (onMarkComplete) {
        await onMarkComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
      className="w-full rounded-2xl border p-4 sm:p-7 space-y-5 font-sans text-xs max-w-4xl mx-auto shadow-2xs box-border"
    >
      {/* ASSESSMENT HEADER */}
      <div style={{ borderColor: 'var(--border)' }} className="flex items-center gap-3 border-b pb-4">
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
            color: 'var(--brand-primary)',
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        >
          <ClipboardCheck className="w-5 h-5 stroke-current" />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-primary)' }} className="text-base font-semibold leading-tight">
            {lesson.title}
          </h2>
          <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-normal">
            {questions.length} Question{questions.length !== 1 ? 's' : ''} • Assessment • {passingScore}% Passing Score
            {timeLimitMinutes ? ` • ${timeLimitMinutes} Mins` : ''}
          </span>
        </div>
      </div>

      {!testStarted ? (
        <div
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
          className="p-6 rounded-2xl border text-center space-y-4 max-w-lg mx-auto"
        >
          <div className="space-y-1.5">
            <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm block">
              Ready to start this assessment?
            </span>
            {instructions ? (
              <div style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
                <RichTextRenderer html={instructions} />
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
                Test your understanding of the concepts covered in this unit. Required passing score is {passingScore}%.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTestStarted(true)}
            style={{
              backgroundColor: 'var(--brand-primary)',
              borderColor: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground, #FFFFFF)',
            }}
            className="w-full sm:w-auto font-semibold px-6 min-h-[44px] border rounded-xl inline-flex items-center justify-center gap-1.5 shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
          >
            <span>Start Assessment</span>
            <ArrowRight className="w-4 h-4 shrink-0 stroke-current text-current" />
          </button>
        </div>
      ) : submitted ? (
        <div className="p-6 rounded-2xl border text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-base">Assessment Submitted</h3>
            <p className="text-xs font-medium">
              Your assessment responses have been recorded and processed.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="font-semibold px-5 min-h-[44px] border rounded-xl inline-flex items-center gap-1.5 cursor-pointer mx-auto hover:bg-[var(--surface-hover)]"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Retake Assessment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 w-full min-w-0">
          <div style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }} className="flex items-center justify-between text-xs font-medium border-b pb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span style={{ color: 'var(--brand-primary)' }}>Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>

          {/* Progress Bar Track */}
          <div style={{ backgroundColor: 'var(--surface-secondary)' }} className="w-full h-1.5 rounded-full overflow-hidden">
            <div
              style={{
                backgroundColor: 'var(--brand-primary)',
                width: `${Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%`,
              }}
              className="h-full transition-all duration-300"
            />
          </div>

          {/* Question Text */}
          <div
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-4 rounded-xl border font-semibold text-xs sm:text-sm leading-relaxed"
          >
            {currentQuestion.text.includes('<') && currentQuestion.text.includes('>') ? (
              <RichTextRenderer html={currentQuestion.text} />
            ) : (
              <span>{currentQuestion.text}</span>
            )}
          </div>

          {/* Question Answer Control Dispatcher */}
          <AssessmentQuestionRenderer
            question={currentQuestion}
            value={selectedAnswers[currentQuestionIndex]}
            onChange={handleAnswerChange}
            disabled={isSubmitting}
          />

          {/* Question Navigation */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={currentQuestionIndex === 0 || isSubmitting}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
              className="font-semibold min-h-[40px] px-4 rounded-xl border disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[var(--surface-hover)]"
            >
              Previous Question
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                disabled={selectedAnswers[currentQuestionIndex] === undefined || isSubmitting}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground, #FFFFFF)',
                }}
                className="font-semibold min-h-[40px] px-5 border rounded-xl shadow-xs disabled:opacity-40 cursor-pointer hover:opacity-90"
              >
                Next Question
              </button>
            ) : (
              <button
                type="button"
                disabled={Object.keys(selectedAnswers).length < questions.length || isSubmitting}
                onClick={handleSubmitAssessment}
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground, #FFFFFF)',
                }}
                className="font-semibold min-h-[40px] px-6 border rounded-xl shadow-xs disabled:opacity-40 cursor-pointer hover:opacity-90 inline-flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Assessment</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
