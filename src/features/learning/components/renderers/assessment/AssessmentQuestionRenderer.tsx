import React from 'react';
import { RichTextRenderer } from '../../../../../components/ui/RichTextRenderer';
import { AlertCircle } from 'lucide-react';

export interface StudentQuestionOption {
  id: string;
  text: string;
}

export type StudentQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'fill_blank'
  | 'unsupported';

export interface StudentQuestion {
  id: string;
  type: StudentQuestionType;
  rawType: string;
  text: string;
  explanation?: string;
  points?: number;
  required?: boolean;
  options: StudentQuestionOption[];
}

export function normalizeQuestionType(typeStr?: string): StudentQuestionType {
  const t = String(typeStr || '').trim().toLowerCase();
  if (t === 'single_choice' || t === 'mcq' || t === 'single_select' || t === 'single') return 'single_choice';
  if (t === 'multiple_choice' || t === 'multi_select' || t === 'checkbox' || t === 'multiple') return 'multiple_choice';
  if (t === 'true_false' || t === 'tf' || t === 'boolean') return 'true_false';
  if (t === 'short_answer' || t === 'short') return 'short_answer';
  if (t === 'long_answer' || t === 'essay' || t === 'descriptive' || t === 'long') return 'long_answer';
  if (t === 'fill_blank' || t === 'fill_in_the_blank' || t === 'blank') return 'fill_blank';
  return 'unsupported';
}

interface QuestionRendererProps {
  question: StudentQuestion;
  value: any;
  onChange: (newValue: any) => void;
  disabled?: boolean;
}

// 1. Single Choice Question (Radio behavior, uses option IDs)
export const SingleChoiceQuestion: React.FC<QuestionRendererProps> = ({ question, value, onChange, disabled }) => {
  return (
    <div className="space-y-2.5 w-full min-w-0">
      {question.options.map((option, idx) => {
        const isSelected = String(value) === String(option.id);

        return (
          <label
            key={option.id || idx}
            style={
              isSelected
                ? {
                    backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                    borderColor: 'var(--brand-primary)',
                    color: 'var(--text-primary)',
                  }
                : {
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }
            }
            className={`w-full p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-start gap-3 select-none ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--brand-primary)]'
            }`}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              disabled={disabled}
              checked={isSelected}
              onChange={() => onChange(option.id)}
              style={{ accentColor: 'var(--brand-primary)' }}
              className="sr-only"
            />
            <span
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--brand-primary)',
                      borderColor: 'var(--brand-primary)',
                      color: 'var(--brand-primary-foreground, #FFFFFF)',
                    }
                  : {
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }
              }
              className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-semibold mt-0.5"
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <div className="flex-1 min-w-0 leading-relaxed break-words">
              {option.text.includes('<') && option.text.includes('>') ? (
                <RichTextRenderer html={option.text} />
              ) : (
                <span>{option.text}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

// 2. Multiple Choice Question (Checkbox behavior, uses array of option IDs)
export const MultipleChoiceQuestion: React.FC<QuestionRendererProps> = ({ question, value, onChange, disabled }) => {
  const selectedList: string[] = Array.isArray(value) ? value : [];

  const handleToggle = (optId: string) => {
    if (selectedList.includes(optId)) {
      onChange(selectedList.filter((id) => id !== optId));
    } else {
      onChange([...selectedList, optId]);
    }
  };

  return (
    <div className="space-y-2.5 w-full min-w-0">
      <p style={{ color: 'var(--text-muted)' }} className="text-[11px] font-semibold mb-1">
        Select all that apply:
      </p>
      {question.options.map((option, idx) => {
        const isSelected = selectedList.includes(option.id);

        return (
          <label
            key={option.id || idx}
            style={
              isSelected
                ? {
                    backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                    borderColor: 'var(--brand-primary)',
                    color: 'var(--text-primary)',
                  }
                : {
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }
            }
            className={`w-full p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-start gap-3 select-none ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--brand-primary)]'
            }`}
          >
            <input
              type="checkbox"
              disabled={disabled}
              checked={isSelected}
              onChange={() => handleToggle(option.id)}
              style={{ accentColor: 'var(--brand-primary)' }}
              className="w-4 h-4 rounded mt-0.5 shrink-0 cursor-pointer"
            />
            <div className="flex-1 min-w-0 leading-relaxed break-words">
              {option.text.includes('<') && option.text.includes('>') ? (
                <RichTextRenderer html={option.text} />
              ) : (
                <span>{option.text}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

// 3. True / False Question
export const TrueFalseQuestion: React.FC<QuestionRendererProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      {['True', 'False'].map((val) => {
        const isSelected = String(value).toLowerCase() === val.toLowerCase();

        return (
          <button
            key={val}
            type="button"
            disabled={disabled}
            onClick={() => onChange(val)}
            style={
              isSelected
                ? {
                    backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                    borderColor: 'var(--brand-primary)',
                    color: 'var(--brand-primary)',
                  }
                : {
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }
            }
            className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--brand-primary)]'
            }`}
          >
            <span>{val}</span>
          </button>
        );
      })}
    </div>
  );
};

// 4. Short Answer Question
export const ShortAnswerQuestion: React.FC<QuestionRendererProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-1.5 w-full min-w-0">
      <input
        type="text"
        disabled={disabled}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your short answer here..."
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
        className="w-full h-11 px-3.5 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
      />
    </div>
  );
};

// 5. Long Answer / Descriptive Question (Textarea)
export const LongAnswerQuestion: React.FC<QuestionRendererProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-1.5 w-full min-w-0">
      <textarea
        rows={4}
        disabled={disabled}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your response here..."
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
        className="w-full p-3.5 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 leading-relaxed"
      />
    </div>
  );
};

// 6. Fill in the Blank Question
export const FillBlankQuestion: React.FC<QuestionRendererProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-1.5 w-full min-w-0">
      <input
        type="text"
        disabled={disabled}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Fill in the blank..."
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
        className="w-full h-11 px-3.5 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
      />
    </div>
  );
};

// 7. Unsupported Question Type Controlled Fallback
export const UnsupportedQuestion: React.FC<{ rawType?: string }> = ({ rawType }) => {
  if (import.meta.env.DEV) {
    console.warn(`[Assessment] Unsupported question type encountered: "${rawType}"`);
  }

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>Unsupported question type ({rawType || 'unknown'}). Answer control unavailable.</span>
    </div>
  );
};

// Canonical Question Dispatcher
export const AssessmentQuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  const { question } = props;

  switch (question.type) {
    case 'single_choice':
      return <SingleChoiceQuestion {...props} />;
    case 'multiple_choice':
      return <MultipleChoiceQuestion {...props} />;
    case 'true_false':
      return <TrueFalseQuestion {...props} />;
    case 'short_answer':
      return <ShortAnswerQuestion {...props} />;
    case 'long_answer':
      return <LongAnswerQuestion {...props} />;
    case 'fill_blank':
      return <FillBlankQuestion {...props} />;
    default:
      return <UnsupportedQuestion rawType={question.rawType} />;
  }
};
