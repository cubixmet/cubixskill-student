import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const StudentRouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { academyUuid, courseUuid } = useParams<{ academyUuid?: string; courseUuid?: string }>();

  let errorMessage = 'An unexpected error occurred while loading this page.';
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || `${error.status} ${error.data}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  if (import.meta.env.DEV) {
    console.error('[Student Portal Route Error]', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (isRouteErrorResponse(error)) {
      console.error('[Student Portal Route Error Response]', {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 text-center font-sans text-xs">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 mx-auto">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
          <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">
            Student Portal Notice
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Something went wrong</h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            We couldn't render this course screen properly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto font-semibold justify-center min-h-[42px]"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Try Again
          </Button>

          {academyUuid && courseUuid ? (
            <Button
              size="sm"
              onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
              className="w-full sm:w-auto font-semibold justify-center min-h-[42px] bg-blue-600 hover:bg-blue-700 text-white"
              leftIcon={<BookOpen className="w-4 h-4" />}
            >
              Back to Course
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate('/student/academies')}
              className="w-full sm:w-auto font-semibold justify-center min-h-[42px] bg-blue-600 hover:bg-blue-700 text-white"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go to Academies
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
