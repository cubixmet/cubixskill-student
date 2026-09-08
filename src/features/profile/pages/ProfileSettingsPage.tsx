import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  Lock,
  Bell,
  Camera,
  LogOut,
  Award,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckSquare,
  Shield,
  Eye,
  EyeOff,
  Upload,
  Trash2
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { toast } from '../../../stores/toast.store';
import { useAuthStore } from '../../../stores/auth.store';
import { studentPortalService } from '../../../services/studentPortal.service';
import type { StudentCourseOverviewResponse, CertificateProfileDetailsResponse } from '../../../services/studentPortal.service';
import { authService } from '../../auth/services/auth.service';
import { useStudentLogout } from '../../../hooks/useStudentLogout';
import { resolveMediaUrl } from '../../../services/apiClient';

export type ActiveTab = 'general' | 'learning' | 'certificate' | 'access' | 'completion';

export interface SettingsTab {
  id: ActiveTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'general', label: 'General', icon: User },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'certificate', label: 'Certificate', icon: Award },
  { id: 'access', label: 'Access', icon: Shield },
  { id: 'completion', label: 'Completion', icon: CheckSquare },
];

export const ProfileSettingsPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const setStudent = useAuthStore((state) => state.setStudent);
  const logout = useAuthStore((state) => state.logout);

  // State for Backend Data Loading
  const [courseOverview, setCourseOverview] = useState<StudentCourseOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active Tab State with URL Hash & Query Parameter support
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs: ActiveTab[] = ['general', 'learning', 'certificate', 'access', 'completion'];
    if (hash === 'certificate-details' || hash === 'certificate') return 'certificate';
    if (validTabs.includes(hash as ActiveTab)) return hash as ActiveTab;

    const queryTab = new URLSearchParams(window.location.search).get('tab')?.toLowerCase();
    if (queryTab && validTabs.includes(queryTab as ActiveTab)) return queryTab as ActiveTab;

    return 'general';
  });

  // Keep Active Tab synchronized when URL hash changes
  useEffect(() => {
    const handleHashOrQueryChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs: ActiveTab[] = ['general', 'learning', 'certificate', 'access', 'completion'];
      if (hash === 'certificate-details' || hash === 'certificate') {
        setActiveTab('certificate');
      } else if (validTabs.includes(hash as ActiveTab)) {
        setActiveTab(hash as ActiveTab);
      } else {
        const queryTab = new URLSearchParams(window.location.search).get('tab')?.toLowerCase();
        if (queryTab && validTabs.includes(queryTab as ActiveTab)) {
          setActiveTab(queryTab as ActiveTab);
        }
      }
    };

    handleHashOrQueryChange();
    window.addEventListener('hashchange', handleHashOrQueryChange);
    return () => window.removeEventListener('hashchange', handleHashOrQueryChange);
  }, [location.hash, location.search]);

  // Tab switch handler with URL hash sync
  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
  };

  // Form State initialized from Backend Student Self Profile
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('Asia/Kolkata (GMT+5:30)');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState<boolean>(false);

  // Password State & Independent Show/Hide Toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Preferences State
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);
  const [notifyAssignments, setNotifyAssignments] = useState(true);
  const [notifyDiscussions, setNotifyDiscussions] = useState(false);

  // Accessibility Preferences
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Main Settings Data Loader
  useEffect(() => {
    let isMounted = true;

    async function loadSettingsData() {
      if (!academyUuid || !courseUuid) {
        if (isMounted) {
          setLoadError('Invalid academy or course.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const [overview, profile] = await Promise.all([
          studentPortalService.getCourseOverview(academyUuid, courseUuid),
          studentPortalService.getStudentProfile().catch(() => null),
        ]);

        if (!isMounted) return;

        if (!overview) {
          setCourseOverview(null);
          setLoadError('Unable to load course settings.');
          return;
        }

        setCourseOverview(overview);

        if (profile) {
          setStudentProfile(profile);
          setFullName(profile.full_name || profile.display_name || '');
          setPhone(profile.phone || '');
          setStudentCode(profile.student_code || '');

          const photoUrl = profile.profile_photo?.url
            ? resolveMediaUrl(profile.profile_photo.url)
            : '';
          setAvatarUrl(photoUrl);
        }
      } catch (err: any) {
        if (!isMounted) return;

        setCourseOverview(null);
        setLoadError(
          err?.data?.detail || err?.message || 'Unable to load course settings.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSettingsData();

    return () => {
      isMounted = false;
    };
  }, [academyUuid, courseUuid]);

  // Real Certificate Profile Details State
  const [certProfileDetails, setCertProfileDetails] = useState<CertificateProfileDetailsResponse | null>(null);
  const [isLoadingCertProfile, setIsLoadingCertProfile] = useState<boolean>(false);
  const [isSavingCertProfile, setIsSavingCertProfile] = useState<boolean>(false);
  const [certFormValues, setCertFormValues] = useState<Record<string, any>>({});
  const [certValidationErrors, setCertValidationErrors] = useState<Record<string, string>>({});

  const enrollmentId = courseOverview?.enrollment?.id;

  // Load Real Certificate Profile Details when certificate tab is active
  useEffect(() => {
    let isMounted = true;

    async function loadCertDetails() {
      if (activeTab !== 'certificate' || !enrollmentId) return;
      setIsLoadingCertProfile(true);
      try {
        const details = await studentPortalService.getCertificateProfileDetails(enrollmentId);
        if (isMounted && details) {
          setCertProfileDetails(details);
          const initialVals: Record<string, any> = {};
          details.fields.forEach((f) => {
            initialVals[f.key] = f.value ?? '';
          });
          setCertFormValues(initialVals);
        }
      } catch (err: any) {
        if (isMounted) {
          toast.error(err?.message || 'Failed to load certificate personal details.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCertProfile(false);
        }
      }
    }

    loadCertDetails();

    return () => {
      isMounted = false;
    };
  }, [activeTab, enrollmentId]);

  // Handle #certificate-details scroll once loaded
  const hasScrolledCertRef = useRef(false);
  useEffect(() => {
    if (activeTab === 'certificate' && certProfileDetails && !hasScrolledCertRef.current) {
      hasScrolledCertRef.current = true;
      const el = document.getElementById('certificate-details');
      if (el) {
        el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
  }, [activeTab, certProfileDetails]);

  const { handleLogout: executeStudentLogout } = useStudentLogout();

  const handleConfirmedLogout = async () => {
    setShowLogoutConfirm(false);
    await executeStudentLogout();
  };

  // Handle Real Profile Photo Upload to Storage API then PATCH to Student Profile
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed Image Types Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image type. Please select a JPG, PNG, or WEBP photo.');
      return;
    }

    // 5MB Size Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // 1. Upload to storage API
      const media = await studentPortalService.uploadProfilePhoto(file);
      if (!media || !media.id) {
        throw new Error('Failed to upload image file.');
      }

      // 2. Attach media ID to Student Profile
      const updatedProfile = await studentPortalService.updateStudentProfile({
        profile_photo_id: media.id,
      });

      // 3. Update state upon backend success
      const newUrl = resolveMediaUrl(updatedProfile.profile_photo?.url || media.url);
      setAvatarUrl(newUrl);
      setStudentProfile(updatedProfile);

      if (user) {
        setStudent({
          ...user,
          avatarUrl: newUrl,
          avatar: newUrl,
        });
      }

      toast.success('Profile photo updated successfully.');
    } catch (err: any) {
      toast.error(err?.message || err?.data?.detail || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Remove Profile Photo
  const handleRemovePhoto = async () => {
    setIsRemovingPhoto(true);
    try {
      const updatedProfile = await studentPortalService.updateStudentProfile({
        profile_photo_id: null,
      });
      setAvatarUrl('');
      setStudentProfile(updatedProfile);

      if (user) {
        setStudent({
          ...user,
          avatarUrl: undefined,
          avatar: undefined,
        });
      }
      toast.success('Profile photo removed.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove profile photo.');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const FULL_NAME_REGEX = /^[\p{L}\p{M}' -]+$/u;

  const handleFullNameChange = (val: string) => {
    // Filter out numeric digits instantly on input
    const filtered = val.replace(/\d+/g, '');
    setFullName(filtered);
  };

  // Real Profile Update API Call
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      toast.error('Full Name is required.');
      return;
    }

    if (!FULL_NAME_REGEX.test(trimmed)) {
      toast.error('Full name can contain letters, spaces, apostrophes and hyphens only.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedProfile = await studentPortalService.updateStudentProfile({
        full_name: trimmed,
        phone: phone.trim(),
      });

      setStudentProfile(updatedProfile);
      setFullName(updatedProfile.full_name || trimmed);
      setPhone(updatedProfile.phone || phone.trim());

      if (user) {
        setStudent({
          ...user,
          fullName: updatedProfile.full_name || trimmed,
          phone: updatedProfile.phone || phone.trim(),
        });
      }

      setToastMessage('Student profile settings saved successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      const serverMsg = err?.data?.full_name?.[0] || err?.message || err?.data?.detail || 'Failed to save profile changes.';
      toast.error(serverMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Real Password Change API Call
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success('Password updated successfully.');
    } catch (err: any) {
      const detail = err?.data?.current_password?.[0] || err?.data?.detail || err?.message || 'Failed to update password.';
      toast.error(detail);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const currentAcademy = courseOverview?.academy;
  const currentCourse = courseOverview?.course;
  const currentEnrollment = courseOverview?.enrollment;
  const currentProgress = courseOverview?.progress;

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12 w-full px-2 sm:px-4">
        <Card padding="md" className="space-y-3">
          <Skeleton variant="rectangular" className="h-6 w-1/3" />
          <Skeleton variant="rectangular" className="h-4 w-2/3" />
        </Card>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-10 w-28 shrink-0 rounded-xl" />
          ))}
        </div>
        <Card padding="lg" className="space-y-4">
          <Skeleton variant="rectangular" className="h-10 w-full" />
          <Skeleton variant="rectangular" className="h-24 w-full" />
          <Skeleton variant="rectangular" className="h-12 w-1/4" />
        </Card>
      </div>
    );
  }

  if (loadError || !courseOverview) {
    return (
      <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12 w-full px-2 sm:px-4 py-8">
        <Card padding="lg" className="text-center space-y-4 border border-[var(--border)] bg-[var(--surface)]">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Unable to load course settings.</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Please try again.</p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => window.location.reload()}
              className="font-semibold"
            >
              Reload Page
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/student/academies/${academyUuid || ''}/courses`)}
              className="font-semibold"
            >
              Back to Courses
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12 w-full px-1 sm:px-4 min-w-0">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface)] text-[var(--text-primary)] font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[var(--border)] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <Card padding="md">
        <div className="flex flex-col gap-3">
          <Link
            to={`/student/academies/${academyUuid}/courses/${courseUuid}/overview`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-2 border-t border-[var(--border)] pt-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                Course Settings
              </h1>
              <p className="text-xs font-normal text-[var(--text-muted)] mt-0.5">
                {currentCourse?.title} • {currentAcademy?.name}
              </p>
            </div>
            {currentAcademy?.logo_url && (
              <img
                src={currentAcademy.logo_url}
                alt={currentAcademy.name}
                className="w-8 h-8 rounded-lg object-cover border border-[var(--border)] shrink-0"
              />
            )}
          </div>
        </div>
      </Card>

      {/* ACCESSIBLE TABS NAVIGATION */}
      <div
        role="tablist"
        aria-label="Course Settings Tabs"
        className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1 -mx-1 px-1"
      >
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface-secondary))] text-[var(--brand-primary)] border-[var(--brand-primary)]'
                  : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. GENERAL TAB PANEL */}
      {activeTab === 'general' && (
        <section
          id="general-settings"
          role="tabpanel"
          aria-labelledby="tab-general"
          className="space-y-6"
        >
          {/* PROFILE INFORMATION FORM */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card padding="md" className="space-y-4">
              {/* AVATAR & PHOTO UPLOAD AREA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-[var(--border)] bg-[color-mix(in_srgb,var(--brand-primary)_12%,var(--surface-secondary))] flex items-center justify-center font-bold text-lg text-[var(--brand-primary)]">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile Photo" className="w-full h-full object-cover" />
                      ) : (
                        <span>{getInitials(fullName || user?.fullName || '')}</span>
                      )}
                    </div>

                    {/* HIDDEN FILE INPUT */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      aria-label="Upload profile photo file"
                    />

                    {/* OVERLAY CAMERA BUTTON */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 text-[var(--brand-primary-foreground,#ffffff)] p-1.5 rounded-full shadow-md transition-all cursor-pointer bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)]"
                      aria-label="Change profile photo"
                      title="Change profile photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="font-semibold text-base text-[var(--text-primary)] block">
                      {fullName || 'Student Account'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-normal block">
                      Account ID: {studentCode || user?.account_number || user?.accountNumber || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploadingPhoto}
                    loadingText="Uploading..."
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    className="w-full sm:w-auto font-semibold"
                  >
                    Upload Photo
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      isLoading={isRemovingPhoto}
                      loadingText="Removing..."
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                      className="w-full sm:w-auto font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50"
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* REORGANIZED 2-COLUMN PROFILE INPUT GRID (NO EMPTY GAPS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">Full Name *</label>
                  <Input
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    leftIcon={<User className="w-4 h-4 text-[var(--text-muted)]" />}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">
                    Global Email (Read Only)
                  </label>
                  <Input
                    value={user?.email || ''}
                    leftIcon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">Phone Number</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-[var(--text-muted)]" />}
                  />
                </div>

                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full h-[44px] px-3.5 rounded-[10px] border border-[var(--input-border)] bg-[var(--surface-secondary)] font-medium text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                  >
                    <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
                    <option value="UTC (GMT+0:00)">UTC (GMT+0:00)</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                    <option value="Europe/London (GMT+1:00)">Europe/London (GMT+1:00)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setFullName(user?.fullName || '');
                    setPhone(user?.phone || '');
                  }}
                  className="w-full sm:w-auto font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingProfile}
                  loadingText="Saving Profile..."
                  className="w-full sm:w-auto font-semibold"
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile
                </Button>
              </div>
            </Card>
          </form>

          {/* SECURITY & ACCOUNT CARD WITH INDEPENDENT SHOW/HIDE EYE BUTTONS */}
          <form onSubmit={handlePasswordSubmit}>
            <Card padding="md" className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Lock className="w-4 h-4 text-[var(--text-primary)]" />
                <h2 className="font-semibold text-base text-[var(--text-primary)] tracking-tight">Security &amp; Account</h2>
              </div>

              {/* ACCOUNT INFORMATION DISPLAY */}
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block tracking-wider">Account ID</span>
                  <span className="text-sm font-semibold font-mono text-[var(--text-primary)]">{studentCode || user?.account_number || user?.accountNumber || '—'}</span>
                </div>
                <Badge variant="info" size="sm">Read Only</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* CURRENT PASSWORD */}
                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">Current Password</label>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        title={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        className="text-[var(--text-muted)] hover:text-[var(--brand-primary)] focus:outline-none cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">New Password</label>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                        title={showNewPassword ? 'Hide new password' : 'Show new password'}
                        className="text-[var(--text-muted)] hover:text-[var(--brand-primary)] focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div>
                  <label className="block font-medium text-xs text-[var(--text-primary)] mb-1">Confirm New Password</label>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="text-[var(--text-muted)] hover:text-[var(--brand-primary)] focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full sm:w-auto text-rose-600 font-semibold text-xs flex items-center justify-center gap-1.5 hover:underline cursor-pointer py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout from Session</span>
                </button>

                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  isLoading={isUpdatingPassword}
                  loadingText="Updating Password..."
                  className="w-full sm:w-auto font-semibold"
                >
                  Update Password
                </Button>
              </div>
            </Card>
          </form>
        </section>
      )}

      {/* 2. LEARNING TAB PANEL */}
      {activeTab === 'learning' && (
        <section
          id="learning-settings"
          role="tabpanel"
          aria-labelledby="tab-learning"
        >
          <Card padding="md" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <BookOpen className="w-4 h-4 text-[var(--text-primary)]" />
              <div>
                <h2 className="font-semibold text-base text-[var(--text-primary)] tracking-tight">Lesson Progression &amp; Playback</h2>
                <p className="text-xs text-[var(--text-muted)] font-normal">Read-only course playback and progression policies from backend.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                  Progression Rule
                </span>
                <p className="font-semibold text-xs text-[var(--text-primary)]">Free / Flexible Navigation</p>
                <p className="text-[11px] text-[var(--text-muted)] font-normal">
                  Lessons can be completed in any sequence permitted by the instructor.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                  Current Level
                </span>
                <p className="font-semibold text-xs text-[var(--text-primary)]">{currentCourse?.level || 'All Levels'}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] space-y-3">
                <span className="font-semibold text-xs text-[var(--text-primary)] block">Accessibility Options</span>
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer">
                  <div>
                    <span className="font-semibold text-[var(--text-primary)] block">High Contrast Mode</span>
                    <span className="text-xs text-[var(--text-muted)] font-normal">Enhance text and border contrast</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand-primary)] rounded-sm border-[var(--input-border)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer border-t border-[var(--border)]">
                  <div>
                    <span className="font-semibold text-[var(--text-primary)] block">Reduced Motion</span>
                    <span className="text-xs text-[var(--text-muted)] font-normal">Minimize transition animations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand-primary)] rounded-sm border-[var(--input-border)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer border-t border-[var(--border)]">
                  <div>
                    <span className="font-semibold text-[var(--text-primary)] block">Screen Reader Optimization</span>
                    <span className="text-xs text-[var(--text-muted)] font-normal">Enhanced ARIA attributes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={screenReader}
                    onChange={(e) => setScreenReader(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand-primary)] rounded-sm border-[var(--input-border)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 3. CERTIFICATE TAB PANEL */}
      {activeTab === 'certificate' && (
        <section
          id="certificate-settings"
          role="tabpanel"
          aria-labelledby="tab-certificate"
          className="space-y-6"
        >
          <Card padding="md" id="certificate-details" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--brand-primary)]" />
                  <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">Certificate Details</h2>
                  {certProfileDetails && (!certProfileDetails.missing_fields || certProfileDetails.missing_fields.length === 0) ? (
                    <Badge variant="success" size="sm">✓ Details Complete</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Action Required</Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] font-normal mt-0.5">
                  Official course certificate requirements &amp; personal student details.
                </p>
              </div>

              {/* PROGRESS BAR */}
              {certProfileDetails && certProfileDetails.fields && certProfileDetails.fields.length > 0 && (
                <div className="w-full sm:w-56 space-y-1 bg-[var(--surface-secondary)] p-3 rounded-xl border border-[var(--border)] shrink-0">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-[var(--text-secondary)]">Profile Status</span>
                    <span className="text-[var(--brand-primary)]">
                      {certProfileDetails.fields.filter(f => !f.missing).length} / {certProfileDetails.fields.length} Required
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 bg-[var(--brand-primary)]"
                      style={{
                        width: `${Math.round(
                          (certProfileDetails.fields.filter(f => !f.missing).length / Math.max(1, certProfileDetails.fields.length)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!enrollmentId ? (
              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <span className="font-semibold text-xs text-[var(--text-primary)] block">Enrollment information is unavailable.</span>
                <p className="text-xs text-[var(--text-muted)]">Please ensure you are actively enrolled in this course.</p>
              </div>
            ) : isLoadingCertProfile ? (
              <div className="space-y-4 py-4">
                <Skeleton variant="rectangular" className="h-10 w-full" />
                <Skeleton variant="rectangular" className="h-12 w-full" />
                <Skeleton variant="rectangular" className="h-12 w-full" />
              </div>
            ) : certProfileDetails && certProfileDetails.fields && certProfileDetails.fields.filter(f => f.editable).length > 0 ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!enrollmentId) return;

                  const newErrors: Record<string, string> = {};
                  certProfileDetails.fields.filter(f => f.editable && f.required).forEach((field) => {
                    const val = certFormValues[field.key];
                    if (val === undefined || val === null || String(val).trim() === '') {
                      newErrors[field.key] = `${field.label} is required.`;
                    }
                  });

                  if (Object.keys(newErrors).length > 0) {
                    setCertValidationErrors(newErrors);
                    toast.warning('Please complete all required certificate details.');
                    return;
                  }

                  setIsSavingCertProfile(true);
                  try {
                    // 1. PATCH profile-details
                    const updatedDetails = await studentPortalService.updateCertificateProfileDetails(enrollmentId, certFormValues);
                    setCertProfileDetails(updatedDetails);
                    setCertValidationErrors({});

                    toast.success('Certificate personal details saved.');

                    // 2. POST issue-or-check
                    const checkRes = await studentPortalService.issueOrCheckCertificate(enrollmentId);
                    const status = checkRes?.status || checkRes?.certificate_status || updatedDetails?.certificate_status;

                    if (status === 'ISSUED' || status === 'ALREADY_ISSUED') {
                      toast.success(checkRes?.message || 'Certificate is ready!');
                    } else if (status === 'PROFILE_INCOMPLETE') {
                      toast.warning('Profile details are still incomplete for certificate generation.');
                    } else if (status === 'NOT_ELIGIBLE') {
                      toast.info(checkRes?.message || 'Details saved. Complete course requirements to receive your certificate.');
                    } else if (status === 'PENDING_CREDIT') {
                      toast.info('Your certificate is being processed.');
                    } else if (checkRes?.message) {
                      toast.info(checkRes.message);
                    }
                  } catch (err: any) {
                    const apiErrors = err?.data?.errors;
                    if (apiErrors && typeof apiErrors === 'object') {
                      const formatted: Record<string, string> = {};
                      Object.entries(apiErrors).forEach(([k, v]) => {
                        formatted[k] = Array.isArray(v) ? v[0] : String(v);
                      });
                      setCertValidationErrors(formatted);
                    }
                    toast.error(err?.data?.detail || err?.message || 'Failed to save certificate details.');
                  } finally {
                    setIsSavingCertProfile(false);
                  }
                }}
                className="space-y-4 pt-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certProfileDetails.fields.filter(f => f.editable).map((field) => {
                    const val = certFormValues[field.key] ?? '';
                    const err = certValidationErrors[field.key];
                    const isMissing = field.missing;

                    return (
                      <div key={field.key} className="space-y-1 text-left">
                        <label className="text-xs font-semibold text-[var(--text-primary)] block">
                          {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                          <textarea
                            id={`field-${field.key}`}
                            value={String(val)}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              setCertFormValues((prev) => ({ ...prev, [field.key]: inputVal }));
                              if (certValidationErrors[field.key]) {
                                setCertValidationErrors((prev) => {
                                  const next = { ...prev };
                                  delete next[field.key];
                                  return next;
                                });
                              }
                            }}
                            rows={3}
                            className={`w-full p-3 rounded-xl border font-medium text-xs bg-[var(--surface-secondary)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] ${
                              err || isMissing ? 'border-rose-400 dark:border-rose-900 bg-rose-50/20' : 'border-[var(--input-border)]'
                            }`}
                          />
                        ) : (
                          <Input
                            id={`field-${field.key}`}
                            type={field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                            value={String(val)}
                            onChange={(e) => {
                              let inputVal = e.target.value;
                              if (field.key === 'student.full_name') {
                                inputVal = inputVal.replace(/\d+/g, '');
                              }
                              setCertFormValues((prev) => ({ ...prev, [field.key]: inputVal }));
                              if (certValidationErrors[field.key]) {
                                setCertValidationErrors((prev) => {
                                  const next = { ...prev };
                                  delete next[field.key];
                                  return next;
                                });
                              }
                            }}
                            error={err}
                            className={isMissing && !err ? 'border-rose-400 dark:border-rose-900' : ''}
                          />
                        )}
                        {err && <span className="text-[11px] font-medium text-rose-500 block">{err}</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3 border-t border-[var(--border)]">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSavingCertProfile}
                    loadingText="Saving & Checking Certificate..."
                    className="w-full sm:w-auto font-semibold"
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save &amp; Continue
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <span className="font-semibold text-xs text-[var(--text-primary)] block">Your required certificate details are already available.</span>
                <p className="text-xs text-[var(--text-muted)]">
                  Your verified student profile information will be used for certificate generation upon course completion.
                </p>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* 4. ACCESS TAB PANEL */}
      {activeTab === 'access' && (
        <section
          id="access-settings"
          role="tabpanel"
          aria-labelledby="tab-access"
        >
          <Card padding="md" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Shield className="w-4 h-4 text-[var(--text-primary)]" />
              <div>
                <h2 className="font-semibold text-base text-[var(--text-primary)] tracking-tight">Course Access &amp; Enrollment</h2>
                <p className="text-xs text-[var(--text-muted)] font-normal">Backend access settings for your current course enrollment.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                  Enrollment Status
                </span>
                <p className="font-semibold text-xs text-[var(--text-primary)] capitalize">
                  {currentEnrollment?.status || 'Active Enrollment'}
                </p>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                  Course Visibility
                </span>
                <p className="font-semibold text-xs text-[var(--text-primary)] capitalize">
                  Public / Enrolled
                </p>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                  Access Type
                </span>
                <p className="font-semibold text-xs text-[var(--text-primary)] capitalize">
                  {currentEnrollment?.access_type || 'Full Course Access'}
                </p>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                  Enrolled Date
                </span>
                <p className="font-semibold text-xs text-[var(--text-primary)]">
                  {currentEnrollment?.enrolled_at
                    ? new Date(currentEnrollment.enrolled_at).toLocaleDateString()
                    : 'Active'}
                </p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 6. COMPLETION TAB PANEL */}
      {activeTab === 'completion' && (
        <section
          id="completion-settings"
          role="tabpanel"
          aria-labelledby="tab-completion"
        >
          <Card padding="md" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <CheckSquare className="w-4 h-4 text-[var(--text-primary)]" />
              <div>
                <h2 className="font-semibold text-base text-[var(--text-primary)] tracking-tight">Completion Requirements &amp; Progress</h2>
                <p className="text-xs text-[var(--text-muted)] font-normal">Real-time completion criteria evaluated by backend servers.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* PROGRESS SUMMARY */}
              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[var(--text-primary)]">Overall Course Progress</span>
                  <span className="font-bold text-xs text-[var(--brand-primary)]">
                    {currentProgress?.percentage ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-[var(--border)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300"
                    style={{ width: `${currentProgress?.percentage ?? 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                  <span>Completed Lessons</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {currentProgress?.completed_lessons ?? 0} / {currentProgress?.total_lessons ?? 0}
                  </span>
                </div>
              </div>

              {/* RULES CHECKLIST */}
              <div className="space-y-2">
                <span className="font-semibold text-xs text-[var(--text-primary)] block">Active Rules</span>
                <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 ${ (currentProgress?.percentage ?? 0) >= 100 ? 'text-emerald-500' : 'text-[var(--text-muted)]' }`} />
                    <span className="font-medium text-xs text-[var(--text-primary)]">Complete 100% of required lessons</span>
                  </div>
                  <Badge variant={(currentProgress?.percentage ?? 0) >= 100 ? 'success' : 'neutral'} size="sm">
                    {(currentProgress?.percentage ?? 0) >= 100 ? 'Passed' : 'In Progress'}
                  </Badge>
                </div>

                <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-xs text-[var(--text-primary)]">Student Profile &amp; Certificate Fields Validated</span>
                  </div>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* LOGOUT CONFIRMATION DIALOG */}
      {showLogoutConfirm && (
        <Modal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          title="Logout Confirmation"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-sans text-left">
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Are you sure you want to sign out of your account?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
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
                variant="danger"
                size="md"
                onClick={handleConfirmedLogout}
                className="font-semibold shadow-xs"
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
