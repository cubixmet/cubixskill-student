import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Building2,
  CheckCheck,
  RefreshCw,
  Paperclip,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../stores/auth.store';
import { useCourseFeatures } from '../../../hooks/useCourseFeatures';
import { COURSE_FEATURE_KEYS } from '../../../constants/courseFeatures.constants';
import { normalizeChatMessage, type NormalizedChatMessage } from '../utils/chatNormalizer';

const inFlightRoomPromises = new Map<string, Promise<any>>();

const getWebSocketUrl = (roomId: string): string => {
  const envUrl = import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_API_HOST || 'localhost:8000';
  if (envUrl) {
    const base = envUrl.replace(/\/ws\/.*$/, '');
    return `${base}/ws/chat/${roomId}/`;
  }
  return `${protocol}//${host}/ws/chat/${roomId}/`;
};

export const PersonalChatPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const { isFeatureEnabled, isLoading: isFeatureLoading } = useCourseFeatures(courseUuid);

  // Real backend room & messages
  const [room, setRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Socket state
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<any>(null);
  const processedEventIdsRef = useRef<Set<string>>(new Set());

  // Academy setting state
  const [fileUploadEnabled, setFileUploadEnabled] = useState<boolean>(true);

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Academy Profile/Settings
  useEffect(() => {
    let mounted = true;
    apiClient.get('/api/v1/academy/profile/').then((res: any) => {
      const data = res?.data || res;
      if (mounted && data) {
        if (typeof data.personal_chat_file_upload_enabled === 'boolean') {
          setFileUploadEnabled(data.personal_chat_file_upload_enabled);
        }
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Form & UI state
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Fetch/create personal room & load history (idempotent / in-flight deduped)
  const loadChatRoom = useCallback(async () => {
    if (!courseUuid || !currentUser?.id) return;
    setIsInitialLoading(true);
    setError(null);

    try {
      const roomKey = `${courseUuid}:${currentUser.id}`;
      let roomPromise = inFlightRoomPromises.get(roomKey);
      if (!roomPromise) {
        roomPromise = apiClient.post('/api/v1/chat/rooms/get-or-create-personal/', {
          course_id: courseUuid,
          student_id: currentUser.id,
        }).finally(() => {
          inFlightRoomPromises.delete(roomKey);
        });
        inFlightRoomPromises.set(roomKey, roomPromise);
      }

      const res: any = await roomPromise;
      const roomData = res?.data || res;
      setRoom(roomData);

      // Load existing message history
      if (roomData?.id) {
        const msgRes: any = await apiClient.get(`/api/v1/chat/rooms/${roomData.id}/messages/`);
        const msgData = msgRes?.data || msgRes;
        const list = Array.isArray(msgData) ? msgData : msgData?.results || [];
        const normalizedList = list.map(normalizeChatMessage);
        const sortedList = [...normalizedList].sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          if (aTime !== bTime) return aTime - bTime;
          return String(a.id).localeCompare(String(b.id));
        });
        setMessages(sortedList);

        // Mark room read once via WebSocket if connected, otherwise queue
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'messages.read',
            last_read_message_id: sortedList.length > 0 ? sortedList[sortedList.length - 1].id : null,
          }));
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.detail || "Couldn't load personal chat.";
      setError(msg);
    } finally {
      setIsInitialLoading(false);
    }
  }, [courseUuid, currentUser?.id]);

  useEffect(() => {
    loadChatRoom();
  }, [loadChatRoom]);

  // 2. Private WebSocket connection
  const connectSocket = useCallback(() => {
    if (!room?.id) return;
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    setSocketStatus(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const wsUrl = getWebSocketUrl(room.id);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setSocketStatus('connected');
        if (reconnectAttemptsRef.current > 0) {
          // REST reconciliation on reconnect
          apiClient.get(`/api/v1/chat/rooms/${room.id}/messages/`).then((res: any) => {
            const data = res?.data || res;
            const list = Array.isArray(data) ? data : data?.results || [];
            setMessages(list.map(normalizeChatMessage));
          }).catch(() => {});
        }
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          if (!envelope || !envelope.type) return;

          if (envelope.event_id) {
            if (processedEventIdsRef.current.has(envelope.event_id)) return;
            processedEventIdsRef.current.add(envelope.event_id);
            if (processedEventIdsRef.current.size > 500) {
              const firstItem = processedEventIdsRef.current.values().next().value;
              if (firstItem) processedEventIdsRef.current.delete(firstItem);
            }
          }

          if (envelope.type === 'error') {
            if (envelope.code === 'CHAT_FILE_UPLOAD_DISABLED') {
              setUploadError('File uploads are disabled by your Academy.');
              setFileUploadEnabled(false);
            } else {
              setComposerError(envelope.detail || 'WebSocket error');
            }
          }

          if (['personal_message.created', 'chat_message.created', 'message.created'].includes(envelope.type) && envelope.data) {
            const newMsg = normalizeChatMessage(envelope.data);
            setMessages((prev) => {
              if (prev.some((m) => String(m.id) === String(newMsg.id))) return prev;
              const updated = [...prev, newMsg].sort((a, b) => {
                const aTime = new Date(a.createdAt).getTime();
                const bTime = new Date(b.createdAt).getTime();
                if (aTime !== bTime) return aTime - bTime;
                return String(a.id).localeCompare(String(b.id));
              });
              return updated;
            });

            const container = messagesContainerRef.current;
            if (container) {
              const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
              if (isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } catch {
          // ignore invalid frames
        }
      };

      ws.onclose = (evt) => {
        socketRef.current = null;
        setSocketStatus('disconnected');
        if (evt.code === 4001) return;

        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
        reconnectTimerRef.current = setTimeout(connectSocket, delay);
      };
    } catch {
      setSocketStatus('disconnected');
    }
  }, [room?.id]);

  useEffect(() => {
    if (room?.id) {
      connectSocket();
    }
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close(1000, 'Unmounted');
        socketRef.current = null;
      }
      setSocketStatus('disconnected');
    };
  }, [room?.id, connectSocket]);

  // 3. Auto-scroll on initial load & layout shifts
  useLayoutEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
      });
    }
  }, [messages.length]);

  // File selection & upload handler via backend storage service
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileUploadEnabled) return;

    setSelectedFile(file);
    setUploadError(null);
    setIsUploadingFile(true);

    const formData = new FormData();
    formData.append('file', file);
    if (courseUuid) formData.append('course_uuid', courseUuid);

    try {
      const res: any = await apiClient.postForm('/api/v1/storage/upload/', formData);
      const mediaItem = res?.data?.id
        ? res.data
        : res?.data?.data?.id
        ? res.data.data
        : res?.id
        ? res
        : null;

      if (mediaItem?.id) {
        setUploadedMediaId(String(mediaItem.id));
      } else {
        setUploadError('Upload succeeded but no media reference was returned.');
      }
    } catch (err: any) {
      setUploadError(err?.message || err?.response?.data?.detail || 'Failed to upload file.');
      setUploadedMediaId(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setUploadedMediaId(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const hasText = Boolean(messageInput.trim());
    const hasFile = Boolean(uploadedMediaId);

    if ((!hasText && !hasFile) || !room?.id || isSending || isUploadingFile) return;

    setIsSending(true);
    setComposerError(null);
    setUploadError(null);

    const contentToSend = messageInput.trim();
    const mediaIdsToSend = uploadedMediaId ? [uploadedMediaId] : [];

    setMessageInput('');
    setSelectedFile(null);
    setUploadedMediaId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = '42px';

    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const clientRequestId = String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9);
        socketRef.current.send(JSON.stringify({
          type: 'message.send',
          client_request_id: clientRequestId,
          content: contentToSend,
          media_file_ids: mediaIdsToSend,
        }));
      } else {
        const res: any = await apiClient.post(`/api/v1/chat/rooms/${room.id}/send-message/`, {
          content: contentToSend,
          media_file_ids: mediaIdsToSend,
        });
        const sentMsg = res?.data || res;
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(sentMsg.id))) return prev;
          const updated = [...prev, sentMsg].sort((a, b) => {
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            if (aTime !== bTime) return aTime - bTime;
            return String(a.id).localeCompare(String(b.id));
          });
          return updated;
        });
      }

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setMessageInput(contentToSend);
      if (err?.response?.data?.code === 'CHAT_FILE_UPLOAD_DISABLED' || err?.response?.status === 403) {
        setUploadError('File uploads are disabled by your Academy.');
        setFileUploadEnabled(false);
      } else {
        const msg = err?.response?.data?.detail || 'Failed to send message.';
        setComposerError(msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Feature gate check
  if (!isFeatureLoading && !isFeatureEnabled(COURSE_FEATURE_KEYS.ONE_TO_ONE_SESSION)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">1-to-1 Session Disabled</h2>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
          One-to-one session is not enabled for this course.
        </p>
        <Button size="sm" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom))] md:h-[calc(100vh-4rem)] min-h-0 max-w-5xl mx-auto w-full font-sans text-xs text-left bg-white dark:bg-[#111827] sm:rounded-2xl sm:border border-slate-200 dark:border-[#263244] shadow-2xs overflow-hidden">
      {/* 1. CHAT HEADER (NO VIDEO SESSION BUTTON) */}
      <header className="px-3 sm:px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2.5 border-b border-slate-800 shrink-0 z-10 min-h-[56px]">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-sm sm:text-base text-white truncate leading-tight">
              Personal Chat
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  socketStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="truncate">
                {socketStatus === 'connected' ? 'Connected • Instructor & Staff' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MESSAGES HISTORY (NORMAL CHRONOLOGICAL CONTINUOUS STACK) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto bg-slate-50/70 dark:bg-[#0B0F17] relative hide-scrollbar p-3 sm:p-4 space-y-2.5 flex flex-col"
      >
        {isInitialLoading ? (
          <div className="space-y-3 p-2">
            <Skeleton className="h-10 w-48 rounded-2xl" />
            <Skeleton className="h-14 w-64 rounded-2xl ml-auto bg-blue-200/50" />
            <Skeleton className="h-12 w-56 rounded-2xl" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <p className="text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
            <Button size="sm" onClick={loadChatRoom} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Try Again
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center p-6 text-center space-y-2 max-w-sm mx-auto text-slate-500 dark:text-[#94A3B8]">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] flex items-center justify-center text-slate-400 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] block">
              No messages yet.
            </span>
            <p className="text-[11px] leading-relaxed font-normal">
              Start a private conversation with your instructor regarding this course.
            </p>
          </div>
        ) : (
          <>
            {messages.map((rawMsg) => {
              const msg: NormalizedChatMessage = normalizeChatMessage(rawMsg);
              const currentUserId = String(
                currentUser?.id ??
                currentUser?.uuid ??
                (currentUser as any)?.user_id ??
                ''
              );
              const isMe = Boolean(currentUserId && msg.senderId && msg.senderId === currentUserId);

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                  <div
                    className={`max-w-[82%] sm:max-w-[72%] min-w-0 p-3 rounded-2xl shadow-2xs space-y-1 ${
                      isMe
                        ? 'bg-[#2563EB] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#263244] rounded-bl-xs'
                    }`}
                  >
                    {!isMe && (
                      <span className="font-semibold text-[11px] text-slate-600 dark:text-[#94A3B8] block truncate">
                        {msg.senderName || 'Instructor'}
                      </span>
                    )}

                    {/* Attachment rendering */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-1.5 space-y-1">
                        {msg.attachments.map((att: any) => (
                          <a
                            key={att.id}
                            href={att.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors ${
                              isMe
                                ? 'bg-blue-700/60 hover:bg-blue-700 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate flex-1">{att.original_name || 'Attachment'}</span>
                            <Download className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          </a>
                        ))}
                      </div>
                    )}

                    {msg.content && (
                      <p className="text-[13px] sm:text-[14px] font-normal leading-relaxed break-words whitespace-pre-line">
                        {msg.content}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] font-normal opacity-75 ${
                        isMe ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white/90 shrink-0" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </>
        )}
      </div>

      {/* 3. COMPOSER ERROR */}
      {composerError && (
        <div className="px-4 py-1.5 bg-rose-50 text-rose-700 text-[11px] font-medium border-t border-rose-200 shrink-0">
          {composerError}
        </div>
      )}

      {/* 4. COMPOSER */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 sm:p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#263244] flex flex-col gap-2 shrink-0 z-10 sticky bottom-0"
      >
        {/* Pending Attachment Preview / Upload Error */}
        {(selectedFile || uploadError) && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            {uploadError ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium truncate">{uploadError}</span>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">{selectedFile?.name}</span>
                {isUploadingFile ? (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold animate-pulse shrink-0">Uploading...</span>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">Ready</span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveSelectedFile}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Remove Attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 w-full">
          {fileUploadEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelection}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || isSending}
                className="h-10 w-10 p-0 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full min-h-[42px] max-h-[120px] px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-[#263244] bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-sans block"
            />
          </div>

          <button
            type="submit"
            aria-label="Send message"
            disabled={isSending || isUploadingFile || (!messageInput.trim() && !uploadedMediaId)}
            className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full inline-flex items-center justify-center bg-[#2563EB] text-[#FFFFFF] shadow-xs hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 h-4 sm:h-5 sm:w-5 shrink-0 text-[#FFFFFF]" />
          </button>
        </div>
      </form>
    </div>
  );
};
