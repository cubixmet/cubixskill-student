import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon, Reply } from 'lucide-react';
import type { PersonalMessage, ChatAttachment } from '../store/personal-chat.store';

interface MessageComposerProps {
  onSendMessage: (content: string, replyToUuid?: string, attachments?: ChatAttachment[]) => void;
  replyingToMessage?: PersonalMessage;
  onCancelReply?: () => void;
  isDisabled?: boolean;
  disabledReason?: string;
  theme: {
    primaryColor: string;
    primaryHover: string;
    primarySoft: string;
  };
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  replyingToMessage,
  onCancelReply,
  isDisabled = false,
  disabledReason,
  theme,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 2000;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ChatAttachment[] = Array.from(files).map((file, idx) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: ChatAttachment['type'] = 'document';
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) type = 'image';
      else if (ext === 'pdf') type = 'pdf';
      else if (ext === 'zip') type = 'zip';

      const sizeKb = (file.size / 1024).toFixed(1);

      return {
        id: `att-c-${Date.now()}-${idx}`,
        name: file.name,
        type,
        size: `${sizeKb} KB`,
        url: type === 'image' ? URL.createObjectURL(file) : '#',
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if ((!content.trim() && attachments.length === 0) || isDisabled) return;

    onSendMessage(content.trim(), replyingToMessage?.uuid, attachments);
    setContent('');
    setAttachments([]);
    if (onCancelReply) onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isDisabled) {
    return (
      <div className="p-4 bg-slate-100 border-t border-slate-200 text-center font-sans text-xs text-slate-500 font-medium">
        {disabledReason || 'This conversation is closed. You can no longer send messages.'}
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-slate-200/90 p-3 space-y-2 font-sans text-xs sticky bottom-0 z-20 shadow-lg">
      {/* QUOTED REPLY PREVIEW BAR */}
      {replyingToMessage && (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 block truncate">
                Replying to {replyingToMessage.senderName}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">{replyingToMessage.content}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ATTACHMENT PREVIEW CHIPS */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="p-1.5 px-2.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-800"
            >
              {att.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="truncate max-w-[120px]">{att.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                className="p-0.5 hover:text-red-600 text-slate-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* COMPOSER INPUT & ACTIONS */}
      <div className="flex items-end gap-2">
        {/* ATTACHMENT BUTTON */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shrink-0"
          title="Attach File or Image"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* TEXT AREA */}
        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder="Type your private message to the instructor... (Press Enter to send)"
            className="w-full min-h-[44px] max-h-32 p-3 pr-14 rounded-xl border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none"
            style={{
              borderColor: '#E2E8F0',
            }}
          />
          <span className="absolute right-3 bottom-2 text-[10px] text-slate-400 font-mono pointer-events-none">
            {content.length}/{MAX_CHARS}
          </span>
        </div>

        {/* SEND BUTTON */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() && attachments.length === 0}
          style={{
            backgroundColor: content.trim() || attachments.length > 0 ? theme.primaryColor : undefined,
          }}
          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            content.trim() || attachments.length > 0 ? 'hover:opacity-90 shadow-2xs' : 'bg-slate-300'
          }`}
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
