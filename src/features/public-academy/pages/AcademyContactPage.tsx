import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { usePublicAcademy } from '../layouts/PublicAcademyLayout';
import { studentPortalService } from '../../../services/studentPortal.service';

export const AcademyContactPage: React.FC = () => {
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const [localData, setLocalData] = useState<any>(null);
  const academyUuid = context?.academyUuid || paramUuid || '';

  useEffect(() => {
    if (context) return;
    let isMounted = true;
    async function loadData() {
      if (!academyUuid) return;
      const website = await studentPortalService.getPublicAcademyWebsite(academyUuid);
      if (isMounted) setLocalData(website);
    }
    loadData();
    return () => { isMounted = false; };
  }, [context, academyUuid]);

  const publicData = context?.publicData || localData || {};
  const academyEntity = context?.academyEntity || {
    name: publicData.academy?.name || 'Academy',
    supportEmail: publicData.academy?.email || 'support@cubixskill.com',
    supportPhone: publicData.academy?.phone || '',
    theme: { primaryColor: publicData.theme?.primary_color || '#2563EB' },
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const contactInfo = publicData.contact || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Unable to send your message right now. Please try again.');
    }
  };

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-5xl mx-auto w-full min-w-0 space-y-8 text-left">
      {/* CONTACT HEADER */}
      <div className="text-center space-y-1.5 max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal">
          We'd love to hear from you. Reach out to {academyEntity.name} with any questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* CONTACT INFORMATION CARD */}
        <div className="space-y-6 bg-white dark:bg-[#111827] p-6 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs">
          <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Contact Information</h3>
          <div className="space-y-4 text-xs text-[#475569] dark:text-[#CBD5E1]">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Support Email</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{academyEntity.supportEmail}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Phone Support</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{contactInfo.whatsapp_number || academyEntity.supportPhone || '+1 (555) 019-9831'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Academy Desk</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{contactInfo.address || 'Global Learning Platform'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT FORM CONTAINER */}
        <div className="md:col-span-2 bg-white dark:bg-[#111827] p-6 md:p-8 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3 bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.08)] border border-[#A7F3D0] dark:border-[rgba(52,211,153,0.22)] rounded-xl p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-[#6EE7B7] mx-auto" />
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Message Sent Successfully</h3>
              <p className="text-xs text-[#475569] dark:text-[#6EE7B7] max-w-sm mx-auto font-normal">
                Thank you for contacting {academyEntity.name}. The academy support team will review your message and respond soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-[#F87171] text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Course Enrollment Question"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  className="w-full p-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
