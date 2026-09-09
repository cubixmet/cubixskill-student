import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Send,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useLearningStore } from '../../../stores/learning.store';
import { toast } from '../../../stores/toast.store';
import { useAcademyStore } from '../../../stores/academy.store';

interface AssignmentTask {
  id: string;
  title: string;
  module: string;
  dueDate: string;
  totalMarks: number;
  passingMarks: number;
  attemptsUsed: number;
  maxAttempts: number;
  allowedTypes: ('text' | 'file' | 'url' | 'pdf')[];
  status: 'Pending' | 'Submitted' | 'Under Review' | 'Graded' | 'Late';
  description: string;
}

const INITIAL_ASSIGNMENTS: AssignmentTask[] = [
  {
    id: 'asg-101',
    title: 'Build a Reactive State Store with Zustand',
    module: 'Module 2: Enterprise State Management & Persistence',
    dueDate: 'Aug 12, 2026',
    totalMarks: 100,
    passingMarks: 80,
    attemptsUsed: 1,
    maxAttempts: 3,
    allowedTypes: ['url', 'file', 'text'],
    status: 'Graded',
    description: 'Implement a persistent global store in TypeScript for managing student course enrollments, theme customization, and watch progress. Submit code repository link or zip archive.',
  },
  {
    id: 'asg-102',
    title: 'Optimistic UI Updates & Server Action Hydration',
    module: 'Module 3: Server Actions & State Hydration',
    dueDate: 'Aug 18, 2026',
    totalMarks: 100,
    passingMarks: 75,
    attemptsUsed: 0,
    maxAttempts: 2,
    allowedTypes: ['text', 'url', 'pdf'],
    status: 'Pending',
    description: 'Create an optimistic UI form component using useOptimistic and connect it to a mock Server Action with zero-latency rollback capability.',
  },
  {
    id: 'asg-103',
    title: 'Custom Design System Tokens Integration',
    module: 'Module 1: React 19 Foundations & Design System Architecture',
    dueDate: 'Aug 05, 2026',
    totalMarks: 50,
    passingMarks: 40,
    attemptsUsed: 1,
    maxAttempts: 1,
    allowedTypes: ['url', 'file'],
    status: 'Submitted',
    description: 'Design a reusable CSS variable token system enforcing light surface backgrounds while dynamically swapping primary accents.',
  },
];

