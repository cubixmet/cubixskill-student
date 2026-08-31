import React, { useState } from 'react';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  Globe,
  FileText,
  Clock,
  AlertCircle,
  ExternalLink,
  Pencil,
  Sparkles,
} from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { useAuthStore } from '../../../../stores/auth.store';
import { useLearningStore } from '../../../../stores/learning.store';
import { useAssignmentStore, type AssignmentSubmissionMethod } from '../../../../stores/assignment.store';
import {
  validateAssignmentSubmission,
  scrollToFirstAssignmentError,
  type AssignmentValidationErrors,
} from '../../utils/assignmentValidator';
import { formatFileSize } from '../../utils/resourceAccessResolver';
import { Button } from '../../../../components/ui/Button';
import { LessonStatusBadge } from '../../../../components/ui/LessonStatusBadge';

interface Props {
  lesson: CourseLesson;
}

export const AssignmentLessonRenderer: React.FC<Props> = ({ lesson }) => {
  const student = useAuthStore((state) => state.student);
  const markLessonComplete = useLearningStore((state) => state.markLessonComplete);

  const getSubmission = useAssignmentStore((state) => state.getSubmission);
  const submitAssignment = useAssignmentStore((state) => state.submitAssignment);

  const studentUuid = student?.uuid || 'std-production-1';
  const existingSubmission = getSubmission(studentUuid, lesson.id);

  // Dynamic backend assignment data
  const assignmentObj = (lesson as any)?.assignment || {};
  const instructions =
    assignmentObj.instructions ||
    (typeof lesson.content === 'string' && lesson.content.trim() ? lesson.content : '') ||
    lesson.description ||
    '';

  const dueDays = assignmentObj.due_days ?? assignmentObj.dueDays;
  const dueDate = assignmentObj.due_date || assignmentObj.dueDate;
  const maxMarks = assignmentObj.max_marks ?? assignmentObj.maxMarks ?? (lesson.content as any)?.maxScore ?? 100;

  const allowText = assignmentObj.allow_text_submission ?? assignmentObj.allowTextSubmission ?? true;
  const allowFile = assignmentObj.allow_file_submission ?? assignmentObj.allowFileSubmission ?? true;
  const allowUrl = assignmentObj.allow_url_submission ?? assignmentObj.allowUrlSubmission ?? false;

  const submissionMethods: AssignmentSubmissionMethod[] = [];
  if (allowUrl) submissionMethods.push('url');
  if (allowFile) submissionMethods.push('file');
  if (allowText) submissionMethods.push('text');
  if (submissionMethods.length === 0) submissionMethods.push('file');

  const requiresInstructorReview = true;
  const allowResubmission = true;

  let dueLabel = 'No due date';
  if (dueDays && typeof dueDays === 'number' && dueDays >= 1) {
    dueLabel = `Due in ${dueDays} days`;
  } else if (dueDate) {
    try {
      dueLabel = `Due: ${new Date(dueDate).toLocaleDateString()}`;
    } catch (e) {
      dueLabel = `Due: ${dueDate}`;
    }
  }

  const [url, setUrl] = useState(existingSubmission?.url || '');
  const [fileSelected, setFileSelected] = useState(!!existingSubmission?.fileName);
  const [fileName, setFileName] = useState(existingSubmission?.fileName || '');
  const [textResponse, setTextResponse] = useState(existingSubmission?.textResponse || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<AssignmentValidationErrors>({});
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateAssignmentSubmission(submissionMethods, {
      url,
      fileSelected: fileSelected || !!fileName,
      fileName,
      textResponse,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstAssignmentError(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      submitAssignment(
        {
          studentUuid,
          academyUuid: (lesson as any).courseUuid || (lesson as any).course_uuid || '',
          courseUuid: (lesson as any).courseUuid || (lesson as any).course_uuid || '',
          lessonUuid: lesson.id,
          assignmentUuid: assignmentObj.id || `asg-${lesson.id}`,
          url: submissionMethods.includes('url') ? url.trim() : undefined,
          fileName: submissionMethods.includes('file') ? fileName || 'solution_package.zip' : undefined,
          fileSize: submissionMethods.includes('file') ? 4194304 : undefined,
          textResponse: submissionMethods.includes('text') ? textResponse.trim() : undefined,
        },
        requiresInstructorReview
      );

      if (!requiresInstructorReview) {
        markLessonComplete(lesson.id);
      }

      setIsSubmitting(false);
      setIsEditing(false);
    }, 500);
  };

  const isSubmittedState = existingSubmission && !isEditing;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
      className="w-full rounded-2xl sm:rounded-3xl border p-4 sm:p-8 space-y-6 font-sans text-xs max-w-4xl mx-auto shadow-2xs box-border min-w-0"
    >
      {/* 1. ASSIGNMENT HEADER */}
      <div style={{ borderColor: 'var(--border)' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-start gap-3">
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              color: 'var(--brand-primary)',
            }}
            className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center shrink-0"
          >
            <FileCheck className="w-5 h-5 stroke-current text-current" />
          </div>
          <div className="space-y-0.5">
            <h2 style={{ color: 'var(--text-primary)' }} className="text-base sm:text-lg font-bold leading-snug break-words">
              {lesson.title}
            </h2>
            <span style={{ color: 'var(--text-secondary)' }} className="text-[11px] font-medium block">
              Assignment • {maxMarks} Marks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--brand-primary)',
            }}
            className="px-3 py-1 rounded-full text-[11px] font-semibold border"
          >
            {dueLabel}
          </span>
        </div>
      </div>

      {/* 2. INSTRUCTIONS CARD */}
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="p-4 rounded-2xl border space-y-2"
      >
        <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-xs uppercase tracking-wider">
          Assignment Instructions
        </h3>
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line">
          {instructions.trim() || 'No explicit instructions provided for this assignment.'}
        </p>
      </div>

      {/* 3. SUBMISSION STATUS OR FORM */}
      {isSubmittedState ? (
        <div className="space-y-4">
          {/* STATUS BADGE CONTAINER */}
          <div
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
            className="p-4 sm:p-5 rounded-2xl border space-y-3"
          >
            <div style={{ borderColor: 'var(--border)' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <span style={{ color: 'var(--text-primary)' }} className="font-bold text-xs uppercase tracking-wider">
                Submission Status
              </span>
              {existingSubmission.status === 'approved' ? (
                <LessonStatusBadge status="submitted" customLabel="Approved" />
              ) : existingSubmission.status === 'changes_requested' ? (
                <LessonStatusBadge status="changes_requested" />
              ) : (
                <LessonStatusBadge status="awaiting_review" />
              )}
            </div>

            {/* SUBMITTED VALUES */}
            <div className="space-y-2.5 pt-1">
              {existingSubmission.url && (
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe style={{ color: 'var(--text-muted)' }} className="w-4 h-4 shrink-0" />
                    <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-xs truncate">
                      {existingSubmission.url}
                    </span>
                  </div>
                  <a href={existingSubmission.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <button
                      type="button"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      className="h-8 px-3 text-[11px] font-semibold border rounded-lg inline-flex items-center gap-1 hover:bg-[var(--surface-hover)]"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </a>
                </div>
              )}

              {existingSubmission.fileName && (
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                  className="p-3 rounded-xl border flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText style={{ color: 'var(--brand-primary)' }} className="w-4 h-4 shrink-0" />
                    <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-xs truncate">
                      {existingSubmission.fileName}
                    </span>
                    {existingSubmission.fileSize && (
                      <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium">
                        • {formatFileSize(existingSubmission.fileSize)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {existingSubmission.textResponse && (
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                  className="p-3 rounded-xl border space-y-1"
                >
                  <span style={{ color: 'var(--text-muted)' }} className="font-bold text-[11px] uppercase">
                    Written Response
                  </span>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs whitespace-pre-line">
                    {existingSubmission.textResponse}
                  </p>
                </div>
              )}
            </div>

            {/* INSTRUCTOR FEEDBACK CARD */}
            {existingSubmission.feedback && (
              <div
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface-secondary))',
                  borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, var(--border))',
                }}
                className="p-4 rounded-xl border space-y-1 mt-3"
              >
                <span style={{ color: 'var(--brand-primary)' }} className="font-extrabold text-xs block">
                  Instructor Feedback
                </span>
                <p style={{ color: 'var(--text-primary)' }} className="text-xs leading-relaxed">
                  {existingSubmission.feedback}
                </p>
              </div>
            )}
          </div>

          {/* RESUBMIT CTA */}
          {allowResubmission && existingSubmission.status === 'changes_requested' && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--brand-primary-foreground, #FFFFFF)',
              }}
              className="w-full sm:w-auto font-semibold px-6 h-11 rounded-xl shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Pencil className="w-4 h-4 shrink-0" />
              <span>Edit &amp; Resubmit Assignment</span>
            </button>
          )}
        </div>
      ) : (
        /* SUBMISSION FORM */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-xs uppercase tracking-wider">
              Your Submission
            </h3>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">
              Provide your submission details below.
            </p>
          </div>

          {/* METHOD 1: SUBMISSION URL */}
          {submissionMethods.includes('url') && (
            <div className="space-y-1.5" id="assignment-url">
              <label htmlFor="submission-url-input" style={{ color: 'var(--text-primary)' }} className="block text-xs font-semibold">
                Submission URL <span style={{ color: 'var(--text-muted)' }} className="font-normal">(GitHub, live demo, or cloud file)</span>
              </label>
              <div className="relative">
                <div style={{ color: 'var(--text-muted)' }} className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  id="submission-url-input"
                  type="text"
                  placeholder="https://..."
                  aria-invalid={!!errors.url}
                  aria-describedby={errors.url ? 'url-error' : undefined}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: errors.url ? '#EF4444' : 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="w-full h-11 pl-9 pr-3.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>
              {errors.url && (
                <p id="url-error" className="text-xs text-red-500 font-semibold">
                  {errors.url}
                </p>
              )}
            </div>
          )}

          {/* METHOD 2: FILE UPLOAD */}
          {submissionMethods.includes('file') && (
            <div className="space-y-1.5" id="assignment-file">
              <label style={{ color: 'var(--text-primary)' }} className="block text-xs font-semibold">
                Upload Submission File
              </label>
              <div
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: errors.file ? '#EF4444' : 'var(--border)',
                }}
                className="p-5 border-2 border-dashed rounded-2xl text-center space-y-2.5 transition-colors"
              >
                <Upload style={{ color: 'var(--brand-primary)' }} className="w-7 h-7 mx-auto" />
                <div className="space-y-0.5 min-w-0">
                  <span style={{ color: 'var(--text-primary)' }} className="font-bold text-xs block truncate">
                    {fileSelected || fileName ? `Selected: ${fileName || 'project_solution.zip'}` : 'Choose project file (ZIP, PDF, DOCX)'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }} className="text-[11px] block">
                    Accepted formats: ZIP, PDF, DOCX • Max size: 25 MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileSelected(true);
                    setFileName('solution_submission_v1.zip');
                  }}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="font-semibold px-4 h-9 border rounded-lg text-xs cursor-pointer hover:bg-[var(--surface-hover)]"
                >
                  {fileSelected ? 'Replace File' : 'Select File'}
                </button>
              </div>
              {errors.file && (
                <p id="file-error" className="text-xs text-red-500 font-semibold">
                  {errors.file}
                </p>
              )}
            </div>
          )}

          {/* METHOD 3: TEXT RESPONSE */}
          {submissionMethods.includes('text') && (
            <div className="space-y-1.5" id="assignment-text">
              <label htmlFor="submission-text-input" style={{ color: 'var(--text-primary)' }} className="block text-xs font-semibold">
                Written Response
              </label>
              <textarea
                id="submission-text-input"
                rows={4}
                placeholder="Type your notes or response here..."
                aria-invalid={!!errors.text}
                aria-describedby={errors.text ? 'text-error' : undefined}
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: errors.text ? '#EF4444' : 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                className="w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              {errors.text && (
                <p id="text-error" className="text-xs text-red-500 font-semibold">
                  {errors.text}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground, #FFFFFF)',
            }}
            className="w-full sm:w-auto font-semibold px-8 h-11 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition-opacity hover:opacity-90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};
