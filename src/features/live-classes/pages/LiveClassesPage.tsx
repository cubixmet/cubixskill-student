import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  PlayCircle,
  Clock,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
  Send,
  MessageCircle,
  Radio,
  X,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { useLiveClassStore, type LiveClass } from '../../../stores/live-class.store';
import {
  resolveLiveClassStatus,
  canAccessLiveClass,
  formatLiveClassDate,
  formatLiveClassTime,
  formatLiveClassDuration,
} from '../utils/liveClassResolver';
import { LiveClassRecordingModal } from '../components/LiveClassRecordingModal';
import { LiveClassCard } from '../components/LiveClassCard';

import { PageHeader } from '../../../components/ui/PageHeader';

export const LiveClassesPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const student = useAuthStore((state) => state.student);
  const getEnrollment = useEnrollmentStore((state) => state.getEnrollment);

  const liveClasses = useLiveClassStore((state) => state.liveClasses);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const course = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);
  const studentUuid = student?.uuid || 'std-production-1';
  const enrollment = getEnrollment(studentUuid, courseUuid);

  const isDemoStudent = enrollment?.accessType === 'demo';
  const isDemoExpired = isDemoStudent && enrollment?.status === 'expired';

  const theme = academy?.theme || { primaryColor: '#2563EB' };

  // Embedded Classroom Mode state
  const [activeClassroom, setActiveClassroom] = useState<LiveClass | null>(null);
  const [recordingModalClass, setRecordingModalClass] = useState<LiveClass | null>(null);

  // Chat State inside Classroom
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Aarav Patel', text: 'Welcome everyone! Today we discuss React 19 Compiler internals live.', time: '12:00 PM' },
    { sender: 'Priya', text: 'Excited for the live demonstration!', time: '12:02 PM' },
  ]);

  const [accessError, setAccessError] = useState<string | null>(null);

  const courseSessions = useMemo(() => {
    return liveClasses.filter((item) => item.courseUuid === courseUuid);
  }, [liveClasses, courseUuid]);

  // Group Sessions by Temporal Status
  const liveSessions = courseSessions.filter((s) => resolveLiveClassStatus(s) === 'LIVE_NOW');
  const upcomingSessions = courseSessions
    .filter((s) => resolveLiveClassStatus(s) === 'UPCOMING')
    .sort((a, b) => new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime());
  const completedSessions = courseSessions
    .filter((s) => resolveLiveClassStatus(s) === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledStartAt).getTime() - new Date(a.scheduledStartAt).getTime());
  const cancelledSessions = courseSessions.filter((s) => resolveLiveClassStatus(s) === 'CANCELLED');

  const handleJoinClass = (session: LiveClass) => {
    const access = canAccessLiveClass({ liveClass: session, enrollment });
    if (!access.canAccess) {
      if (access.reason === 'demo_expired') {
        setAccessError('Your demo access period has expired. Upgrade to full course enrollment to join live classes.');
      } else if (access.reason === 'demo_restricted') {
        setAccessError('This live class is available with full course enrollment.');
      } else {
        setAccessError('Valid course enrollment is required to join live sessions.');
      }
      setTimeout(() => setAccessError(null), 4000);
      return;
    }

    if (session.deliveryType === 'external_url' && session.joinUrl) {
      window.open(session.joinUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveClassroom(session);
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          sender: student?.name || 'Student',
          text: chatInput.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setChatInput('');
    }
  };

  // EMBEDDED PLATFORM CLASSROOM VIEW
  if (activeClassroom) {
    return (
      <div className="space-y-4 font-sans text-xs text-left max-w-6xl mx-auto pb-12">
        {/* CLASSROOM TOP HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 text-white p-4 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs text-rose-400 uppercase tracking-widest block">LIVE CLASSROOM</span>
              <h1 className="font-bold text-sm sm:text-base text-white truncate">{activeClassroom.title}</h1>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setActiveClassroom(null)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl min-h-[40px] px-4 cursor-pointer shrink-0"
          >
            Leave Classroom
          </Button>
        </div>

        {/* EMBEDDED STREAM PLAYER & LIVE CHAT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-2">
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              {activeClassroom.streamUrl?.endsWith('.mp4') ? (
                <video controls autoPlay playsInline className="w-full h-full object-contain">
                  <source src={activeClassroom.streamUrl} type="video/mp4" />
                </video>
              ) : (
                <iframe
                  src={activeClassroom.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  title={activeClassroom.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 leading-relaxed text-xs">
              {activeClassroom.description || 'Interactive live masterclass session.'}
            </div>
          </div>

          {/* RIGHT CHAT & PARTICIPANTS */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between h-[420px] shadow-2xs">
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-blue-600" /> Live Q&amp;A Chat
              </span>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                42 Attending
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 hide-scrollbar">
              {chatMessages.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50/90 rounded-xl text-xs space-y-0.5 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold text-[11px] truncate">{m.sender}</strong>
                    <span className="text-[10px] text-slate-400 font-medium">{m.time}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs break-words">{m.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                placeholder="Ask a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Button size="sm" onClick={handleSendMessage} className="bg-blue-600 text-white rounded-xl min-h-[40px] px-3">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 font-sans text-xs text-left max-w-5xl mx-auto pb-12">
      {/* ACCESS ERROR TOAST */}
      {accessError && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-start gap-2.5 shadow-lg border border-slate-800 animate-in fade-in duration-200">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold text-slate-100 flex-1 leading-snug">{accessError}</span>
        </div>
      )}

      {/* DEMO EXPIRED ALERT */}
      {isDemoExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 fill-amber-500" />
            <div className="min-w-0">
              <span className="font-bold text-xs block">Demo Access Expired</span>
              <span className="text-[11px] text-amber-800 font-medium">
                Your 5-day demo period has ended. Upgrade to full course access to join live sessions.
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/${academyUuid}/register?course=${courseUuid}&intent=full`)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 cursor-pointer"
          >
            Enroll Full Course
          </Button>
        </div>
      )}

      {/* 1. COMPACT PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs">
        <PageHeader
          title="Interactive Live Sessions"
          description="Participate in scheduled instructor masterclasses, real-time code reviews, and live Q&A sessions."
          badge={
            <Badge variant={isDemoStudent ? 'warning' : 'info'} size="sm" className="font-semibold text-[11px]">
              {isDemoStudent ? 'Demo Access Scope' : 'Course Live Schedule'}
            </Badge>
          }
        />
      </Card>

      {/* 2. SECTION: LIVE NOW */}
      {liveSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Live Now</h2>
          </div>

          <div className="space-y-3">
            {liveSessions.map((session) => (
              <LiveClassCard
                key={session.liveClassUuid}
                liveClass={session}
                onJoin={(s) => handleJoinClass(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. SECTION: UPCOMING SESSIONS */}
      <div className="space-y-3">
        <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Upcoming Live Sessions</h2>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session) => {
              const access = canAccessLiveClass({ liveClass: session, enrollment });
              return (
                <Card key={session.liveClassUuid} padding="md" className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm" className="font-bold text-[10px] rounded-lg">
                        Upcoming
                      </Badge>
                      {session.isDemoAccessible && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Demo Accessible
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {formatLiveClassDate(session.scheduledStartAt)} • {formatLiveClassTime(session.scheduledStartAt)}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug break-words">{session.title}</h3>
                    {session.description && <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: {formatLiveClassDuration(session.scheduledStartAt, session.scheduledEndAt)}</span>
                    </span>

                    <Button
                      size="md"
                      onClick={() => handleJoinClass(session)}
                      leftIcon={<Video className="w-4 h-4 shrink-0" />}
                      className="w-full sm:w-auto font-semibold px-6 min-h-[44px] bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Join Live Class
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center space-y-1 text-slate-500">
            <Calendar className="w-8 h-8 mx-auto text-slate-400" />
            <span className="font-bold text-slate-900 text-xs block">No Upcoming Live Sessions</span>
            <span className="text-[11px]">Your instructor has not scheduled any new live classes for this week.</span>
          </div>
        )}
      </div>

      {/* 4. SECTION: PREVIOUS SESSIONS & RECORDINGS */}
      <div className="space-y-3 pt-2">
        <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Previous Sessions &amp; Recordings</h2>
        {completedSessions.length > 0 ? (
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <Card key={session.liveClassUuid} padding="md" className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <Badge variant="neutral" size="sm" className="font-bold text-[10px] rounded-lg">
                    Completed Session
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">{formatLiveClassDate(session.scheduledStartAt)}</span>
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug break-words">{session.title}</h3>
                  {session.description && <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    {session.recordingUrl ? 'Replay Recording Available' : 'Recording Not Available'}
                  </span>

                  {session.recordingUrl ? (
                    <Button
                      size="md"
                      onClick={() => setRecordingModalClass(session)}
                      leftIcon={<PlayCircle className="w-4 h-4 shrink-0" />}
                      className="w-full sm:w-auto font-semibold px-5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
                    >
                      Watch Recording
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">No Recording</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center text-slate-400 text-xs">
            No previous live class recordings recorded yet.
          </div>
        )}
      </div>

      {/* RECORDING PLAYER MODAL */}
      {recordingModalClass && (
        <LiveClassRecordingModal liveClass={recordingModalClass} onClose={() => setRecordingModalClass(null)} />
      )}
    </div>
  );
};
