import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Paperclip,
  CheckCircle,
  Clock,
  MessageSquare,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import type {
  PersonalConversation,
  PersonalMessage,
  ConversationStatus,
} from '../store/personal-chat.store';

interface ConversationListProps {
  conversations: PersonalConversation[];
  activeConversationUuid?: string;
  onSelectConversation: (uuid: string) => void;
  onOpenNewModal: () => void;
  messagesMap: Record<string, PersonalMessage[]>;
  theme: {
    primaryColor: string;
    primaryHover: string;
    primarySoft: string;
  };
}

export type FilterTab = 'All' | 'Unread' | 'Open' | 'Waiting for Reply' | 'Resolved' | 'With Attachments';
export type SortOption = 'Latest Activity' | 'Oldest' | 'Unread First';

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationUuid,
  onSelectConversation,
  onOpenNewModal,
  messagesMap,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [sortOption, setSortOption] = useState<SortOption>('Latest Activity');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filteredAndSortedConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        const msgs = messagesMap[conv.uuid] || [];
        const lastMsg = msgs[msgs.length - 1];
        const searchLower = searchQuery.toLowerCase();

        const matchesSearch =
          conv.subject.toLowerCase().includes(searchLower) ||
          conv.instructorName.toLowerCase().includes(searchLower) ||
          (conv.relatedTitle && conv.relatedTitle.toLowerCase().includes(searchLower)) ||
          (lastMsg && lastMsg.content.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;

        switch (activeFilter) {
          case 'Unread':
            return conv.unreadCount > 0;
          case 'Open':
            return conv.status === 'open';
          case 'Waiting for Reply':
            return conv.status === 'waiting';
          case 'Resolved':
            return conv.status === 'resolved';
          case 'With Attachments':
            return msgs.some((m) => m.attachments && m.attachments.length > 0);
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (sortOption === 'Oldest') {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        if (sortOption === 'Unread First') {
          if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [conversations, messagesMap, searchQuery, activeFilter, sortOption]);

  const getStatusBadge = (status: ConversationStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open
          </span>
        );
      case 'waiting':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-amber-500" /> Waiting for Instructor
          </span>
        );
      case 'replied':
        return (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1"
            style={{
              backgroundColor: theme.primarySoft,
              color: theme.primaryColor,
              borderColor: `${theme.primaryColor}40`,
            }}
          >
            <CheckCircle className="w-2.5 h-2.5" /> Instructor Replied
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5 text-slate-500" /> Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden font-sans text-xs">
      {/* PANEL HEADER */}
      <div className="p-3.5 border-b border-slate-100 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Conversations</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {conversations.length}
            </span>
          </div>

          <Button
            size="sm"
            onClick={onOpenNewModal}
            style={{ backgroundColor: theme.primaryColor }}
            className="font-semibold text-white px-3 h-8 text-xs cursor-pointer hover:opacity-90"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New
          </Button>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[38px] pl-8 pr-7 rounded-[10px] border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* FILTER & SORT BAR (DESKTOP) */}
        <div className="flex items-center justify-between gap-1 pt-1">
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {(['All', 'Unread', 'Open', 'Waiting for Reply', 'Resolved', 'With Attachments'] as const).map((filter) => {
              const isSelected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected ? 'shadow-2xs border' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? theme.primarySoft : undefined,
                    color: isSelected ? theme.primaryColor : undefined,
                    borderColor: isSelected ? `${theme.primaryColor}50` : undefined,
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0 md:hidden cursor-pointer"
            title="Filter Options"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CONVERSATION LIST BODY */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 hide-scrollbar">
        {filteredAndSortedConversations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <p className="font-semibold text-slate-700">No private conversations yet.</p>
              <p className="text-slate-400 font-normal text-[11px] mt-0.5">
                Ask your instructor a question when you need help.
              </p>
            </div>
            <Button
              size="sm"
              onClick={onOpenNewModal}
              style={{ backgroundColor: theme.primaryColor }}
              className="font-semibold text-white px-4 h-9 cursor-pointer"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Start Conversation
            </Button>
          </div>
        ) : (
          filteredAndSortedConversations.map((conv) => {
            const isSelected = activeConversationUuid === conv.uuid;
            const msgs = messagesMap[conv.uuid] || [];
            const lastMsg = msgs[msgs.length - 1];
            const hasAttachment = msgs.some((m) => m.attachments && m.attachments.length > 0);

            return (
              <button
                key={conv.uuid}
                type="button"
                onClick={() => onSelectConversation(conv.uuid)}
                className={`w-full p-3.5 text-left transition-all cursor-pointer relative flex flex-col gap-1.5 ${
                  isSelected ? 'border-l-4 shadow-2xs' : 'hover:bg-slate-50/80'
                }`}
                style={{
                  backgroundColor: isSelected ? theme.primarySoft : undefined,
                  borderLeftColor: isSelected ? theme.primaryColor : 'transparent',
                }}
              >
                {/* INSTRUCTOR AVATAR, NAME & TIME */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={conv.instructorAvatar}
                        alt={conv.instructorName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                      {conv.instructorStatus === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-900 block truncate leading-tight">
                        {conv.instructorName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal truncate block">
                        {conv.instructorRole}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400 font-normal">{formatTime(conv.updatedAt)}</span>
                    {conv.unreadCount > 0 && (
                      <span
                        className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-2xs animate-pulse"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* SUBJECT */}
                <h3 className="text-xs font-semibold text-slate-900 line-clamp-1 leading-snug">
                  {conv.subject}
                </h3>

                {/* LATEST MESSAGE PREVIEW */}
                {lastMsg && (
                  <p className="text-[11px] text-slate-500 font-normal line-clamp-1 leading-normal">
                    {lastMsg.senderRole === 'student' ? 'You: ' : ''}
                    {lastMsg.content}
                  </p>
                )}

                {/* STATUS & ATTACHMENT FOOTER */}
                <div className="flex items-center justify-between pt-1">
                  <div>{getStatusBadge(conv.status)}</div>
                  {hasAttachment && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* MOBILE FILTER BOTTOM SHEET MODAL */}
      <Modal
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter &amp; Sort Conversations"
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-2">
            <label className="block font-semibold text-slate-900">Filter By Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['All', 'Unread', 'Open', 'Waiting for Reply', 'Resolved', 'With Attachments'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab);
                    setIsFilterSheetOpen(false);
                  }}
                  className={`p-2.5 rounded-xl font-semibold border text-center transition-all cursor-pointer ${
                    activeFilter === tab ? 'shadow-2xs' : 'border-slate-200 text-slate-700 bg-white'
                  }`}
                  style={{
                    backgroundColor: activeFilter === tab ? theme.primarySoft : undefined,
                    color: activeFilter === tab ? theme.primaryColor : undefined,
                    borderColor: activeFilter === tab ? theme.primaryColor : undefined,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-900">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 bg-white text-xs font-semibold text-slate-900"
            >
              <option value="Latest Activity">Latest Activity</option>
              <option value="Oldest">Oldest First</option>
              <option value="Unread First">Unread First</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
