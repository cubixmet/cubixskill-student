import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { AcademyHeader } from '../../../components/layout/AcademyHeader';
import { AcademyFooter } from '../../../components/layout/AcademyFooter';
import { useAcademyStore } from '../../../stores/academy.store';

export const AcademyContactPage: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);

  useEffect(() => {
    if (academyUuid) {
      loadAcademyThemeByUuid(academyUuid);
    }
  }, [academyUuid, loadAcademyThemeByUuid]);

  const academy = getAcademyByUuid(academyUuid || '');
  const [submitted, setSubmitted] = useState(false);

  if (!academy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-slate-900">Academy Not Found</h1>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
          Return to Portal
        </Link>
      </div>
    );
  }

  const primaryStyle = { backgroundColor: academy.theme.primaryColor };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-xs text-slate-900">
      <AcademyHeader academy={academy} />

      <main className="flex-1 py-12 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact {academy.name}</h1>
          <p className="text-slate-600 text-xs">
            Have questions about our curriculum, enrollment, or enterprise training programs? Send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Direct Contact Info</h3>
            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Support Email</span>
                  <span>{academy.supportEmail}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Phone Support</span>
                  <span>{academy.supportPhone}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Headquarters</span>
                  <span>Global Online Academy Hub</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-xs">
                  Thank you for reaching out to {academy.name}. Our support team will respond to your email within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-900">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-900">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Course Enrollment Question"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  style={primaryStyle}
                  className="w-full font-semibold text-white py-3.5 rounded-xl flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <AcademyFooter academy={academy} />
    </div>
  );
};