export const AssignmentsPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
  }>();
  const navigate = useNavigate();

  const academies = useAcademyStore((state) => state.academies);
  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB', primaryHover: '#1D4ED8', primarySoft: '#EFF6FF' };

  const submissions = useLearningStore((state) => state.submissions);
  const addAssignmentSubmission = useLearningStore((state) => state.addAssignmentSubmission);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Under Review' | 'Graded' | 'Late'>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'marks' | 'status'>('dueDate');

  // Modal detail & submission states
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentTask | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'text' | 'url' | 'file'>('url');
  const [submissionInput, setSubmissionInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate header stats
  const pendingCount = INITIAL_ASSIGNMENTS.filter((a) => a.status === 'Pending').length;
  const submittedCount = INITIAL_ASSIGNMENTS.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length;
  const gradedCount = INITIAL_ASSIGNMENTS.filter((a) => a.status === 'Graded').length;

  // Filter & sort list
  const filteredAssignments = useMemo(() => {
    return INITIAL_ASSIGNMENTS.filter((asg) => {
      const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase()) || asg.module.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || asg.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'marks') return b.totalMarks - a.totalMarks;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [searchQuery, statusFilter, sortBy]);

  const handleOpenSubmissionModal = (asg: AssignmentTask) => {
    setSelectedAssignment(asg);
    setSubmissionInput('');
    setUploadProgress(null);
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionInput.trim() && selectedMethod !== 'file') return;

    setIsSubmitting(true);
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 50;
        if (prev >= 100) {
          clearInterval(timer);
          setIsSubmitting(false);
          addAssignmentSubmission({
            assignmentTitle: selectedAssignment?.title || 'Assignment Task',
            submissionType: selectedMethod === 'file' ? 'file' : 'text',
            content: submissionInput || 'uploaded_project_file.zip',
            maxMarks: selectedAssignment?.totalMarks || 100,
          });
          setSelectedAssignment(null);
          toast.success('Assignment submitted successfully!');
          return 100;
        }
        return prev + 40;
      });
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto hide-scrollbar pb-12">

      {/* 1. PAGE HEADER & STATS SUMMARY */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Assignments</h1>
            <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
              Complete project assignments, submit code repositories, and track instructor grades.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-base font-bold text-amber-700 block">{pendingCount}</span>
              <span className="text-[9px] font-semibold text-amber-600 uppercase">Pending</span>
            </div>
            <div className="px-3 py-2 bg-blue-50/80 border border-slate-200 rounded-xl text-center">
              <span className="text-base font-bold theme-text block">{submittedCount}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase">Submitted</span>
            </div>
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-base font-bold text-emerald-700 block">{gradedCount}</span>
              <span className="text-[9px] font-semibold text-emerald-600 uppercase">Graded</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. FILTER & CONTROLS TOOLBAR */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search assignments by title or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[44px] pl-9 pr-8 rounded-[10px] border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 theme-focus"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-[44px] px-3.5 pl-8 rounded-[10px] border border-slate-200 bg-white font-semibold text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="marks">Sort by Highest Marks</option>
                <option value="status">Sort by Status</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* STATUS FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['All', 'Pending', 'Submitted', 'Under Review', 'Graded', 'Late'] as const).map((tab) => {
            const isSelected = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected ? 'theme-soft theme-text theme-border border shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. ASSIGNMENT CARDS GRID */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((asg) => {
            const matchingSub = submissions.find((s) => s.assignmentTitle === asg.title);

            return (
              <Card
                key={asg.id}
                padding="md"
                className="bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-4 hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{asg.module}</span>
                    <h3 className="font-semibold text-base text-slate-900 leading-snug mt-0.5">{asg.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        asg.status === 'Graded'
                          ? 'success'
                          : asg.status === 'Submitted'
                          ? 'info'
                          : asg.status === 'Pending'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {matchingSub ? matchingSub.status : asg.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-slate-600 font-normal leading-relaxed text-xs">{asg.description}</p>

                {/* METRICS & SUBMISSION TYPES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Due Date</span>
                    <span className="text-slate-800 font-semibold">{asg.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Marks</span>
                    <span className="text-slate-800 font-semibold">{asg.totalMarks} Marks</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Attempts</span>
                    <span className="text-slate-800 font-semibold">{asg.attemptsUsed}/{asg.maxAttempts}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Allowed Format</span>
                    <span className="text-slate-800 font-semibold uppercase">{asg.allowedTypes.join(', ')}</span>
                  </div>
                </div>

                {/* INSTRUCTOR FEEDBACK SPOTLIGHT IF GRADED */}
                {matchingSub?.feedback && (
                  <div className="p-3 theme-soft border border-slate-200 rounded-xl space-y-1">
                    <span className="font-semibold text-xs theme-text block">Instructor Feedback</span>
                    <p className="text-slate-700 italic font-normal">"{matchingSub.feedback}"</p>
                  </div>
                )}

                {/* CARD BOTTOM ACTIONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-normal">
                    Passing Grade: <strong className="font-semibold text-slate-700">{asg.passingMarks} Marks</strong>
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSubmissionModal(asg)}
                      className="w-full sm:w-auto font-semibold"
                    >
                      {matchingSub ? 'View / Resubmit' : 'Open Details'}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenSubmissionModal(asg)}
                      className="w-full sm:w-auto font-semibold theme-bg"
                    >
                      {matchingSub ? 'Resubmit Task' : 'Submit Assignment'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* 4. EMPTY STATE */
        <Card padding="lg" className="bg-white border border-slate-200/80 text-center py-12 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No assignments match your filter</h3>
          <p className="text-xs text-slate-500 font-normal max-w-sm mx-auto">
            Try adjusting your search keywords or switching back to view all assignments.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="font-semibold"
            >
              Clear Filters
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
              className="font-semibold theme-bg"
            >
              Return to My Course
            </Button>
          </div>
        </Card>
      )}

      {/* 5. SUBMISSION MODAL */}
      <Modal
        isOpen={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title || 'Assignment Task'}
        subtitle={selectedAssignment?.module}
        maxWidth="lg"
      >
        {selectedAssignment && (
          <form onSubmit={handleSimulateSubmit} className="space-y-4">
            <div className="space-y-2">
              <span className="font-semibold text-xs text-slate-900 block">Task Instructions</span>
              <p className="text-xs text-slate-600 font-normal leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                {selectedAssignment.description}
              </p>
            </div>

            {/* SUBMISSION METHOD CARDS */}
            <div className="space-y-2">
              <span className="font-semibold text-xs text-slate-900 block">Select Submission Method</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('url')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    selectedMethod === 'url' ? 'theme-border theme-soft theme-text shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mx-auto mb-1" />
                  <span>GitHub / URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('file')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    selectedMethod === 'file' ? 'theme-border theme-soft theme-text shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Upload className="w-4 h-4 mx-auto mb-1" />
                  <span>File Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('text')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    selectedMethod === 'text' ? 'theme-border theme-soft theme-text shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  <span>Text Answer</span>
                </button>
              </div>
            </div>

            {/* INPUT INPUT OR FILE DROPZONE */}
            {selectedMethod === 'url' && (
              <div className="space-y-1">
                <label className="block font-medium text-xs text-slate-900">Project Repository / Demo Link *</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project-repo"
                  value={submissionInput}
                  onChange={(e) => setSubmissionInput(e.target.value)}
                  className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 theme-focus"
                  required
                />
              </div>
            )}

            {selectedMethod === 'text' && (
              <div className="space-y-1">
                <label className="block font-medium text-xs text-slate-900">Detailed Text Answer *</label>
                <textarea
                  rows={4}
                  placeholder="Provide your solution breakdown or code inline..."
                  value={submissionInput}
                  onChange={(e) => setSubmissionInput(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 theme-focus"
                  required
                />
              </div>
            )}

            {selectedMethod === 'file' && (
              <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <span className="font-semibold text-xs text-slate-900 block">Click to upload project ZIP or PDF document</span>
                <span className="text-[10px] text-slate-400 font-mono">Maximum file size: 25 MB</span>
              </div>
            )}

            {/* UPLOAD PROGRESS BAR */}
            {uploadProgress !== null && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Uploading submission...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300 theme-bg" style={{ width: `${uploadProgress}%`, backgroundColor: theme.primaryColor }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedAssignment(null)} className="font-semibold">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold theme-bg" leftIcon={<Send className="w-3.5 h-3.5" />}>
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
