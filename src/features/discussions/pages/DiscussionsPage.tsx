import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Paperclip,
  Trash2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  User,
  Building2,
  Plus,
  X,
  MessageCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useDiscussionStore, type DiscussionPost, type DiscussionAttachment } from '../../../stores/discussion.store';
import { formatFileSize } from '../../learning/utils/resourceAccessResolver';

import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';

export const DiscussionsPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const student = useAuthStore((state) => state.student);

  const posts = useDiscussionStore((state) => state.posts);
  const addPost = useDiscussionStore((state) => state.addPost);
  const addReply = useDiscussionStore((state) => state.addReply);
  const deletePost = useDiscussionStore((state) => state.deletePost);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const course = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);
  const studentUuid = student?.uuid || 'std-production-1';

  const [newPostContent, setNewPostContent] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<DiscussionAttachment | null>(null);
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [activeReplyPostUuid, setActiveReplyPostUuid] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const coursePosts = useMemo(() => {
    return posts.filter((p) => p.status === 'active' && p.courseUuid === courseUuid);
  }, [posts, courseUuid]);

  const totalPages = Math.ceil(coursePosts.length / pageSize) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return coursePosts.slice(start, start + pageSize);
  }, [coursePosts, currentPage, pageSize]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedAttachment) return;

    addPost({
      academyUuid,
      courseUuid,
      authorUuid: studentUuid,
      authorName: student?.name || 'Alex Student',
      authorRole: 'student',
      content: newPostContent.trim(),
      attachments: selectedAttachment ? [selectedAttachment] : undefined,
    });

    setNewPostContent('');
    setSelectedAttachment(null);
  };

  const handleCreateReply = (postUuid: string) => {
    const text = replyInputMap[postUuid];
    if (!text || !text.trim()) return;

    addReply({
      postUuid,
      authorUuid: studentUuid,
      authorName: student?.name || 'Alex Student',
      authorRole: 'student',
      content: text.trim(),
    });

    setReplyInputMap((prev) => ({ ...prev, [postUuid]: '' }));
    setActiveReplyPostUuid(null);
  };

  const handleAttachMockFile = () => {
    setSelectedAttachment({
      attachmentUuid: `att-${Date.now()}`,
      fileName: 'architecture_diagram.png',
      mimeType: 'image/png',
      fileSize: 552960, // 540 KB
      fileUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    });
  };

  const renderRoleBadge = (role: 'student' | 'academy' | 'instructor') => {
    if (role === 'instructor') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 uppercase tracking-wide">
          Instructor
        </span>
      );
    }
    if (role === 'academy') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 uppercase tracking-wide">
          Academy
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
        Student
      </span>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12">
      {/* PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs">
        <PageHeader
          title="Course Discussions"
          description="Ask questions, share project notes, and collaborate with your fellow enrolled students and instructors."
          badge={
            <Badge variant="info" size="sm" className="font-semibold text-[11px]">
              Enrolled Students + Instructors
            </Badge>
          }
        />
      </Card>

      {/* POST COMPOSER FORM */}
      <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Start a Course Discussion</h3>
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            rows={3}
            placeholder="Write your question or discussion post..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {selectedAttachment && (
            <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate font-semibold text-[11px]">{selectedAttachment.fileName}</span>
                <span className="text-[10px] text-slate-400">• {formatFileSize(selectedAttachment.fileSize)}</span>
              </div>
              <button type="button" onClick={() => setSelectedAttachment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleAttachMockFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              <Paperclip className="w-4 h-4" /> Attach File
            </button>

            <Button
              type="submit"
              disabled={!newPostContent.trim() && !selectedAttachment}
              leftIcon={<Plus className="w-4 h-4 shrink-0" />}
              className="font-semibold px-5 min-h-[42px] bg-blue-600 text-white rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Publish Post
            </Button>
          </div>
        </form>
      </Card>

      {/* DISCUSSION FEED */}
      <div className="space-y-4">
        <h2 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Community Posts</h2>

        {paginatedPosts.length > 0 ? (
          <div className="space-y-4">
            {paginatedPosts.map((post) => {
              const replies = useDiscussionStore.getState().getPostReplies(post.postUuid);
              const isReplying = activeReplyPostUuid === post.postUuid;

              return (
                <Card key={post.postUuid} padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3">
                  {/* POST HEADER */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {post.authorName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">{post.authorName}</span>
                          {renderRoleBadge(post.authorRole)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {post.authorUuid === studentUuid && (
                      <button
                        type="button"
                        onClick={() => deletePost(post.postUuid)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* POST CONTENT */}
                  <p className="text-slate-800 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* ATTACHMENTS */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {post.attachments.map((att) => (
                        <div key={att.attachmentUuid} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate font-semibold text-[11px] text-slate-800">{att.fileName}</span>
                            <span className="text-[10px] text-slate-400">• {formatFileSize(att.fileSize)}</span>
                          </div>
                          <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* REPLIES SECTION */}
                  {replies.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block">Replies ({replies.length})</span>
                      <div className="space-y-2 pl-3 border-l-2 border-slate-200">
                        {replies.map((reply) => (
                          <div key={reply.replyUuid} className="p-2.5 bg-slate-50/80 rounded-xl space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{reply.authorName}</span>
                                {renderRoleBadge(reply.authorRole)}
                              </div>
                              <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-700 text-xs leading-relaxed">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REPLY COMPOSER TRIGGER */}
                  <div className="pt-2">
                    {isReplying ? (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyInputMap[post.postUuid] || ''}
                          onChange={(e) => setReplyInputMap({ ...replyInputMap, [post.postUuid]: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setActiveReplyPostUuid(null)} className="h-8">
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleCreateReply(post.postUuid)} className="h-8 bg-blue-600 text-white">
                            Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveReplyPostUuid(post.postUuid)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Reply to Post
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        ) : (
          <EmptyState
            icon={<MessageSquare className="w-7 h-7 text-slate-400" />}
            title="No Community Discussions Yet"
            description="Start the first conversation with your course peers and instructors above."
          />
        )}
      </div>
    </div>
  );
};
