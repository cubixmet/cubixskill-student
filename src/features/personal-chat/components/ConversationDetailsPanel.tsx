import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Bot,
  Paperclip,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  usePersonalChatStore,
  type PersonalConversation,
  type PersonalMessage,
} from '../store/personal-chat.store';

interface ConversationDetailsPanelProps {
  conversation: PersonalConversation;
  messages: PersonalMessage[];
  onCloseMobile?: () => void;
  theme: {
    primaryColor: string;
    primaryHover: string;
    primarySoft: string;
  };
}

export const ConversationDetailsPanel: React.FC<ConversationDetailsPanelProps> = ({
  conversation,
  messages,
  onCloseMobile,
}) => {
  const markConversationResolved = usePersonalChatStore((state) => state.markConversationResolved);
  const reopenConversation = usePersonalChatStore((state) => state.reopenConversation);
  const muteConversation = usePersonalChatStore((state) => state.muteConversation);
  const simulateInstructorReply = usePersonalChatStore((state) => state.simulateInstructorReply);

  const [toast, setToast] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const sharedFiles = messages.flatMap((m) => m.attachments || []);

  const handleToggleMute = () => {
    const isMuted = !conversation.isMuted;
    muteConversation(conversation.uuid, isMuted);
    setToast(isMuted ? 'Notifications muted' : 'Notifications enabled');
    setTimeout(() => setToast(null), 2500);
  };

  const handleResolve = () => {
    markConversationResolved(conversation.uuid);
    setToast('Conversation marked as resolved.');
    setTimeout(() => setToast(null), 2500);
  };

  const handleReopen = () => {
    reopenConversation(conversation.uuid);
    setToast('Conversation reopened.');
    setTimeout(() => setToast(null), 2500);
  };

  const handleSimulateReply = () => {
    simulateInstructorReply(conversation.uuid);
    setToast('Mock instructor reply generated!');
    setTimeout(() => setToast(null), 2500);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    setReportReason('');
    setToast('Issue report sent to academy administration.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-full bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 overflow-y-auto hide-scrollbar font-sans text-xs text-left shadow-2xs relative">
      {/* MOBILE CLOSE HEADER */}
      {onCloseMobile && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 md:hidden">
          <span className="font-semibold text-slate-900 text-sm">Conversation Details</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOAST ALERT */}
      {toast && (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white font-semibold text-[11px] text-center shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      {/* 1. INSTRUCTOR / RECIPIENT CARD */}
      <div className="space-y-2 pb-3 border-b border-slate-100">
        <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">
          Conversation Participant
        </span>
        <div className="flex items-center gap-3">
          <img
            src={conversation.instructorAvatar}
            alt={conversation.instructorName}
            className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
          />
          <div className="min-w-0">
            <span className="font-semibold text-xs text-slate-900 block truncate">
              {conversation.instructorName}
            </span>
            <span className="text-[11px] text-slate-500 font-normal block truncate">
              {conversation.instructorRole}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  conversation.instructorStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px] text-slate-400 capitalize">
                {conversation.instructorStatus === 'online' ? 'Online Now' : 'Replies within 24 hours'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RELATED COURSE ITEM */}
      {conversation.relatedType && (
        <div className="space-y-1.5 pb-3 border-b border-slate-100">
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">
            Related Item
          </span>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase inline-block">
              {conversation.relatedType}
            </span>
            <p className="font-semibold text-slate-900 text-xs line-clamp-2">
              {conversation.relatedTitle || conversation.subject}
            </p>
          </div>
        </div>
      )}

      {/* 3. SHARED FILES GALLERY */}
      <div className="space-y-2 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
            Shared Files ({sharedFiles.length})
          </span>
        </div>

        {sharedFiles.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">No attachments shared yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sharedFiles.map((file) => (
              <div
                key={file.id}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-900 block truncate">{file.name}</span>
                    {file.size && <span className="text-[10px] text-slate-400 font-mono">{file.size}</span>}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ACTIONS & STATUS CONTROL */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">
          Actions
        </span>

        {conversation.status === 'resolved' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReopen}
            className="w-full font-semibold justify-center h-10 gap-2 cursor-pointer"
            leftIcon={<RotateCcw className="w-4 h-4 text-emerald-600" />}
          >
            Reopen Conversation
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleResolve}
            className="w-full font-semibold justify-center h-10 gap-2 cursor-pointer"
            leftIcon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          >
            Mark as Resolved
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleMute}
          className="w-full font-semibold justify-between h-10 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {conversation.isMuted ? (
              <BellOff className="w-4 h-4 text-rose-500" />
            ) : (
              <Bell className="w-4 h-4 text-slate-500" />
            )}
            <span>{conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {conversation.isMuted ? 'Muted' : 'Active'}
          </span>
        </Button>

        {/* SIMULATE INSTRUCTOR REPLY (TEST HELPER) */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSimulateReply}
          className="w-full font-semibold justify-center h-10 gap-2 cursor-pointer"
          leftIcon={<Bot className="w-4 h-4 text-amber-400" />}
        >
          Receive Mock Instructor Reply
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsReportModalOpen(true)}
          className="w-full font-semibold justify-start text-rose-600 hover:bg-rose-50 h-9 gap-2 cursor-pointer"
          leftIcon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
        >
          Report Issue
        </Button>
      </div>

      {/* REPORT ISSUE MODAL */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Conversation Issue"
        subtitle="Report an issue to the academy support administration."
        maxWidth="md"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4 font-sans text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-900">Reason for Report *</label>
            <textarea
              rows={4}
              placeholder="Describe the issue or inappropriate content..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" className="font-semibold">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
