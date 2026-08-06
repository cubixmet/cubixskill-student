import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Reply,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';
import type { PersonalMessage } from '../store/personal-chat.store';
import { Modal } from '../../../components/ui/Modal';

interface MessageItemProps {
  message: PersonalMessage;
  quotedMessage?: PersonalMessage;
  onReply: (message: PersonalMessage) => void;
  onDelete?: (messageUuid: string) => void;
  onEdit?: (messageUuid: string, newContent: string) => void;
  onRetry?: (messageUuid: string) => void;
  theme: {
    primaryColor: string;
    primaryHover: string;
    primarySoft: string;
  };
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  quotedMessage,
  onReply,
  onDelete,
  onEdit,
  onRetry,
  theme,
}) => {
  const isStudent = message.senderRole === 'student';

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(message.uuid, editContent.trim());
      setIsEditing(false);
    }
  };

  const scrollToOriginalMessage = (targetUuid: string) => {
    const el = document.getElementById(`msg-${targetUuid}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 2000);
    }
  };

  const renderDeliveryStatus = () => {
    if (!isStudent) return null;

    switch (message.deliveryStatus) {
      case 'sending':
        return (
          <span title="Sending...">
            <Clock className="w-3 h-3 text-slate-300 animate-spin" />
          </span>
        );
      case 'sent':
        return (
          <span title="Sent">
            <Check className="w-3 h-3 text-slate-200" />
          </span>
        );
      case 'delivered':
        return (
          <span title="Delivered">
            <CheckCheck className="w-3 h-3 text-slate-200" />
          </span>
        );
      case 'seen':
        return (
          <span title="Seen by Instructor">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-300 font-bold" />
          </span>
        );
      case 'failed':
        return (
          <button
            type="button"
            onClick={() => onRetry?.(message.uuid)}
            className="flex items-center gap-1 text-[10px] text-rose-200 font-semibold hover:underline cursor-pointer"
            title="Failed to send. Click to retry."
          >
            <AlertCircle className="w-3 h-3 text-rose-300" /> Retry
          </button>
        );
      default:
        return null;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      id={`msg-${message.uuid}`}
      className={`group flex items-start gap-2.5 my-3 transition-all duration-300 ${
        isStudent ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* SENDER AVATAR */}
      <img
        src={message.senderAvatar}
        alt={message.senderName}
        className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 mt-1"
      />

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isStudent ? 'items-end text-right' : 'items-start text-left'}`}>
        {/* SENDER META HEADER */}
        <div className={`flex items-center gap-2 text-[11px] text-slate-400 font-normal ${isStudent ? 'justify-end' : 'justify-start'}`}>
          <span className="font-semibold text-slate-900">{message.senderName}</span>
          {!isStudent && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              ★ Instructor
            </span>
          )}
          <span>•</span>
          <span>{formatTime(message.createdAt)}</span>
          {message.editedAt && <span className="italic text-[10px] text-slate-400">(edited)</span>}
        </div>

        {/* QUOTED REPLY PREVIEW BOX */}
        {quotedMessage && (
          <button
            type="button"
            onClick={() => scrollToOriginalMessage(quotedMessage.uuid)}
            className={`w-full p-2 rounded-xl text-left font-sans text-xs border transition-all cursor-pointer block ${
              isStudent
                ? 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                : 'bg-slate-100/90 border-slate-200/90 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <span className="font-semibold text-[11px] block truncate text-amber-500">
              Replying to {quotedMessage.senderName}
            </span>
            <span className="text-[11px] line-clamp-1 opacity-90">{quotedMessage.content}</span>
          </button>
        )}

        {/* MESSAGE BUBBLE */}
        <div
          className={`p-3.5 rounded-2xl text-xs md:text-sm font-normal leading-relaxed shadow-2xs relative ${
            isStudent
              ? 'text-white rounded-tr-xs'
              : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs'
          }`}
          style={{
            backgroundColor: isStudent ? theme.primaryColor : undefined,
          }}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900"
                rows={3}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-[11px] rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-2.5 py-1 text-[11px] rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line break-words text-xs md:text-[14px]">{message.content}</p>
          )}

          {/* ATTACHMENTS LIST IN BUBBLE */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2 pt-2.5 mt-2 border-t border-slate-200/40">
              {message.attachments.map((att) => (
                <div key={att.id} className="space-y-1">
                  {att.type === 'image' && att.url !== '#' ? (
                    <div className="relative group/img overflow-hidden rounded-xl border border-slate-200 max-w-xs">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-36 object-cover cursor-pointer transition-transform duration-300 group-hover/img:scale-105"
                        onClick={() => setPreviewImage(att.url)}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(att.url)}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isStudent ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 shrink-0 text-amber-500" />
                        <div className="min-w-0">
                          <span className="font-semibold block truncate">{att.name}</span>
                          {att.size && <span className="text-[10px] opacity-75 font-mono">{att.size}</span>}
                        </div>
                      </div>
                      <a
                        href={att.url || '#'}
                        download={att.name}
                        onClick={(e) => att.url === '#' && e.preventDefault()}
                        className={`p-1.5 rounded-lg hover:bg-slate-200/30 transition-all shrink-0 cursor-pointer ${
                          isStudent ? 'text-white' : 'text-slate-600'
                        }`}
                        title="Download File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TIME & DELIVERY TICKS INSIDE BUBBLE */}
          <div
            className={`flex items-center justify-end gap-1 text-[10px] font-normal pt-1.5 opacity-90 ${
              isStudent ? 'text-white/80' : 'text-slate-400'
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {renderDeliveryStatus()}
          </div>
        </div>

        {/* QUICK ACTION TOOLBAR (HOVER) */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-slate-400 pt-0.5 ${isStudent ? 'justify-end' : 'justify-start'}`}>
          <button
            type="button"
            onClick={() => onReply(message)}
            className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            title="Reply to message"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {isStudent && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                title="Edit message"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(message.uuid)}
                  className="p-1 rounded hover:bg-rose-100 hover:text-rose-600 flex items-center gap-1 cursor-pointer text-slate-400"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <Modal isOpen={Boolean(previewImage)} onClose={() => setPreviewImage(null)} title="Image Attachment Preview" maxWidth="xl">
          <div className="space-y-3 text-center">
            <img src={previewImage} alt="Attachment" className="max-h-[70vh] w-auto mx-auto rounded-xl shadow-lg border border-slate-200 object-contain" />
            <div className="flex justify-end gap-2">
              <a
                href={previewImage}
                download="chat-image.png"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs inline-flex items-center gap-2 hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Full Image
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
