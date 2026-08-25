import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Share2,
  ZoomIn,
  Settings,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useLearningStore } from '../../../stores/learning.store';
import { useAcademyStore } from '../../../stores/academy.store';
import { useStudentCertificateStore } from '../../../stores/certificate.store';
import { toast } from '../../../stores/toast.store';

import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { CourseTabs } from '../../learning/components/CourseTabs';

export const CertificatesPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
  }>();
  const navigate = useNavigate();

  const isCertificateProfileComplete = useStudentCertificateStore((state: any) => state.isCertificateProfileComplete);
  const certProfileStatus = isCertificateProfileComplete(courseUuid);

  const academies = useAcademyStore((state) => state.academies);
  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB', primarySoft: '#EFF6FF' };

  const certificates = useLearningStore((state) => state.certificates);

  // Stats & Tabs
  const earnedCount = certificates.length;
  const eligibleCount = 1;
  const pendingCount = 1;

  const [activeTab, setActiveTab] = useState<'All' | 'Earned' | 'Eligible' | 'Pending'>('All');
  const [previewCert, setPreviewCert] = useState<typeof certificates[0] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student Profile Completion Modal State
  const [profileModalCert, setProfileModalCert] = useState<{ courseTitle: string; certUuid: string } | null>(null);
  const [regNumber, setRegNumber] = useState('REG-2026-9901');

  const handleDownloadPdf = (courseTitle: string, certUuid: string) => {
    // If student editable fields require completion, open profile completion modal first
    if (!regNumber) {
      setProfileModalCert({ courseTitle, certUuid });
      return;
    }
    toast.success(`Downloading official high-resolution certificate PDF for ${courseTitle}...`);
  };

  const handleSaveStudentDetails = () => {
    if (profileModalCert) {
      toast.success(`Details saved! Downloading certificate PDF for ${profileModalCert.courseTitle}...`);
      setProfileModalCert(null);
    }
  };

  const handleShareLink = (certUuid: string) => {
    navigator.clipboard?.writeText?.(window.location.origin + `/verify/certificate/${certUuid}`);
    toast.success('Verification link copied to clipboard!');
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto hide-scrollbar pb-12">
      {/* COURSE TABS ROW */}
      <CourseTabs academyUuid={academyUuid} courseUuid={courseUuid} activeTab="certificates" />

      {/* 1. PAGE HEADER & STATS SUMMARY */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <PageHeader
          title="Course Certificates"
          description="View earned certificates, download high-resolution PDFs, and verify your credentials."
          action={
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-base font-semibold text-emerald-700 block">{earnedCount}</span>
                <span className="text-[9px] font-semibold text-emerald-600 uppercase">Earned</span>
              </div>
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-base font-semibold text-amber-700 block">{eligibleCount}</span>
                <span className="text-[9px] font-semibold text-amber-600 uppercase">Eligible</span>
              </div>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-base font-semibold text-slate-700 block">{pendingCount}</span>
                <span className="text-[9px] font-semibold text-slate-500 uppercase">Pending</span>
              </div>
            </div>
          }
        />
      </Card>

      {/* 2. TAB CONTROLS */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {(['All', 'Earned', 'Eligible', 'Pending'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected ? 'theme-soft theme-text theme-border border shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab} Certificates
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. CERTIFICATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {certificates.map((cert) => (
          <Card key={cert.uuid} padding="md" className="bg-white border border-slate-200/80 space-y-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between hover:border-slate-300">
            <div className="space-y-4">
              {/* DYNAMIC THEME ACCENT BANNER */}
              <div
                className="p-5 text-white rounded-2xl space-y-2 text-center relative overflow-hidden shadow-xs"
                style={{ background: `linear-gradient(135deg, var(--theme-primary, ${theme.primaryColor}), #0F172A)` }}
              >
                <Award className="w-10 h-10 mx-auto text-amber-300" />
                <h3 className="font-semibold text-sm block leading-tight">{cert.courseTitle}</h3>
                <span className="text-[10px] text-white/80 font-mono block">Certificate #: {cert.certificateNumber}</span>
                <div className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED OFFICIAL CREDENTIAL</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-normal">
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Student Name:</span>
                  <strong className="font-semibold text-slate-900">{cert.studentName}</strong>
                </div>
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Issued Date:</span>
                  <strong className="font-semibold text-slate-900">{cert.issuedAt}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Verification Status:</span>
                  {certProfileStatus.isComplete ? (
                    <Badge variant="success" size="sm">Authentic &amp; Verified</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Details Required ({certProfileStatus.completedCount}/{certProfileStatus.totalRequiredCount})</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewCert(cert)}
                  className="w-full font-semibold"
                  leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Preview
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareLink(cert.uuid)}
                  className="w-full font-semibold"
                  leftIcon={<Share2 className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Share
                </Button>
              </div>

              {!certProfileStatus.isComplete ? (
                <Button
                  size="sm"
                  onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/settings#certificate-details`)}
                  className="w-full font-semibold bg-amber-600 hover:bg-amber-700 text-white min-h-[40px]"
                  leftIcon={<Settings className="w-3.5 h-3.5" />}
                >
                  Complete Details
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownloadPdf(cert.courseTitle, cert.uuid)}
                    className="w-full font-semibold theme-bg min-h-[40px]"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.success(`Downloading high-resolution PNG image for ${cert.courseTitle}...`);
                    }}
                    className="w-full font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 min-h-[40px]"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    PNG
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* STUDENT PROFILE REQUIRED FIELDS MODAL */}
      <Modal
        isOpen={Boolean(profileModalCert)}
        onClose={() => setProfileModalCert(null)}
        title="Complete Required Certificate Details"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <p className="text-slate-600">
            This academy template requires student-filled dynamic fields before issuing your official certificate for{' '}
            <strong className="text-slate-900">{profileModalCert?.courseTitle}</strong>.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Student Registration Number</label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-blue-600"
              placeholder="e.g. REG-2026-9901"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" onClick={() => setProfileModalCert(null)} className="min-h-[40px]">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStudentDetails} className="theme-bg text-white font-semibold min-h-[40px]">
              Save &amp; Generate Certificate
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. CERTIFICATE PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        title={previewCert?.courseTitle || 'Certificate Preview'}
        subtitle={`Issued to ${previewCert?.studentName} • ${previewCert?.issuedAt}`}
        maxWidth="xl"
      >
        {previewCert && (
          <div className="space-y-4 font-sans text-xs">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 25, 150))}
                  leftIcon={<ZoomIn className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Zoom ({zoomLevel}%)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoomLevel(100)}
                >
                  Reset
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownloadPdf(previewCert.courseTitle, previewCert.uuid)}
                  className="font-semibold theme-bg"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>
              </div>
            </div>

            {/* ARTWORK PREVIEW CONTAINER */}
            <div className="overflow-auto max-h-[60vh] p-4 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border-4 border-slate-900 text-center space-y-6 transition-all"
              >
                <div className="border-b-2 border-slate-200 pb-4">
                  <span className="font-extrabold text-lg text-slate-900 tracking-widest uppercase block">CubixSkill Academy</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block mt-1">Official Certificate of Completion</span>
                </div>

                <div className="space-y-2 py-4">
                  <span className="text-xs text-slate-500 font-serif italic block">This is to certify that</span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{previewCert.studentName}</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto font-normal">
                    has successfully completed the masterclass curriculum and demonstrated proficiency in
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 pt-2">{previewCert.courseTitle}</h3>
                </div>

                <div className="flex justify-between items-end border-t-2 border-slate-200 pt-6 text-[11px] text-slate-600">
                  <div className="text-left">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase">Issued Date</span>
                    <strong className="text-slate-900 block">{previewCert.issuedAt}</strong>
                  </div>

                  <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase">Credential ID</span>
                    <strong className="text-slate-900 block">{previewCert.certificateNumber}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
