import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
  FileText,
  Sparkles,
  Lock,
} from 'lucide-react';
import { CourseTabs } from '../../learning/components/CourseTabs';
import { studentPortalService, stringifyApiErrorValue } from '../../../services/studentPortal.service';
import type { CertificateProfileField } from '../../../services/studentPortal.service';
import { toast } from '../../../stores/toast.store';

import { PdfJsViewer } from '../components/PdfJsViewer';

export const CertificatesPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
  }>();

  // Overview & Enrollment State
  const [overview, setOverview] = useState<any>(null);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [issuedCertificate, setIssuedCertificate] = useState<any>(null);

  // Status & Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingDetails, setIsSavingDetails] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Dynamic Form Values
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Preview & Action States
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [rawPdfBlob, setRawPdfBlob] = useState<Blob | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isViewing, setIsViewing] = useState<boolean>(false);

  // Load PDF Blob for Preview
  const loadPdfPreview = useCallback(async (certId: string) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    try {
      const blob = await studentPortalService.getCertificatePdfBlob(certId);
      setRawPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err: unknown) {
      console.error('Failed to load certificate preview blob:', err);
      const message = err instanceof Error ? err.message : stringifyApiErrorValue(err);
      setPreviewError(message || 'Unable to load certificate document preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  }, []);


  // Cleanup object URL on unmount or cert change
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Fetch all certificate data from real backend
  const loadCertificateData = useCallback(async () => {
    if (!academyUuid || !courseUuid) return;
    setIsLoading(true);
    setApiError(null);

    try {
      // 1. Load Course Overview & Progress
      const overviewData = await studentPortalService.getCourseOverview(academyUuid, courseUuid);
      setOverview(overviewData);

      const enrollmentId = overviewData?.enrollment?.id;

      if (enrollmentId) {
        // 2. Load Certificate Profile Details & Required Fields
        try {
          const profileData = await studentPortalService.getCertificateProfileDetails(enrollmentId);
          setProfileDetails(profileData);

          // Populate initial form values from backend
          if (profileData?.fields && Array.isArray(profileData.fields)) {
            const initialVals: Record<string, any> = {};
            profileData.fields.forEach((f: CertificateProfileField) => {
              initialVals[f.key] = f.value ?? '';
            });
            setFormValues(initialVals);
          }
        } catch (err: any) {
          console.warn('Failed to fetch certificate profile details:', err);
        }

        // 3. Check for existing issued certificate or check status
        try {
          const certCheck = await studentPortalService.issueOrCheckCertificate(enrollmentId);
          let foundCert = certCheck?.certificate || null;

          if (!foundCert) {
            const allCerts = await studentPortalService.getStudentCertificates();
            foundCert = allCerts.find(
              (c: any) =>
                c.course_id === overviewData?.course?.id ||
                c.course_uuid === courseUuid ||
                c.enrollment_id === enrollmentId
            );
          }

          if (foundCert) {
            setIssuedCertificate(foundCert);
          }
        } catch (err: any) {
          console.warn('Certificate check:', err);
        }
      }
    } catch (err: any) {
      console.error('Error loading certificate data:', err);
      setApiError('Unable to load certificate information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [academyUuid, courseUuid]);

  useEffect(() => {
    loadCertificateData();
  }, [loadCertificateData]);

  // Load PDF preview cleanly when an issued certificate is active
  useEffect(() => {
    if (issuedCertificate?.id) {
      loadPdfPreview(issuedCertificate.id);
    }
  }, [issuedCertificate?.id, loadPdfPreview]);

  // Form input handler
  const handleInputChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  // Submit certificate personal details form
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const enrollmentId = overview?.enrollment?.id;
    if (!enrollmentId) return;

    setIsSavingDetails(true);
    setFormErrors({});

    try {
      const updatedDetails = await studentPortalService.updateCertificateProfileDetails(
        enrollmentId,
        formValues
      );
      setProfileDetails(updatedDetails);
      toast.success('Certificate details saved successfully!');
      // Recheck certificate eligibility status
      await loadCertificateData();
    } catch (err: any) {
      const errRes = err?.response?.data;
      if (errRes?.errors) {
        setFormErrors(errRes.errors);
      }
      toast.error(errRes?.detail || 'Failed to save certificate details. Please check the form errors.');
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Trigger certificate generation
  const handleGenerateCertificate = async () => {
    const enrollmentId = overview?.enrollment?.id;
    if (!enrollmentId) return;

    setIsGenerating(true);
    try {
      const result = await studentPortalService.issueOrCheckCertificate(enrollmentId);
      if (result?.success && result?.certificate) {
        setIssuedCertificate(result.certificate);
        loadPdfPreview(result.certificate.id);
        toast.success('Certificate generated successfully!');
      } else if (result?.missing_fields && result.missing_fields.length > 0) {
        toast.error('Please complete all required fields before generating your certificate.');
        setProfileDetails((prev: any) => ({ ...prev, missing_fields: result.missing_fields }));
      } else {
        toast.error(result?.detail || result?.message || 'Could not generate certificate.');
      }
      await loadCertificateData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Certificate generation failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // View PDF in new browser tab via Blob URL
  const handleViewPdf = async (certId?: string) => {
    const targetId = certId || issuedCertificate?.id;
    if (!targetId) return;

    setIsViewing(true);
    try {
      const blob = await studentPortalService.getCertificatePdfBlob(targetId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      toast.error('Unable to view certificate. Please try again.');
    } finally {
      setIsViewing(false);
    }
  };

  // Download PDF file via Blob URL
  const handleDownloadPdf = async (certId?: string) => {
    const targetId = certId || issuedCertificate?.id;
    if (!targetId) return;

    setIsDownloading(true);
    try {
      const blob = await studentPortalService.getCertificatePdfBlob(targetId);
      const certNum = issuedCertificate?.certificate_number || 'download';
      const fileName = `Certificate_${certNum}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success('Certificate downloaded successfully!');
    } catch (err: any) {
      toast.error('Unable to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Verification Link
  const handleCopyVerification = (verCode?: string) => {
    const code = verCode || issuedCertificate?.verification_code;
    if (!code) return;
    const fullUrl = `${window.location.origin}/verify/certificate/${code}`;
    navigator.clipboard?.writeText?.(fullUrl);
    toast.success('Verification link copied to clipboard!');
  };

  // Open Public Verification Page
  const handleOpenPublicVerify = (verCode?: string) => {
    const code = verCode || issuedCertificate?.verification_code;
    if (!code) return;
    window.open(`/verify/certificate/${code}`, '_blank', 'noopener,noreferrer');
  };

  // Derive Page & Feature Status
  const isFeatureEnabled = overview?.course?.features?.completionCertificate !== false;
  const isCourseCompleted = overview?.progress?.percentage >= 100 || overview?.enrollment?.status === 'COMPLETED';
  const missingFields = profileDetails?.missing_fields || [];
  const isProfileComplete = missingFields.length === 0;

  let certStatus = profileDetails?.certificate_status || (issuedCertificate ? 'ISSUED' : 'NOT_ISSUED');
  if (issuedCertificate) certStatus = 'ISSUED';
  if (!isFeatureEnabled) certStatus = 'FEATURE_DISABLED';

  // Format Helper for Input Fields
  const renderDynamicField = (field: CertificateProfileField) => {
    const value = formValues[field.key] ?? '';
    const isRequired = field.required;
    const isReadOnly = !field.editable;
    const hasError = !!formErrors[field.key];
    const fieldType = (field.type || 'text').toLowerCase();

    const commonClasses = `w-full max-w-full min-w-0 px-3.5 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${hasError
      ? 'border-rose-500 bg-rose-50/50 text-rose-900'
      : 'bg-[var(--surface-secondary)] border border-[var(--input-border)] text-[var(--text-primary)]'
      } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`;

    return (
      <div key={field.key} className="space-y-1.5 w-full">
        <label className="block text-xs font-semibold text-[var(--text-secondary)]">
          {field.label} {isRequired && <span className="text-rose-500">*</span>}
        </label>

        {fieldType === 'textarea' ? (
          <textarea
            value={value}
            disabled={isReadOnly}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            rows={3}
            className={commonClasses}
          />
        ) : fieldType === 'checkbox' ? (
          <label className="flex items-center gap-2.5 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={!!value}
              disabled={isReadOnly}
              onChange={(e) => handleInputChange(field.key, e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--brand-primary)] cursor-pointer"
            />
            <span className="text-xs text-[var(--text-primary)]">{field.label}</span>
          </label>
        ) : (
          <input
            type={
              fieldType === 'number'
                ? 'number'
                : fieldType === 'date'
                  ? 'date'
                  : fieldType === 'email'
                    ? 'email'
                    : fieldType === 'phone'
                      ? 'tel'
                      : fieldType === 'url'
                        ? 'url'
                        : 'text'
            }
            value={value}
            disabled={isReadOnly}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
          />
        )}

        {hasError && (
          <p className="text-xs text-rose-500 font-medium">
            {formErrors[field.key].join(' ')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans text-left max-w-4xl mx-auto pb-12 w-full px-2 sm:px-0">
      {/* 1. COURSE NAVIGATION TABS */}
      {academyUuid && courseUuid && (
        <CourseTabs academyUuid={academyUuid} courseUuid={courseUuid} activeTab="certificates" />
      )}

      {/* 2. LOADING STATE */}
      {isLoading ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-6 shadow-xs animate-pulse">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-[var(--surface-secondary)] rounded-md" />
              <div className="h-4 w-72 bg-[var(--surface-secondary)] rounded-md" />
            </div>
            <div className="h-10 w-28 bg-[var(--surface-secondary)] rounded-xl" />
          </div>
          <div className="h-40 w-full bg-[var(--surface-secondary)] rounded-xl" />
        </div>
      ) : apiError ? (
        /* 3. API ERROR STATE */
        <div className="bg-[var(--surface)] border border-rose-500/30 rounded-xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Unable to load certificate information.
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Please try again.</p>
          </div>
          <button
            type="button"
            onClick={loadCertificateData}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--brand-primary)] text-[var(--brand-primary-foreground,#fff)] hover:bg-[var(--brand-primary-hover)] transition-all cursor-pointer min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : !isFeatureEnabled ? (
        /* 4. CERTIFICATE DISABLED STATE */
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center space-y-4 shadow-xs">
          <Lock className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-60" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Certificate Unavailable</h2>
            <p className="text-xs text-[var(--text-muted)]">
              A certificate is not enabled for this course.
            </p>
          </div>
        </div>
      ) : certStatus === 'NO_TEMPLATE' ? (
        /* 5. NO TEMPLATE STATE */
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center space-y-4 shadow-xs">
          <FileText className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Certificate Template Pending</h2>
            <p className="text-xs text-[var(--text-muted)]">
              No active certificate template has been assigned to this course by the academy yet.
            </p>
          </div>
        </div>
      ) : (
        /* 6. MAIN CERTIFICATE CONTENT */
        <div className="space-y-6">
          {/* HEADER & STATUS BADGE */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Award className="w-6 h-6 text-[var(--brand-primary)]" />
                Course Certificate
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {issuedCertificate
                  ? 'Your official course completion credential has been issued.'
                  : 'Complete all requirements below to earn your verified certificate.'}
              </p>
            </div>

            {/* STATUS BADGE */}
            <div className="shrink-0">
              {issuedCertificate ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> Issued & Verified
                </span>
              ) : !isProfileComplete ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-4 h-4" /> Details Required
                </span>
              ) : isCourseCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                  <Sparkles className="w-4 h-4" /> Ready to Generate
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                  <Clock className="w-4 h-4" /> In Progress
                </span>
              )}
            </div>
          </div>

          {/* SINGLE COLUMN RESPONSIVE STACK */}
          <div className="space-y-6 w-full">
            {/* A. DETAILS REQUIRED STATE / FORM */}
            {profileDetails?.fields && profileDetails.fields.length > 0 && !issuedCertificate && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-xs w-full">
                <div className="border-b border-[var(--border)] pb-3">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Certificate Details Required
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Complete the required information below before your certificate can be generated.
                  </p>
                </div>

                <form onSubmit={handleSaveDetails} className="space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {profileDetails.fields.map(renderDynamicField)}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingDetails}
                      style={{
                        background: 'var(--brand-primary)',
                        color: 'var(--brand-primary-foreground, #FFFFFF)',
                      }}
                      className="w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                    >
                      {isSavingDetails ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving Details...
                        </>
                      ) : (
                        'Save Details'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* B. ELIGIBILITY TRACKER */}
            {!issuedCertificate && (
              <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Certificate Eligibility Requirements
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                    <span className="text-[var(--text-secondary)]">Course Completion (100%)</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${isCourseCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                    >
                      {isCourseCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {overview?.progress?.percentage || 0}% Completed
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                    <span className="text-[var(--text-secondary)]">Required Student Fields</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${isProfileComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                    >
                      {isProfileComplete ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {isProfileComplete ? 'All Fields Complete' : `${missingFields.length} Field(s) Incomplete`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[var(--text-secondary)]">Overall Eligibility</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${isCourseCompleted && isProfileComplete
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-[var(--text-muted)]'
                        }`}
                    >
                      {isCourseCompleted && isProfileComplete ? 'Eligible for Certificate' : 'Pending Requirements'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* C. READY TO GENERATE / PROCESSING STATE */}
            {!issuedCertificate && isCourseCompleted && isProfileComplete && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center space-y-4 shadow-xs w-full">
                {isGenerating ? (
                  <div className="space-y-3 py-4">
                    <RefreshCw className="w-10 h-10 text-[var(--brand-primary)] animate-spin mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">Generating Certificate...</h3>
                      <p className="text-xs text-[var(--text-muted)]">Your certificate is being prepared.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        Your certificate is ready to generate.
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Click below to generate and issue your verified course completion credential.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateCertificate}
                      style={{
                        background: 'var(--brand-primary)',
                        color: 'var(--brand-primary-foreground, #FFFFFF)',
                      }}
                      className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 cursor-pointer min-h-[44px] inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Certificate
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* D. READY TO DOWNLOAD / ISSUED STATE */}
            {issuedCertificate && (
              <div className="space-y-6 w-full">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-6 shadow-xs w-full">
                  <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        Official Certificate Issued
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">
                        Verified credential issued by {issuedCertificate.academy_name_snapshot || overview?.academy?.name || 'Academy'}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                      <ShieldCheck className="w-4 h-4" />
                      Verified
                    </div>
                  </div>

                  {/* REAL BACKEND VALUES GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Certificate Number
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                        {issuedCertificate.certificate_number}
                      </p>
                    </div>

                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Issue Date
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {issuedCertificate.issued_at
                          ? new Date(issuedCertificate.issued_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Student Name
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {issuedCertificate.student_name_snapshot || 'Student'}
                      </p>
                    </div>

                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Course Title
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {issuedCertificate.course_name_snapshot || overview?.course?.title || 'Course'}
                      </p>
                    </div>

                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Academy Name
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {issuedCertificate.academy_name_snapshot || overview?.academy?.name || 'Academy'}
                      </p>
                    </div>

                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Instructor Name
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {overview?.course?.instructor_name ||
                          overview?.course?.instructorName ||
                          issuedCertificate.academy_name_snapshot ||
                          'Academy Educator'}
                      </p>
                    </div>
                  </div>

                  {/* VERIFICATION LINK & ACTIONS */}
                  {issuedCertificate.verification_code && (
                    <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                          Verification Code
                        </span>
                        <code className="text-xs font-mono font-bold text-[var(--text-primary)] break-all">
                          {issuedCertificate.verification_code}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyVerification(issuedCertificate.verification_code)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 min-h-[40px]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPublicVerify(issuedCertificate.verification_code)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--brand-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 min-h-[40px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Verify Page
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS (MOBILE RESPONSIVE STACK) */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isViewing}
                      onClick={() => handleViewPdf(issuedCertificate.id)}
                      className="w-full sm:flex-1 py-3 px-4 rounded-lg text-sm font-semibold bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer min-h-[44px] inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isViewing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      View Certificate
                    </button>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownloadPdf(issuedCertificate.id)}
                      style={{
                        background: 'var(--brand-primary)',
                        color: 'var(--brand-primary-foreground, #FFFFFF)',
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-90 cursor-pointer min-h-[44px] inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* CERTIFICATE PREVIEW CONTAINER */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 shadow-xs w-full max-w-full min-w-0 overflow-hidden">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Certificate Document Preview
                  </h3>
                  <div className="w-full max-w-full min-w-0 h-[500px] rounded-lg overflow-hidden border border-[var(--border)] relative">
                    {isPreviewLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-muted)] bg-[var(--surface-secondary)]">
                        <RefreshCw className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
                        <span className="text-xs font-medium">Loading Certificate Preview...</span>
                      </div>
                    ) : previewError ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-rose-500 p-4 text-center bg-[var(--surface-secondary)]">
                        <AlertCircle className="w-8 h-8" />
                        <span className="text-xs font-semibold">{previewError}</span>
                        <button
                          type="button"
                          onClick={() => loadPdfPreview(issuedCertificate.id)}
                          className="mt-2 text-xs font-semibold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retry
                        </button>
                      </div>
                    ) : rawPdfBlob ? (
                      <PdfJsViewer
                        blob={rawPdfBlob}
                        filename={`Certificate_${issuedCertificate.certificate_number || 'document'}.pdf`}
                        onDownload={() => handleDownloadPdf(issuedCertificate.id)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)] bg-[var(--surface-secondary)]">
                        No preview available
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
