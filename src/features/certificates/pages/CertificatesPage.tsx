import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Share2,
  ZoomIn,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useLearningStore } from '../../../stores/learning.store';
import { useAcademyStore } from '../../../stores/academy.store';

export const CertificatesPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{
    academyUuid?: string;
  }>();

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

  const handleDownloadPdf = (courseTitle: string) => {
    setToastMessage(`Downloading official certificate PDF for ${courseTitle}...`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareLink = (certUuid: string) => {
    navigator.clipboard?.writeText?.(window.location.origin + `/verify/certificate/${certUuid}`);
    setToastMessage('Verification link copied to clipboard!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto hide-scrollbar pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER & STATS SUMMARY */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Certificates</h1>
            <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
              View earned certificates, download high-resolution PDFs, and verify your credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-base font-bold text-emerald-700 block">{earnedCount}</span>
              <span className="text-[9px] font-semibold text-emerald-600 uppercase">Earned</span>
            </div>
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-base font-bold text-amber-700 block">{eligibleCount}</span>
              <span className="text-[9px] font-semibold text-amber-600 uppercase">Eligible</span>
            </div>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-base font-bold text-slate-700 block">{pendingCount}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase">Pending</span>
            </div>
          </div>
        </div>
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
                <div className="flex justify-between text-slate-600">
                  <span>Verification Status:</span>
                  <Badge variant="success" size="sm">Authentic &amp; Verified</Badge>
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

              <Button
                size="sm"
                onClick={() => handleDownloadPdf(cert.courseTitle)}
                className="w-full font-semibold theme-bg"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
                  onClick={() => handleDownloadPdf(previewCert.courseTitle)}
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
