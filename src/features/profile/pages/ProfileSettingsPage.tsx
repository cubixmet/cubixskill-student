import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, CheckCircle2, CircleAlert, TriangleAlert, Lock, Globe, Bell, Eye, Camera, Building, Grid, LogOut, Award, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { toast } from '../../../stores/toast.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { useStudentCertificateStore, type DynamicCertificateTemplateField } from '../../../stores/certificate.store';

import { PageHeader } from '../../../components/ui/PageHeader';

export const ProfileSettingsPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);

  // Student Certificate Store
  const getTemplateFieldsForCourse = useStudentCertificateStore((state: any) => state.getTemplateFieldsForCourse);
  const getStudentCertificateFieldValues = useStudentCertificateStore((state: any) => state.getStudentCertificateFieldValues);
  const saveStudentCertificateDetails = useStudentCertificateStore((state: any) => state.saveStudentCertificateDetails);
  const isCertificateProfileComplete = useStudentCertificateStore((state: any) => state.isCertificateProfileComplete);

  const templateFields: DynamicCertificateTemplateField[] = getTemplateFieldsForCourse(courseUuid);

  const [certFormValues, setCertFormValues] = useState<Record<string, string | number | boolean | null>>(() =>
    getStudentCertificateFieldValues(courseUuid)
  );
  const [certValidationErrors, setCertValidationErrors] = useState<Record<string, string>>({});

  // Auto-scroll to Certificate Details card if URL contains #certificate-details
  useEffect(() => {
    if (window.location.hash === '#certificate-details') {
      const el = document.getElementById('certificate-details');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, []);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmedLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const currentAcademy = academies.find((a) => a.uuid === academyUuid);
  const currentCourse = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);

  // Profile Details
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
  const [fullName, setFullName] = useState(user?.fullName || 'Alex Student');
  const [email] = useState(user?.email || 'alex.student@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 00000');
  const [language, setLanguage] = useState('English (US)');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata (GMT+5:30)');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Preferences
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);
  const [notifyAssignments, setNotifyAssignments] = useState(true);
  const [notifyDiscussions, setNotifyDiscussions] = useState(false);

  // Accessibility Preferences
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [fontSize, setFontSize] = useState('Standard');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Student profile settings updated successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAvatarChange = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    ];
    const nextIdx = (sampleAvatars.indexOf(avatarUrl) + 1) % sampleAvatars.length;
    setAvatarUrl(sampleAvatars[nextIdx]);
    setToastMessage('Profile image updated.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToastMessage('New passwords do not match!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToastMessage('Password changed successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER CARD */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <PageHeader
          title="Profile & Settings"
          description="Manage your personal account information, security, notifications, and context switches."
        />
      </Card>

      {/* ACCOUNT CONTEXT SECTION (SWITCH ACADEMY & SWITCH COURSE) */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building className="w-4.5 h-4.5 text-slate-700" />
          <h2 className="text-base sm:text-[18px] font-semibold text-slate-900 tracking-tight">Account Context</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CURRENT ACADEMY CARD */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">Current Academy</span>
              <div className="flex items-center gap-3">
                <img src={currentAcademy?.logoUrl} alt={currentAcademy?.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-snug">{currentAcademy?.name || 'Bright Academy'}</h3>
                  <span className="text-xs text-slate-500 font-normal">{currentAcademy?.enrolledCoursesCount || 2} Enrolled Courses</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/student/academies')}
              leftIcon={<Building className="w-4 h-4 text-slate-500" />}
              className="w-full font-semibold h-[44px]"
            >
              Switch Academy
            </Button>
          </div>

          {/* CURRENT COURSE CARD */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">Current Course</span>
              <div className="flex items-center gap-3">
                <img src={currentCourse?.thumbnail} alt={currentCourse?.title} className="w-12 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 leading-snug truncate">{currentCourse?.title || 'Selected Course'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex-1">
                      <div
                        style={{ backgroundColor: currentAcademy?.theme?.primaryColor || '#2563EB', width: `${currentCourse?.progressPercent || 68}%` }}
                        className="h-full rounded-full"
                      />
                    </div>
                    <span className="text-[11px] font-semibold shrink-0" style={{ color: currentAcademy?.theme?.primaryColor || '#2563EB' }}>
                      {currentCourse?.progressPercent || 68}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/student/academies/${academyUuid}/courses`)}
              leftIcon={<Grid className="w-4 h-4 text-slate-500" />}
              className="w-full font-semibold h-[44px]"
            >
              Switch Course
            </Button>
          </div>
        </div>
      </Card>

      {/* CERTIFICATE DETAILS DYNAMIC CARD (ALL FIELDS ARE MANDATORY & STUDENT EDITABLE) */}
      {templateFields.length > 0 && (
        <Card id="certificate-details" padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" style={{ color: currentAcademy?.theme?.primaryColor || '#2563EB' }} />
                <h2 className="text-base sm:text-[18px] font-semibold text-slate-900 tracking-tight">Certificate Details</h2>
                {isCertificateProfileComplete(courseUuid).isComplete ? (
                  <Badge variant="success" size="sm">✓ Certificate Details Complete</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Action Required</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Complete the required information used to generate your official course certificate.
              </p>
            </div>

            {/* COMPLETION INDICATOR & PROGRESS BAR */}
            <div className="w-full sm:w-56 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 shrink-0">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-600">Certificate Profile</span>
                <span style={{ color: currentAcademy?.theme?.primaryColor || '#2563EB' }}>
                  {isCertificateProfileComplete(courseUuid).completedCount} / {isCertificateProfileComplete(courseUuid).totalRequiredCount} Required Fields
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: currentAcademy?.theme?.primaryColor || '#2563EB',
                    width: `${Math.round(
                      (isCertificateProfileComplete(courseUuid).completedCount /
                        Math.max(1, isCertificateProfileComplete(courseUuid).totalRequiredCount)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* READ-ONLY AUTO-FILLED FIELDS PREVIEW */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Auto-Filled System Values (Locked)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Course Title</span>
                <span className="font-bold text-slate-900 truncate block">{currentCourse?.title || 'React 19 & Cloud Architecture'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Issuing Academy</span>
                <span className="font-bold text-slate-900 truncate block">{currentAcademy?.name || 'Bright Academy of Technology'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">System Verification ID</span>
                <span className="font-mono font-bold text-slate-900 truncate block">AUTO-GEN-2026-CS</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC STUDENT MANDATORY FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newErrors: Record<string, string> = {};
              let firstInvalidKey: string | null = null;

              templateFields.forEach((field: DynamicCertificateTemplateField) => {
                const val = certFormValues[field.key];
                if (val === undefined || val === null || String(val).trim() === '') {
                  newErrors[field.key] = `${field.label} is required.`;
                  if (!firstInvalidKey) {
                    firstInvalidKey = field.key;
                  }
                }
              });

              if (Object.keys(newErrors).length > 0) {
                setCertValidationErrors(newErrors);

                if (firstInvalidKey) {
                  const el = document.getElementById(`field-${firstInvalidKey}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.focus();
                  }
                }

                toast.warning('Please complete all mandatory certificate fields.');
                return;
              }

              saveStudentCertificateDetails({
                academyUuid,
                courseUuid,
                templateUuid: 'tmpl-react19-mastery',
                studentUuid: user?.id || 'std-alex-001',
                values: certFormValues,
              });

              setCertValidationErrors({});
              toast.success('Certificate Details saved! Certificate profile is now complete.');
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateFields.map((field: DynamicCertificateTemplateField) => {
                const val = certFormValues[field.key] ?? '';
                const err = certValidationErrors[field.key];

                return (
                  <div key={field.uuid} className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 block">
                      {field.label} <span className="text-rose-500 font-bold">*</span>
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        id={`field-${field.key}`}
                        rows={3}
                        value={String(val)}
                        onChange={(e) => {
                          setCertFormValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                          if (certValidationErrors[field.key]) {
                            setCertValidationErrors((prev) => {
                              const next = { ...prev };
                              delete next[field.key];
                              return next;
                            });
                          }
                        }}
                        placeholder={field.placeholder}
                        className={`w-full p-3 rounded-xl bg-white border text-xs font-semibold focus:outline-hidden ${
                          err ? 'border-rose-500 text-rose-900' : 'border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={`field-${field.key}`}
                        value={String(val)}
                        onChange={(e) => {
                          setCertFormValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                          if (certValidationErrors[field.key]) {
                            setCertValidationErrors((prev) => {
                              const next = { ...prev };
                              delete next[field.key];
                              return next;
                            });
                          }
                        }}
                        className={`w-full h-11 px-3 rounded-xl bg-white border text-xs font-semibold focus:outline-hidden ${
                          err ? 'border-rose-500 text-rose-900' : 'border-slate-200 text-slate-900 focus:border-blue-600'
                        }`}
                      >
                        <option value="">Select option...</option>
                        {(field.options || ['Grade A+', 'Grade A', 'Grade B']).map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={`field-${field.key}`}
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        value={String(val)}
                        onChange={(e) => {
                          setCertFormValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                          if (certValidationErrors[field.key]) {
                            setCertValidationErrors((prev) => {
                              const next = { ...prev };
                              delete next[field.key];
                              return next;
                            });
                          }
                        }}
                        placeholder={field.placeholder}
                        className={`bg-white text-xs font-semibold h-11 ${
                          err ? 'border-rose-500 text-rose-900' : 'border-slate-200 text-slate-900'
                        }`}
                      />
                    )}

                    {field.helpText && !err && <p className="text-[11px] text-slate-500 font-normal">{field.helpText}</p>}
                    {err && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5">
                        <CircleAlert className="w-4 h-4 shrink-0" /> <span>{err}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                size="md"
                style={{ backgroundColor: currentAcademy?.theme?.primaryColor || '#2563EB' }}
                className="text-white font-semibold rounded-xl px-6 min-h-[44px] w-full sm:w-auto"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Certificate Details
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 1. PERSONAL INFORMATION */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card padding="md" className="bg-white border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-xs" />
                <button
                  type="button"
                  onClick={handleAvatarChange}
                  className="absolute bottom-0 right-0 text-white p-1 rounded-full shadow-md transition-colors cursor-pointer"
                  style={{ backgroundColor: currentAcademy?.theme?.primaryColor || '#2563EB' }}
                  title="Change Profile Image"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-900 block">{fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono">Global Account ID: {user?.id}</span>
              </div>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handleAvatarChange} leftIcon={<Camera className="w-3.5 h-3.5" />}>
              Change Image
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Full Name *</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>

            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Global Email (Read Only)</label>
              <Input
                value={email}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                disabled
                className="bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-[44px] px-3.5 pl-9 rounded-[10px] border border-slate-200 bg-white font-medium text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400/20"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                </select>
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 bg-white font-medium text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400/20"
              >
                <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
                <option value="UTC (GMT+0:00)">UTC (GMT+0:00)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT+1:00)">Europe/London (GMT+1:00)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="submit" className="font-semibold px-6" leftIcon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        </Card>
      </form>

      {/* 2. PASSWORD & SECURITY */}
      <form onSubmit={handlePasswordSubmit}>
        <Card padding="md" className="bg-white border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-base md:text-[18px] text-slate-900 tracking-tight">Security &amp; Password</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-xs md:text-[13px] text-slate-900 mb-1">Confirm New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="submit" variant="outline" className="font-semibold px-5">
              Update Password
            </Button>
          </div>
        </Card>
      </form>

      {/* 3. NOTIFICATION PREFERENCES */}
      <Card padding="md" className="bg-white border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-slate-700" />
          <h2 className="font-semibold text-base md:text-[18px] text-slate-900 tracking-tight">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">Email Notifications</span>
              <span className="text-xs text-slate-500 font-normal">Receive course updates and system alerts via email</span>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">Course Announcements</span>
              <span className="text-xs text-slate-500 font-normal">Get notified when instructors publish new announcements</span>
            </div>
            <input
              type="checkbox"
              checked={notifyAnnouncements}
              onChange={(e) => setNotifyAnnouncements(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">Assignment Reminders</span>
              <span className="text-xs text-slate-500 font-normal">Receive reminders for upcoming assignment due dates</span>
            </div>
            <input
              type="checkbox"
              checked={notifyAssignments}
              onChange={(e) => setNotifyAssignments(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">Discussion Replies</span>
              <span className="text-xs text-slate-500 font-normal">Get notified when someone replies to your posts</span>
            </div>
            <input
              type="checkbox"
              checked={notifyDiscussions}
              onChange={(e) => setNotifyDiscussions(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>
        </div>
      </Card>

      {/* 4. ACCESSIBILITY PREFERENCES */}
      <Card padding="md" className="bg-white border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Eye className="w-4 h-4 text-slate-700" />
          <h2 className="font-semibold text-base md:text-[18px] text-slate-900 tracking-tight">Accessibility Preferences</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">High Contrast Mode</span>
              <span className="text-xs text-slate-500 font-normal">Increase visual contrast across text and icons</span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">Reduced Motion</span>
              <span className="text-xs text-slate-500 font-normal">Minimize non-essential animations and transitions</span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">Screen Reader Optimized</span>
              <span className="text-xs text-slate-500 font-normal">Enhanced ARIA labels and focus indicators</span>
            </div>
            <input
              type="checkbox"
              checked={screenReader}
              onChange={(e) => setScreenReader(e.target.checked)}
              className="w-4 h-4 text-slate-700 rounded-sm border-slate-300 focus:ring-slate-400 cursor-pointer"
            />
          </label>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-2">
            <div>
              <span className="font-semibold text-slate-900 block">Interface Font Size</span>
              <span className="text-xs text-slate-500 font-normal">Adjust reading font size</span>
            </div>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="h-[36px] px-3 rounded-[8px] border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-hidden"
            >
              <option value="Standard">Standard</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 5. ACCOUNT & SESSION MANAGEMENT */}
      <Card padding="md" className="bg-white border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <LogOut className="w-4 h-4 text-rose-600" />
          <div>
            <h2 className="font-semibold text-base md:text-[18px] text-slate-900 tracking-tight">Account</h2>
            <p className="text-xs text-slate-500 font-normal">Manage your current session.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full h-12 min-h-[48px] px-4 rounded-xl border border-rose-300 bg-white text-rose-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-rose-600" />
          <span>Logout</span>
        </button>
      </Card>

      {/* LOGOUT CONFIRMATION DIALOG */}
      {showLogoutConfirm && (
        <Modal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          title="Logout"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-sans text-left">
            <p className="text-slate-600 text-sm font-medium">
              Are you sure you want to sign out of your account?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowLogoutConfirm(false)}
                className="font-semibold"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="md"
                onClick={handleConfirmedLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
              >
                Logout
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
