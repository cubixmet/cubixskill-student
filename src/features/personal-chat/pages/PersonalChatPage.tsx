import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  RotateCcw,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { useAuthStore } from '../../../stores/auth.store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  usePersonalChatStore,
  type PersonalMessage,
} from '../store/personal-chat.store';

import { ConversationList } from '../components/ConversationList';
import { MessageItem } from '../components/MessageItem';
import { MessageComposer } from '../components/MessageComposer';
import { ConversationDetailsPanel } from '../components/ConversationDetailsPanel';
import { NewConversationModal } from '../components/NewConversationModal';

export const PersonalChatPage: React.FC = () => {
  const {
    academyUuid = '550e8400-e29b-41d4-a716-446655440000',
    courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    conversationUuid,
  } = useParams<{
    academyUuid: string;
    courseUuid: string;
    conversationUuid?: string;
  }>();

  const navigate = useNavigate();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const user = useAuthStore((state) => state.user);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const course = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);

  const theme = academy?.theme || {
    primaryColor: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#EFF6FF',
  };

  // Personal Chat store hooks
  const getConversationsByCourse = usePersonalChatStore((state) => state.getConversationsByCourse);
  const getConversationByUuid = usePersonalChatStore((state) => state.getConversationByUuid);
  const getMessagesByConversation = usePersonalChatStore((state) => state.getMessagesByConversation);
  const sendMessage = usePersonalChatStore((state) => state.sendMessage);
  const markConversationRead = usePersonalChatStore((state) => state.markConversationRead);
  const markConversationResolved = usePersonalChatStore((state) => state.markConversationResolved);
  const reopenConversation = usePersonalChatStore((state) => state.reopenConversation);
  const deleteStudentMessage = usePersonalChatStore((state) => state.deleteStudentMessage);
  const editStudentMessage = usePersonalChatStore((state) => state.editStudentMessage);
  const retryMessage = usePersonalChatStore((state) => state.retryMessage);
  const messagesMap = usePersonalChatStore((state) => state.messages);

  const courseConversations = getConversationsByCourse(courseUuid);
  const activeConversation = conversationUuid ? getConversationByUuid(conversationUuid) : undefined;
  const activeMessages = activeConversation ? getMessagesByConversation(activeConversation.uuid) : [];

  // State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<PersonalMessage | undefined>(undefined);
  const [showRightPanelDesktop, setShowRightPanelDesktop] = useState(true);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages & mark read
  useEffect(() => {
    if (activeConversation && activeConversation.unreadCount > 0) {
      markConversationRead(activeConversation.uuid);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationUuid, activeMessages.length]);

  // Handle route selection
  const handleSelectConversation = (uuid: string) => {
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/personal-chat/${uuid}`);
  };

  const handleBackToList = () => {
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/personal-chat`);
  };

  const handleSendMessage = (content: string, replyToUuid?: string, attachments?: any[]) => {
    if (!activeConversation || !user) return;

    sendMessage({
      conversationUuid: activeConversation.uuid,
      senderUuid: user.id || 'usr-student-01',
      senderName: user.fullName || 'Alex Rivers',
      senderAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderRole: 'student',
      content,
      replyToMessageUuid: replyToUuid,
      attachments,
    });
  };

  // FEATURE DISABLED CHECK
  if (course?.features?.personalChat === false) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 font-sans text-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Personal Chat is Disabled</h2>
          <p className="text-slate-500 font-normal text-sm">
            Personal Chat is disabled for this course. Contact the academy through the available support channel.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
          className="font-semibold px-5"
        >
          Return to Course Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-5.5rem)] flex flex-col font-sans text-xs text-slate-900 overflow-hidden relative hide-scrollbar">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. DESKTOP PAGE HEADER */}
      <div className="hidden md:flex items-center justify-between pb-4 border-b border-slate-200/80 mb-3 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: theme.primaryColor }} />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Chat</h1>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Send private questions to your instructor or course support team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            style={{ backgroundColor: theme.primaryColor }}
            className="font-semibold text-white px-4 h-10 cursor-pointer hover:opacity-90"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Conversation
          </Button>

          {activeConversation && (
            <button
              type="button"
              onClick={() => setShowRightPanelDesktop(!showRightPanelDesktop)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Toggle Details Panel"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID (DESKTOP & MOBILE CONDITIONAL) */}
      <div className="flex-1 min-h-0 relative">
        {/* MOBILE ACTIVE CHAT HEADER (<768px) */}
        {conversationUuid && (
          <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-3 py-2.5 sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={handleBackToList}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Back to conversations"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {activeConversation && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={activeConversation.instructorAvatar}
                      alt={activeConversation.instructorName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    {activeConversation.instructorStatus === 'online' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-900 block truncate leading-tight">
                      {activeConversation.instructorName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal truncate block">
                      {activeConversation.instructorStatus === 'online' ? 'Online' : 'Replies in few hours'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMoreMenuOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MOBILE LIST HEADER (<768px when NO conversation selected) */}
        {!conversationUuid && (
          <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-3 py-2.5 mb-2 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Back to Course Overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Personal Chat</h1>
            </div>

            <Button
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              style={{ backgroundColor: theme.primaryColor }}
              className="font-semibold text-white px-3 h-9 text-xs cursor-pointer"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New
            </Button>
          </div>
        )}

        {/* DESKTOP 3-COLUMN / MOBILE SINGLE COLUMN WRAPPER */}
        <div
          className="h-full grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_280px] gap-4"
          style={{
            gridTemplateColumns: showRightPanelDesktop
              ? undefined
              : '320px minmax(0, 1fr)',
          }}
        >
          {/* COLUMN 1: LEFT CONVERSATION LIST (Visible on Desktop always, or Mobile when no conversationUuid selected) */}
          <div className={`${conversationUuid ? 'hidden md:block' : 'block'} h-full overflow-hidden`}>
            <ConversationList
              conversations={courseConversations}
              activeConversationUuid={conversationUuid}
              onSelectConversation={handleSelectConversation}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              messagesMap={messagesMap}
              theme={theme}
            />
          </div>

          {/* COLUMN 2: CENTER ACTIVE CHAT PANEL (Visible on Desktop always, or Mobile when conversationUuid IS selected) */}
          <div className={`${!conversationUuid ? 'hidden md:flex' : 'flex'} flex-col h-full bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden`}>
            {activeConversation ? (
              <div className="flex-1 flex flex-col h-full min-h-0">
                {/* CENTER DESKTOP CHAT TOP BAR */}
                <div className="hidden md:flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={activeConversation.instructorAvatar}
                      alt={activeConversation.instructorName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="font-semibold text-xs md:text-sm text-slate-900 truncate leading-snug">
                        {activeConversation.subject}
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal">
                        <span>{activeConversation.instructorName}</span>
                        <span>•</span>
                        <span className="capitalize">{activeConversation.instructorRole}</span>
                        {activeConversation.relatedTitle && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold truncate max-w-[150px]">
                              {activeConversation.relatedTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESOLVED BANNER (Section 13) */}
                {activeConversation.status === 'resolved' && (
                  <div className="p-3 bg-amber-50 border-b border-amber-200/80 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-xs text-amber-900">
                        This conversation has been resolved.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => reopenConversation(activeConversation.uuid)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-all cursor-pointer shadow-2xs"
                      >
                        Reopen Conversation
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNewModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        Start New Conversation
                      </button>
                    </div>
                  </div>
                )}

                {/* MESSAGE HISTORY SCROLL BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar min-h-0 bg-[#F8FAFC]/50">
                  {activeMessages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">No messages in this thread yet.</p>
                      <p className="text-xs font-normal">Type below to send a message to your instructor.</p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const quoted = msg.replyToMessageUuid
                        ? activeMessages.find((m) => m.uuid === msg.replyToMessageUuid)
                        : undefined;

                      return (
                        <MessageItem
                          key={msg.uuid}
                          message={msg}
                          quotedMessage={quoted}
                          onReply={(m) => setReplyingToMessage(m)}
                          onDelete={(uuid) => deleteStudentMessage(uuid, activeConversation.uuid)}
                          onEdit={(uuid, content) => editStudentMessage(uuid, activeConversation.uuid, content)}
                          onRetry={(uuid) => retryMessage(uuid, activeConversation.uuid)}
                          theme={theme}
                        />
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* COMPOSER */}
                <MessageComposer
                  onSendMessage={handleSendMessage}
                  replyingToMessage={replyingToMessage}
                  onCancelReply={() => setReplyingToMessage(undefined)}
                  isDisabled={activeConversation.status === 'closed'}
                  disabledReason="This conversation is closed by policy. Contact academy support."
                  theme={theme}
                />
              </div>
            ) : (
              /* NO SELECTED CONVERSATION PLACEHOLDER */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs"
                  style={{ backgroundColor: theme.primarySoft }}
                >
                  <MessageSquare className="w-7 h-7" style={{ color: theme.primaryColor }} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-slate-900">Select a Conversation</h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Choose an existing discussion from the left panel or start a new private message to your instructor.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsNewModalOpen(true)}
                  style={{ backgroundColor: theme.primaryColor }}
                  className="font-semibold text-white px-4 h-10 cursor-pointer"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>

          {/* COLUMN 3: RIGHT DETAILS PANEL (DESKTOP) */}
          {activeConversation && showRightPanelDesktop && (
            <div className="hidden lg:block h-full overflow-hidden">
              <ConversationDetailsPanel
                conversation={activeConversation}
                messages={activeMessages}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>

      {/* NEW CONVERSATION MODAL */}
      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        academyUuid={academyUuid}
        courseUuid={courseUuid}
        studentUuid={user?.id || 'usr-student-01'}
        studentName={user?.fullName || 'Alex Rivers'}
        studentAvatar={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
        theme={theme}
        onSuccess={(convUuid) => {
          setToastMessage('Private conversation started!');
          setTimeout(() => setToastMessage(null), 3000);
          handleSelectConversation(convUuid);
        }}
      />

      {/* MOBILE MORE MENU / DETAILS SHEET */}
      {activeConversation && (
        <Modal
          isOpen={isMobileMoreMenuOpen}
          onClose={() => setIsMobileMoreMenuOpen(false)}
          title="Conversation Options"
          maxWidth="sm"
        >
          <div className="space-y-1 font-sans text-xs py-1">
            <button
              type="button"
              onClick={() => {
                setIsMobileMoreMenuOpen(false);
                setIsMobileDetailsOpen(true);
              }}
              className="w-full p-3 rounded-xl font-semibold flex items-center gap-3 hover:bg-slate-100 text-slate-800 cursor-pointer"
            >
              <Info className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span>View Details &amp; Shared Files</span>
            </button>

            {activeConversation.status === 'resolved' ? (
              <button
                type="button"
                onClick={() => {
                  reopenConversation(activeConversation.uuid);
                  setIsMobileMoreMenuOpen(false);
                }}
                className="w-full p-3 rounded-xl font-semibold flex items-center gap-3 hover:bg-emerald-50 text-emerald-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Reopen Conversation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  markConversationResolved(activeConversation.uuid);
                  setIsMobileMoreMenuOpen(false);
                }}
                className="w-full p-3 rounded-xl font-semibold flex items-center gap-3 hover:bg-emerald-50 text-emerald-700 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Mark as Resolved</span>
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* MOBILE DETAILS MODAL */}
      {activeConversation && isMobileDetailsOpen && (
        <Modal
          isOpen={isMobileDetailsOpen}
          onClose={() => setIsMobileDetailsOpen(false)}
          title="Conversation Details"
          maxWidth="md"
        >
          <ConversationDetailsPanel
            conversation={activeConversation}
            messages={activeMessages}
            onCloseMobile={() => setIsMobileDetailsOpen(false)}
            theme={theme}
          />
        </Modal>
      )}
    </div>
  );
};
