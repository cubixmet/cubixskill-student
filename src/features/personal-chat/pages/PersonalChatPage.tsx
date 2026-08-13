import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  X,
  Building2,
  BookOpen,
  ChevronDown,
  Trash2,
  FileArchive,
  Download,
  Eye,
  CheckCheck,
} from 'lucide-react';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { useAuthStore } from '../../../stores/auth.store';
import {
  usePersonalChatStore,
  type PersonalMessage,
  type ChatAttachment,
  type ChatContext,
} from '../store/personal-chat.store';

export const PersonalChatPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const student = useAuthStore((state) => state.student);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const course = courses.find((c) => c.academyUuid === academyUuid && (c.uuid === courseUuid || c.courseUuid === courseUuid));
  const studentUuid = student?.uuid || 'std-production-1';
  const theme = academy?.theme || { primaryColor: '#2563EB' };

  // Personal Chat Store
  const conversations = usePersonalChatStore((state) => state.conversations);
  const messagesMap = usePersonalChatStore((state) => state.messages);
  const sendMessage = usePersonalChatStore((state) => state.sendMessage);
  const deleteStudentMessage = usePersonalChatStore((state) => state.deleteStudentMessage);

  // Direct Student ↔ Academy Single Conversation
  const activeConversation =
    conversations.find((c) => c.studentUuid === studentUuid && c.academyUuid === academyUuid) || conversations[0];

  const allMessages: PersonalMessage[] = activeConversation
    ? messagesMap[activeConversation.uuid] || []
    : [];

  // Message History Pagination State
  const [displayedCount, setDisplayedCount] = useState<number>(15);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const visibleMessages = allMessages.slice(Math.max(0, allMessages.length - displayedCount));
  const hasOlderMessages = allMessages.length > displayedCount;

  // Form State
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<ChatAttachment | null>(null);
  const [chatContext, setChatContext] = useState<ChatContext | null>({
    courseTitle: course?.title || 'Full Stack React 19 & Cloud Architecture',
    lessonTitle: '1.1 React 19 Compiler Mechanics',
  });

  // Scroll & Position Tracking
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message on initial load after skeleton resolve
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, 150);
    return () => clearTimeout(timer);
  }, [activeConversation?.uuid]);

  // Handle scroll events for "isNearBottom" & "Load older" scroll anchoring
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 120;

    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom && distanceFromBottom > 200);
  };

  // Scroll to latest message on new message if near bottom
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessages.length, isNearBottom]);

  const scrollToBottomManual = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setShowScrollToBottom(false);
  };

  // Load older messages while preserving scroll height position
  const handleLoadOlderMessages = () => {
    if (isLoadingOlder || !messagesContainerRef.current) return;
    setIsLoadingOlder(true);
    const container = messagesContainerRef.current;
    const oldScrollHeight = container.scrollHeight;

    setTimeout(() => {
      setDisplayedCount((prev) => prev + 15);
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        }
        setIsLoadingOlder(false);
      });
    }, 300);
  };

  // Auto-growing textarea handler (1 to 4 rows)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (composerError) setComposerError(null);

    const target = e.target;
    target.style.height = 'auto';
    const newHeight = Math.min(target.scrollHeight, 120);
    target.style.height = `${Math.max(42, newHeight)}px`;
  };

  // File Upload Handler with Validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setComposerError('File size exceeds 10MB limit.');
      setTimeout(() => setComposerError(null), 4000);
      return;
    }

    const type: ChatAttachment['type'] = file.type.startsWith('image/')
      ? 'image'
      : file.type.includes('pdf')
      ? 'pdf'
      : 'document';

    setSelectedFile({
      id: `att-${Date.now()}`,
      name: file.name,
      type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
    });
    setComposerError(null);
  };

  // Fallback Mock Attachment if input canceled
  const handleAttachMock = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;
    if (!activeConversation) return;

    sendMessage({
      conversationUuid: activeConversation.uuid,
      senderUuid: studentUuid,
      senderName: student?.name || 'Alex Student',
      senderAvatar: student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      senderRole: 'student',
      content: messageInput.trim(),
      attachments: selectedFile ? [selectedFile] : [],
    });

    setMessageInput('');
    setSelectedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const formatDateGroup = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] min-h-0 max-w-5xl mx-auto w-full font-sans text-xs text-left bg-white sm:rounded-2xl sm:border border-slate-200 shadow-2xs overflow-hidden">
      {/* 1. COMPACT ACADEMY CHAT HEADER */}
      <header className="px-3 sm:px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2.5 border-b border-slate-800 shrink-0 z-10 min-h-[56px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img
            src={academy?.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}
            alt={academy?.name || 'Academy Logo'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-700/80 shrink-0 shadow-xs"
          />

          <div className="min-w-0">
            <h1 className="font-semibold text-sm sm:text-base text-white truncate leading-tight">
              {academy?.name || 'CodeVerse Software Academy'}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Academy Support • Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MESSAGES HISTORY (SCROLLABLE ONLY AREA) */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/70 relative hide-scrollbar"
      >
        {/* LOAD OLDER MESSAGES BUTTON */}
        {hasOlderMessages && (
          <div className="text-center pt-1 pb-2">
            <button
              type="button"
              onClick={handleLoadOlderMessages}
              disabled={isLoadingOlder}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-white text-slate-600 border border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              {isLoadingOlder ? 'Loading older messages...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* INITIAL SKELETON LOADING STATE */}
        {isInitialLoading ? (
          <div className="space-y-3 p-2">
            <div className="flex justify-center my-2">
              <span className="text-[11px] font-medium text-slate-400 bg-white/80 border border-slate-200/60 px-3 py-1 rounded-full animate-pulse">
                Loading conversation...
              </span>
            </div>
            <div className="flex flex-col items-start space-y-1">
              <div className="w-48 h-12 bg-white rounded-2xl rounded-bl-xs border border-slate-200/80 animate-pulse" />
            </div>
            <div className="flex flex-col items-end space-y-1">
              <div className="w-56 h-14 bg-blue-200/60 rounded-2xl rounded-br-xs animate-pulse" />
            </div>
            <div className="flex flex-col items-start space-y-1">
              <div className="w-64 h-16 bg-white rounded-2xl rounded-bl-xs border border-slate-200/80 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* EMPTY CONVERSATION STATE */}
            {visibleMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2 max-w-sm mx-auto text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="font-semibold text-xs text-slate-900 block">Start a conversation with your academy</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Ask questions about your course curriculum, lessons, assignments, or account support.
                </p>
              </div>
            )}
          </>
        )}

        {/* MESSAGES LISTING */}
        {visibleMessages.map((msg, index) => {
          const isMe = msg.senderUuid === studentUuid || msg.senderRole === 'student';
          const prevMsg = visibleMessages[index - 1];
          const showDateSeparator =
            !prevMsg || formatDateGroup(prevMsg.createdAt) !== formatDateGroup(msg.createdAt);

          return (
            <React.Fragment key={msg.uuid}>
              {/* DATE SEPARATOR */}
              {showDateSeparator && (
                <div className="flex justify-center my-2">
                  <span className="text-[11px] font-medium text-slate-500 bg-white/90 border border-slate-200/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {formatDateGroup(msg.createdAt)}
                  </span>
                </div>
              )}

              {/* MESSAGE BUBBLE */}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                <div
                  className={`max-w-[85%] sm:max-w-[65%] min-w-0 p-3 rounded-2xl shadow-2xs space-y-1.5 ${
                    isMe
                      ? 'text-white rounded-br-xs'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'
                  }`}
                  style={{ backgroundColor: isMe ? theme.primaryColor : undefined }}
                >
                  {/* SENDER NAME (ACADEMY SIDE ONLY) */}
                  {!isMe && (
                    <span className="font-semibold text-[11px] text-slate-600 block truncate">
                      {msg.senderName || 'Academy Support'}
                    </span>
                  )}

                  {/* MESSAGE CONTENT */}
                  {msg.content && (
                    <p className="text-[14px] font-normal leading-relaxed break-words break-all whitespace-pre-line">
                      {msg.content}
                    </p>
                  )}

                  {/* ATTACHMENTS */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="rounded-xl overflow-hidden min-w-0">
                          {att.type === 'image' ? (
                            <div className="space-y-1">
                              <img
                                src={att.url}
                                alt={att.name}
                                className="max-h-48 rounded-lg object-cover w-full border border-black/10"
                              />
                              <span className="text-[10px] opacity-80 block truncate">{att.name}</span>
                            </div>
                          ) : (
                            <div
                              className={`p-2.5 rounded-xl flex items-center justify-between gap-2 border text-xs ${
                                isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-semibold text-[11px] block truncate">{att.name}</span>
                                  {att.size && <span className="text-[10px] opacity-75 block">{att.size}</span>}
                                </div>
                              </div>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 ${
                                  isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                }`}
                              >
                                View
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TIMESTAMP & READ TICK */}
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] font-normal opacity-75 ${
                      isMe ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-white/90 shrink-0" />}
                  </div>
                </div>

                {/* DELETE MESSAGE OPTION FOR STUDENT */}
                {isMe && (
                  <button
                    type="button"
                    onClick={() => deleteStudentMessage(activeConversation.uuid, msg.uuid)}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-medium px-1 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* BOTTOM SCROLL ANCHOR */}
        <div ref={messagesEndRef} className="h-1 pb-3" />
      </div>

      {/* FLOATING SCROLL TO LATEST BUTTON */}
      {showScrollToBottom && (
        <button
          type="button"
          onClick={scrollToBottomManual}
          className="absolute bottom-20 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-md hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>↓ Latest message</span>
        </button>
      )}

      {/* 3. CONTEXT REFERENCE CHIP */}
      {chatContext && (
        <div className="px-3 sm:px-4 py-1.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-950 font-semibold shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Regarding: {chatContext.lessonTitle || chatContext.courseTitle}</span>
          </div>
          <button
            type="button"
            aria-label="Remove context"
            onClick={() => setChatContext(null)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}

      {/* 4. ATTACHMENT UPLOAD PREVIEW CHIP */}
      {selectedFile && (
        <div className="px-3 sm:px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {selectedFile.type === 'image' ? (
              <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="truncate font-semibold text-[11px]">{selectedFile.name}</span>
            {selectedFile.size && <span className="text-[10px] text-slate-400 shrink-0">• {selectedFile.size}</span>}
          </div>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => setSelectedFile(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COMPOSER ERROR ALERT */}
      {composerError && (
        <div className="px-4 py-1.5 bg-rose-50 text-rose-700 text-[11px] font-medium border-t border-rose-200 shrink-0">
          {composerError}
        </div>
      )}

      {/* 5. WHATSAPP-STYLE COMPOSER */}
      <form
        onSubmit={handleSendMessage}
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        className="p-2 sm:p-3 bg-white border-t border-slate-200/90 flex items-end gap-2 shrink-0 z-10"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.zip"
        />

        <button
          type="button"
          aria-label="Attach file"
          onClick={handleAttachMock}
          className="h-11 w-11 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
        >
          <Paperclip className="h-5 w-5 shrink-0 text-slate-600" />
        </button>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={messageInput}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full min-h-[44px] max-h-[120px] px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-sans"
          />
        </div>

        <button
          type="submit"
          aria-label="Send message"
          disabled={!messageInput.trim() && !selectedFile}
          style={{ backgroundColor: theme.primaryColor }}
          className="h-11 w-11 shrink-0 rounded-full inline-flex items-center justify-center text-white shadow-xs hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="h-5 w-5 shrink-0 text-white" />
        </button>
      </form>
    </div>
  );
};
