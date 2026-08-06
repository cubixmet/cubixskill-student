import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const VerifyCertificatePage: React.FC = () => {
  const { certificateUuid } = useParams<{ certificateUuid: string }>();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-xs text-left">
      <Card padding="lg" className="max-w-lg w-full bg-white space-y-6 shadow-2xl rounded-3xl border border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Official Certificate Verified</h1>
          <p className="text-xs text-emerald-600 font-extrabold uppercase tracking-wider">
            ✓ Authenticated by CubixSkill Blockchain Registry
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-bold">Certificate UUID:</span>
            <span className="font-mono text-slate-900 font-extrabold">{certificateUuid}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-bold">Student Name:</span>
            <span className="font-extrabold text-slate-900">Alex Student</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-bold">Course Title:</span>
            <span className="font-extrabold text-blue-600">Full Stack React 19 &amp; Cloud Architecture</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">Issuing Academy:</span>
            <span className="font-extrabold text-slate-900">Bright Academy of Technology</span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link to="/student/academies">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Academies
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
