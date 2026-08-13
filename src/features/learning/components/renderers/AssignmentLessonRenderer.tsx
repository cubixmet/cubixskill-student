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

  // Configured submission methods (URL, File, Text)
  const submissionMethods: AssignmentSubmissionMethod[] = ['url', 'file', 'text'];
  const requiresInstructorReview = true;
  const allowResubmission = true;
  const dueAt = 'Aug 20, 2026';

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
          academyUuid: '550e8400-e29b-41d4-a716-446655440000',
          courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
          lessonUuid: lesson.id,
          assignmentUuid: `asg-${lesson.id}`,
          url: submissionMethods.includes('url') ? url.trim() : undefined,
          fileName: submissionMethods.includes('file') ? fileName || 'solution_package.zip' : undefined,
          fileUrl: submissionMethods.includes('file')
            ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            : undefined,
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
    <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 space-y-6 font-sans text-xs max-w-4xl mx-auto shadow-2xs">
      {/* 1. ASSIGNMENT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">{lesson.title}</h2>
            <span className="text-[11px] text-slate-500 font-medium block">Practical Project Assignment</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Due: {dueAt}
          </span>
        </div>
      </div>

      {/* 2. INSTRUCTIONS CARD */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Project Deliverables &amp; Instructions</h3>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line">
          {lesson.description ||
            'Build a full-stack reactive state management module with custom SSR hydration hooks. Prepare your project solution and submit the required URL or file package below.'}
        </p>
      </div>

      {/* 3. SUBMISSION STATUS OR FORM */}
      {isSubmittedState ? (
        <div className="space-y-4">
          {/* STATUS BADGE CONTAINER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Submission Status</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-800 text-xs truncate">{existingSubmission.url}</span>
                  </div>
                  <a href={existingSubmission.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />} className="h-8 text-[11px]">
                      Open Submission Link
                    </Button>
                  </a>
                </div>
              )}

              {existingSubmission.fileName && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800 text-xs truncate">{existingSubmission.fileName}</span>
                    {existingSubmission.fileSize && (
                      <span className="text-[11px] text-slate-400 font-medium">• {formatFileSize(existingSubmission.fileSize)}</span>
                    )}
                  </div>
                </div>
              )}

              {existingSubmission.textResponse && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-[11px] text-slate-400 uppercase">Written Response</span>
                  <p className="text-slate-700 text-xs whitespace-pre-line">{existingSubmission.textResponse}</p>
                </div>
              )}
            </div>

            {/* INSTRUCTOR FEEDBACK CARD */}
            {existingSubmission.feedback && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1 mt-3">
                <span className="font-extrabold text-xs text-amber-950 block">Instructor Feedback</span>
                <p className="text-xs text-amber-900 leading-relaxed">{existingSubmission.feedback}</p>
              </div>
            )}
          </div>

          {/* RESUBMIT CTA */}
          {allowResubmission && existingSubmission.status === 'changes_requested' && (
            <Button
              size="md"
              onClick={() => setIsEditing(true)}
              leftIcon={<Pencil className="w-4 h-4 shrink-0" />}
              className="w-full sm:w-auto font-semibold px-6 min-h-[44px] bg-blue-600 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Edit &amp; Resubmit Assignment
            </Button>
          )}
        </div>
      ) : (
        /* SUBMISSION FORM */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Your Project Submission</h3>
            <p className="text-xs text-slate-500">Provide the required submission details below.</p>
          </div>

          {/* METHOD 1: PROVIDER-NEUTRAL SUBMISSION URL */}
          {submissionMethods.includes('url') && (
            <div className="space-y-1.5" id="assignment-url">
              <label htmlFor="submission-url-input" className="block text-xs font-semibold text-slate-800">
                Submission URL <span className="text-slate-400 font-normal">(GitHub, GitLab, live deployment, or cloud link)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                  className={`w-full h-11 pl-9 pr-3.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.url ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.url && (
                <p id="url-error" className="text-xs text-red-600 font-semibold">
                  {errors.url}
                </p>
              )}
            </div>
          )}

          {/* METHOD 2: FILE UPLOAD */}
          {submissionMethods.includes('file') && (
            <div className="space-y-1.5" id="assignment-file">
              <label className="block text-xs font-semibold text-slate-800">Upload Project File</label>
              <div
                className={`p-5 border-2 border-dashed rounded-2xl text-center space-y-2.5 transition-colors ${
                  errors.file ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-slate-900 text-xs block truncate">
                    {fileSelected || fileName ? `Selected: ${fileName || 'project_solution.zip'}` : 'Choose project ZIP, PDF, or document'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">Accepted formats: ZIP, PDF, DOCX • Max size: 25 MB</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFileSelected(true);
                    setFileName('solution_submission_v1.zip');
                  }}
                  className="font-semibold px-4 min-h-[38px] border-slate-300 text-slate-700 bg-white cursor-pointer"
                >
                  {fileSelected ? 'Replace File' : 'Select File'}
                </Button>
              </div>
              {errors.file && (
                <p id="file-error" className="text-xs text-red-600 font-semibold">
                  {errors.file}
                </p>
              )}
            </div>
          )}

          {/* METHOD 3: TEXT RESPONSE */}
          {submissionMethods.includes('text') && (
            <div className="space-y-1.5" id="assignment-text">
              <label htmlFor="submission-text-input" className="block text-xs font-semibold text-slate-800">
                Your Written Response
              </label>
              <textarea
                id="submission-text-input"
                rows={4}
                placeholder="Type your notes or response here..."
                aria-invalid={!!errors.text}
                aria-describedby={errors.text ? 'text-error' : undefined}
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.text ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.text && (
                <p id="text-error" className="text-xs text-red-600 font-semibold">
                  {errors.text}
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto font-semibold px-8 min-h-[48px] bg-blue-600 text-white rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </form>
      )}
    </div>
  );
};
