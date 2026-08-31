import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

interface FeatureDisabledStateProps {
  featureName?: string;
  onBack?: () => void;
}

export const FeatureDisabledState: React.FC<FeatureDisabledStateProps> = ({
  featureName = 'This feature',
  onBack,
}) => {
  const navigate = useNavigate();
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (academyUuid && courseUuid) {
      navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Feature Not Available
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {featureName} is not enabled for this course.
          </p>
        </div>

        <div className="pt-2">
          <Button
            size="lg"
            onClick={handleBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="font-semibold px-6 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs w-full justify-center"
          >
            Back to Course Overview
          </Button>
        </div>
      </div>
    </div>
  );
};
