import React from 'react';
import { Award, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  certificateStatus?: 'ISSUED' | 'PROFILE_INCOMPLETE' | 'PENDING_CREDIT' | 'NO_TEMPLATE' | 'FEATURE_DISABLED' | string;
  missingFields?: Array<{ key: string; label: string }>;
  certificate?: {
    id: string;
    certificate_number: string;
    verification_code?: string;
    download_url?: string;
    view_url?: string;
  } | null;
  onViewCertificate?: () => void;
  onDownloadCertificate?: () => void;
  onCompleteProfile?: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  certificateStatus = 'ISSUED',
  missingFields = [],
  certificate,
  onViewCertificate,
  onDownloadCertificate,
  onCompleteProfile,
}) => {
  if (!isOpen) return null;

  const isIssued = certificateStatus === 'ISSUED' || Boolean(certificate?.id);
  const isProfileIncomplete = certificateStatus === 'PROFILE_INCOMPLETE';
  const isPendingCredit = certificateStatus === 'PENDING_CREDIT';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center space-y-6 py-2 px-1 font-sans">
        {/* Animated Celebration Icon Header */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center animate-pulse">
            <Award className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-bold shadow-sm">
            ★
          </div>
        </div>

        {/* Title & Course Name */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-wider">
            Course Completed!
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Congratulations!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            You have successfully completed <span className="font-bold text-slate-900 dark:text-white">“{courseTitle}”</span>.
          </p>
        </div>

        {/* State specific card */}
        {isIssued && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2 text-left">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Your Official Certificate is Ready</span>
            </div>
            {certificate?.certificate_number && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                Certificate #: {certificate.certificate_number}
              </p>
            )}
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You can view your verified credential or download a print-ready high resolution PDF.
            </p>
          </div>
        )}

        {isProfileIncomplete && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3 text-left">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>One Final Step Required</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Your certificate requires details that are currently missing from your student profile:
            </p>
            <ul className="text-xs font-medium text-amber-950 dark:text-amber-200 space-y-1 list-disc list-inside bg-amber-100/60 dark:bg-amber-900/40 p-2.5 rounded-xl border border-amber-200/60">
              {missingFields.length > 0 ? (
                missingFields.map((mf) => (
                  <li key={mf.key}>{mf.label}</li>
                ))
              ) : (
                <li>Personal details required by certificate template</li>
              )}
            </ul>
          </div>
        )}

        {isPendingCredit && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-2 text-left">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Certificate Processing</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your course is complete. Your certificate is currently being prepared. Please contact your academy if it remains unavailable.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isIssued && (
            <>
              {onViewCertificate && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={onViewCertificate}
                  className="w-full sm:w-auto font-semibold min-h-[44px]"
                >
                  View Certificate
                </Button>
              )}
              {onDownloadCertificate && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={onDownloadCertificate}
                  leftIcon={<Award className="w-4 h-4" />}
                  className="w-full sm:w-auto font-semibold min-h-[44px]"
                >
                  Download Certificate
                </Button>
              )}
            </>
          )}

          {isProfileIncomplete && onCompleteProfile && (
            <Button
              variant="primary"
              size="md"
              onClick={onCompleteProfile}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto font-semibold min-h-[44px]"
            >
              Complete Personal Details
            </Button>
          )}

          {(!isIssued && !isProfileIncomplete) && (
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto font-semibold min-h-[44px]"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
