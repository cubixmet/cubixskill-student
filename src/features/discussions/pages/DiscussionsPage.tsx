import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Send,
  RefreshCw,
  Paperclip,
  X,
  FileText,
  Download,
  Users,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../stores/auth.store';
import { useCourseFeatures } from '../../../hooks/useCourseFeatures';
import { COURSE_FEATURE_KEYS } from '../../../constants/courseFeatures.constants';
import { FeatureDisabledState } from '../../../components/ui/FeatureDisabledState';
import { CourseTabs } from '../../learning/components/CourseTabs';
import { isValidUuid } from '../../../utils/routeBuilder';
import { normalizeChatMessage, type NormalizedChatMessage } from '../../personal-chat/utils/chatNormalizer';

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

function formatMessageTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateString?: string): string {
  if (!dateString) return 'Today';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Today';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const DiscussionsPage: React.FC = () => {
  const { academyUuid = '', courseUuid = '' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const { isFeatureEnabled, isLoading: isFeatureLoading } = useCourseFeatures(courseUuid);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = String(currentUser?.id || (currentUser as any)?.user_id || '');

  // Room & Messages state
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Academy Profile for settings
  useEffect(() => {
    let mounted = true;
    apiClient.get('/api/v1/academy/profile/').then((res: any) => {
      const data = res?.data || res;
      if (mounted && data && typeof data.community_chat_file_upload_enabled === 'boolean') {
        setFileUploadEnabled(data.community_chat_file_upload_enabled);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Fetch / get-or-create canonical community room & initial history
  const loadCommunityRoom = useCallback(async () => {
    if (!isValidUuid(courseUuid)) {
      setError('Invalid Course ID');
      setIsInitialLoading(false);
      return;
    }
    setIsInitialLoading(true);
    setError(null);

    try {
      let roomPromise = inFlightRoomPromises.get(courseUuid);
      if (!roomPromise) {
        roomPromise = apiClient.post('/api/v1/chat/rooms/get-or-create-community/', {
          course_id: courseUuid,
        }).finally(() => {
          inFlightRoomPromises.delete(courseUuid);
        });
        inFlightRoomPromises.set(courseUuid, roomPromise);
      }

      const res: any = await roomPromise;
      const roomData = res?.data || res;
      setRoom(roomData);

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

        // Send initial read state over WebSocket if open
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'messages.read',
            last_read_message_id: sortedList.length > 0 ? sortedList[sortedList.length - 1].id : null,
          }));
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.detail || 'Could not load course community chat.';
      if (err?.response?.status === 403) {
        setError('Feature Disabled or Access Denied for Course Community Chat.');
      } else {
        setError(msg);
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, [courseUuid]);

  useEffect(() => {
    loadCommunityRoom();
  }, [loadCommunityRoom]);

  // Connect WebSocket to canonical RoomType.COURSE room
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
            if (envelope.code === 'COMMUNITY_CHAT_FILE_UPLOAD_DISABLED') {
              setUploadError('File uploads are disabled for Community Chat by your Academy.');
              setFileUploadEnabled(false);
            } else {
              setComposerError(envelope.detail || envelope.message || 'WebSocket error');
            }
          }

          if (['community_message.created', 'chat_message.created', 'message.created'].includes(envelope.type) && envelope.data) {
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
          // ignore
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

  useLayoutEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
      });
    }
  }, [messages.length]);

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

  // Handle Send Message (WebSocket ONLY)
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const hasText = Boolean(messageInput.trim());
    const hasFile = Boolean(uploadedMediaId);

    if ((!hasText && !hasFile) || !room?.id || isSending || isUploadingFile) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setComposerError('WebSocket disconnected. Reconnecting...');
      return;
    }

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
      const clientRequestId = String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9);
      socketRef.current.send(JSON.stringify({
        type: 'message.send',
        client_request_id: clientRequestId,
        content: contentToSend,
        media_file_ids: mediaIdsToSend,
      }));

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setMessageInput(contentToSend);
      setComposerError('Failed to transmit message over WebSocket.');
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

  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; msgs: NormalizedChatMessage[] }[] = [];
    messages.forEach((msg) => {
      const label = formatDateSeparator(msg.createdAt);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateLabel === label) {
        lastGroup.msgs.push(msg);
      } else {
        groups.push({ dateLabel: label, msgs: [msg] });
      }
    });
    return groups;
  }, [messages]);

  // Feature gate check
  if (!isFeatureLoading && !isFeatureEnabled(COURSE_FEATURE_KEYS.COURSE_DISCUSSION)) {
    return (
      <div className="space-y-5 sm:space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12">
        <CourseTabs academyUuid={academyUuid} courseUuid={courseUuid} activeTab="discussions" />
        <FeatureDisabledState featureName="Course Community Chat" />
      </div>
    );
  }

  const courseTitle = room?.course_title || room?.name || 'Course Community';

  return (
    <div className="space-y-4 font-sans text-xs text-left max-w-4xl mx-auto pb-6 flex flex-col h-[calc(100vh-100px)] min-h-[500px]">
      {/* Course Navigation Tabs */}
      <CourseTabs academyUuid={academyUuid} courseUuid={courseUuid} activeTab="discussions" />

      {/* Main Messenger Container */}
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col min-h-0 w-full">
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-[#0F172A] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {courseTitle} Group Chat
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                <span>Course Community</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span className={`capitalize ${socketStatus === 'connected' ? 'text-emerald-500 font-medium' : ''}`}>
                  {socketStatus}
                </span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadCommunityRoom}
            className="h-8 px-2 text-xs border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Message Thread */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-slate-50/70 dark:bg-[#0B0F19] min-h-0 relative hide-scrollbar"
        >
          <div className="min-h-full flex flex-col justify-end space-y-3">
            {isInitialLoading ? (
              <div className="p-4 space-y-3 my-auto">
                <Skeleton className="h-10 w-1/2 ml-auto rounded-2xl" />
                <Skeleton className="h-12 w-2/3 rounded-2xl" />
                <Skeleton className="h-10 w-1/3 ml-auto rounded-2xl" />
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-2 my-auto">
                <p className="text-rose-600 dark:text-rose-400 font-semibold text-xs">{error}</p>
                <Button size="sm" variant="outline" onClick={loadCommunityRoom}>
                  Try Again
                </Button>
              </div>
            ) : groupedMessages.length > 0 ? (
              groupedMessages.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2.5">
                  <div className="flex justify-center my-2 sticky top-1 z-10">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 shadow-2xs backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800/80">
                      {group.dateLabel}
                    </span>
                  </div>

                  {group.msgs.map((msg) => {
                    const isMine = Boolean(currentUserId && msg.senderId && msg.senderId === currentUserId);
                    const formattedTime = formatMessageTime(msg.createdAt);

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 w-full`}
                      >
                        {!isMine && (
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-1">
                            {msg.senderName || 'Member'}
                          </span>
                        )}

                        <div
                          className={`max-w-[85%] sm:max-w-[72%] p-3 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-2xs ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#263244] rounded-bl-xs'
                          }`}
                        >
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mb-1.5 space-y-1">
                              {msg.attachments.map((att: any) => (
                                <a
                                  key={att.id}
                                  href={att.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors ${
                                    isMine
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
                          {msg.content && <p className="whitespace-pre-line leading-relaxed break-words">{msg.content}</p>}
                        </div>

                        <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 font-normal">
                          {formattedTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2 my-auto">
                <Users className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">No community messages yet</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Send the first message to kick off the course community group chat.</p>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shrink-0 sticky bottom-0 z-20 space-y-2"
        >
          {(selectedFile || uploadError || composerError) && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              {uploadError || composerError ? (
                <span className="text-rose-600 dark:text-rose-400 font-medium truncate">
                  {uploadError || composerError}
                </span>
              ) : (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{selectedFile?.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                  </span>
                  {isUploadingFile && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 animate-pulse ml-1 shrink-0">
                      Uploading...
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveSelectedFile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelection}
              className="hidden"
            />

            {fileUploadEnabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || isSending}
                className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0"
                title="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            )}

            <div className="relative flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-blue-500 transition-all">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message to the course community..."
                rows={1}
                className="w-full px-3.5 py-2.5 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none max-h-28"
              />
            </div>

            <Button
              type="submit"
              disabled={(!messageInput.trim() && !uploadedMediaId) || isSending || isUploadingFile}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
