import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  BookOpen,
  UserCheck,
  FileCheck2,
} from 'lucide-react';
import { studentPortalService } from '../../../services/studentPortal.service';

export interface PublicVerificationData {
  valid: boolean;
  is_preview?: boolean;
  certificate_number: string;
  verification_code: string;
  student_name: string;
  course_name: string;
  academy_name: string;
  issued_at: string;
  completed_at: string;
  status: string;
  revoked_at?: string | null;
  revocation_reason?: string | null;
}

export const PublicCertificateVerifyPage: React.FC = () => {
  const { verificationCode } = useParams<{ verificationCode: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [certData, setCertData] = useState<PublicVerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVerification = async () => {
      if (!verificationCode) {
        setIsLoading(false);
        setError('No verification code provided.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await studentPortalService.verifyPublicCertificate(verificationCode);
        if (isMounted) {
          if (data && data.valid !== false) {
            setCertData(data);
          } else {
            setError('Certificate Could Not Be Verified');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Certificate Could Not Be Verified');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVerification();
    return () => {
      isMounted = false;
    };
  }, [verificationCode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl space-y-6">
        {/* BRAND / LOGO HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-xl tracking-tight">
            <Award className="w-7 h-7 text-blue-500" />
            <span>CubixSkill Verification</span>
          </div>
          <p className="text-xs text-slate-400">Official Certificate Public Verification Portal</p>
        </div>

        {/* CARD CONTAINER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {isLoading ? (
            /* LOADING STATE */
            <div className="py-12 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-800 rounded mx-auto" />
                <div className="h-4 w-64 bg-slate-800/60 rounded mx-auto" />
              </div>
            </div>
          ) : error || !certData ? (
            /* INVALID / NOT FOUND STATE */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-slate-100">Certificate Not Found</h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Unable to verify this certificate code. The code may be invalid, revoked, or mistyped.
                </p>
              </div>
              <div className="pt-4">
                <code className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg font-mono">
                  {verificationCode}
                </code>
              </div>
            </div>
          ) : (
            /* VALID CERTIFICATE STATE */
            <div className="space-y-6">
              {/* SUCCESS / PREVIEW BADGE */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                      certData.is_preview
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      {certData.is_preview ? 'Certificate Template Preview' : 'Certificate Verified'}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        certData.is_preview ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {certData.is_preview
                        ? 'This QR is for template preview only.'
                        : 'Authenticated & Valid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="space-y-4 text-sm">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Student Name</span>
                  </div>
                  <p className="text-base font-bold text-slate-100">{certData.student_name}</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Course</span>
                  </div>
                  <p className="text-base font-bold text-slate-100">{certData.course_name}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Academy</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{certData.academy_name}</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Issue Date</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">
                      {certData.issued_at
                        ? new Date(certData.issued_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Certificate Number</span>
                  </div>
                  <code className="text-xs font-mono font-bold text-blue-400">
                    {certData.certificate_number}
                  </code>
                </div>
              </div>

              {/* FOOTER VERIFICATION NOTE */}
              <div className="border-t border-slate-800 pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Verification Code: <span className="font-mono text-slate-400">{certData.verification_code}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BACK FOOTER */}
        <div className="text-center">
          <Link
            to="/student/academies"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Powered by CubixSkill Platform
          </Link>
        </div>
      </div>
    </div>
  );
};
