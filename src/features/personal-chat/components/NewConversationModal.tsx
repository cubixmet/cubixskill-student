import React, { useState } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  usePersonalChatStore,
  type RelatedItemType,
  type ChatAttachment,
} from '../store/personal-chat.store';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyUuid: string;
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentAvatar: string;
  theme: {
    primaryColor: string;
    primaryHover: string;
    primarySoft: string;
  };
  onSuccess: (newConversationUuid: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  academyUuid,
  courseUuid,
  studentUuid,
  studentName,
  studentAvatar,
  theme,
  onSuccess,
}) => {
  const createConversation = usePersonalChatStore((state) => state.createConversation);

  const [recipientRole, setRecipientRole] = useState('Course Instructor');
  const [subject, setSubject] = useState('');
  const [relatedType, setRelatedType] = useState<RelatedItemType>('General Course Question');
  const [relatedTitle, setRelatedTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Simulate attachment parsing
    setTimeout(() => {
      const newAttachments: ChatAttachment[] = Array.from(files).map((file, idx) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let type: ChatAttachment['type'] = 'document';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) type = 'image';
        else if (ext === 'pdf') type = 'pdf';
        else if (ext === 'zip') type = 'zip';

        const sizeKb = (file.size / 1024).toFixed(1);

        return {
          id: `att-${Date.now()}-${idx}`,
          name: file.name,
          type,
          size: `${sizeKb} KB`,
          url: type === 'image' ? URL.createObjectURL(file) : '#',
        };
      });

      setAttachments((prev) => [...prev, ...newAttachments]);
      setIsUploading(false);
    }, 300);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const convUuid = createConversation({
      academyUuid,
      courseUuid,
      studentUuid,
      studentName,
      studentAvatar,
      recipientRole,
      subject: subject.trim(),
      relatedType,
      relatedTitle: relatedTitle.trim() || undefined,
      initialMessage: message.trim(),
      attachments,
    });

    // Reset form
    setSubject('');
    setMessage('');
    setRelatedTitle('');
    setAttachments([]);
    onClose();
    onSuccess(convUuid);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Private Conversation"
      subtitle="Send a private message to your course instructor or support staff."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-left">
        {/* RECIPIENT SELECTION */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-900">Recipient *</label>
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value)}
            className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden bg-white cursor-pointer"
            style={{ borderColor: '#E2E8F0' }}
          >
            <option value="Course Instructor">Course Instructor (Dr. Vikramaditya Rao)</option>
            <option value="Co-Instructor">Co-Instructor</option>
            <option value="Course Support">Course Support (Priya Sharma)</option>
            <option value="Authorized Staff">Authorized Staff</option>
          </select>
        </div>

        {/* SUBJECT */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-900">Subject *</label>
          <input
            type="text"
            placeholder="Brief subject of your question or issue..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            style={{
              borderColor: '#E2E8F0',
            }}
            required
          />
        </div>

        {/* RELATED ITEM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-900">Related Category</label>
            <select
              value={relatedType}
              onChange={(e) => setRelatedType(e.target.value as RelatedItemType)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden bg-white cursor-pointer"
            >
              <option value="General Course Question">General Course Question</option>
              <option value="Module">Module</option>
              <option value="Lesson">Lesson</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Live Class">Live Class</option>
              <option value="Certificate">Certificate</option>
              <option value="Technical Support">Technical Support</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-900">Related Item Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Module 3, Assignment 2, etc."
              value={relatedTitle}
              onChange={(e) => setRelatedTitle(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* INITIAL MESSAGE */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-900">Message *</label>
          <textarea
            rows={4}
            placeholder="Type your message details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            required
          />
        </div>

        {/* ATTACHMENT UPLOAD & PREVIEW */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-900">Attachments (Optional)</label>
          <div className="relative border-2 border-dashed border-slate-200 p-4 rounded-xl text-center space-y-1 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Paperclip className="w-5 h-5 text-slate-400 mx-auto" />
            <span className="font-semibold text-xs text-slate-700 block">
              {isUploading ? 'Uploading files...' : 'Click or drop images, PDFs, ZIPs, or documents'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Max size 25MB per file</span>
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  {att.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className="truncate flex-1 min-w-0">{att.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-1 hover:text-red-600 text-slate-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="font-semibold">
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            style={{ backgroundColor: theme.primaryColor }}
            className="font-semibold text-white hover:opacity-90 cursor-pointer"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send Message
          </Button>
        </div>
      </form>
    </Modal>
  );
};
