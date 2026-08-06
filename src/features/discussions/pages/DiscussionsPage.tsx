import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Pin,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Send,
  Paperclip,
  CheckCircle2,
  X,
  FileText,
  Code,
  Sparkles,
  HelpCircle,
  Megaphone,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';

export type PostType =
  | 'Announcement'
  | 'Question'
  | 'Discussion'
  | 'Resource'
  | 'Assignment Discussion';

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'Instructor' | 'Student';
  createdAt: string;
  content: string;
  likes: number;
  isLiked?: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  type: PostType;
  authorName: string;
  authorAvatar: string;
  authorRole: 'Instructor' | 'Student';
  createdAt: string;
  isPinned?: boolean;
  likesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  viewsCount: number;
  attachments?: { name: string; size: string; type: 'pdf' | 'code' | 'image' | 'zip' }[];
  comments: CommentItem[];
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-101',
    title: '📢 Official Announcement: Live Masterclass & Capstone Guidelines',
    content: 'Welcome everyone! Today at 6:00 PM we will host the live masterclass on React 19 Compiler Optimizations. Please review the attached PDF roadmap before joining the session.',
    type: 'Announcement',
    authorName: 'Dr. Vikramaditya Rao',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    authorRole: 'Instructor',
    createdAt: '2 hours ago',
    isPinned: true,
    likesCount: 24,
    viewsCount: 142,
    attachments: [
      { name: 'React19_Compiler_Roadmap.pdf', size: '2.4 MB', type: 'pdf' },
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Alex Rivers',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        authorRole: 'Student',
        createdAt: '1 hour ago',
        content: 'Thank you Dr. Vikram! Will the recording be available in the downloads section as well?',
        likes: 5,
      },
      {
        id: 'c-2',
        authorName: 'Dr. Vikramaditya Rao',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        authorRole: 'Instructor',
        createdAt: '45 mins ago',
        content: 'Yes Alex! The recording will be published within 2 hours after the stream ends.',
        likes: 8,
      },
    ],
  },
  {
    id: 'post-102',
    title: 'How to resolve hydration mismatch when persisting Zustand store with Next.js SSR?',
    content: 'I keep getting a client-server hydration error when loading local storage saved theme state. Has anyone implemented the `useHasHydrated` hook pattern successfully?',
    type: 'Question',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    authorRole: 'Student',
    createdAt: '4 hours ago',
    likesCount: 12,
    viewsCount: 89,
    attachments: [
      { name: 'zustand-store.ts', size: '4.1 KB', type: 'code' },
    ],
    comments: [
      {
        id: 'c-3',
        authorName: 'Michael Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
        authorRole: 'Student',
        createdAt: '3 hours ago',
        content: 'You need to delay rendering the theme-dependent UI until `useEffect` runs to set `mounted = true`. Check out Module 2.2 notes!',
        likes: 6,
      },
    ],
  },
  {
    id: 'post-103',
    title: 'Share your Module 2 Zustand Custom Tokens Setup!',
    content: 'Hey everyone! Let us share our custom token setup for handling light surface enforcement. Here is my current CSS variable snippet:',
    type: 'Discussion',
    authorName: 'Alex Rivers',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    authorRole: 'Student',
    createdAt: '1 day ago',
    likesCount: 18,
    viewsCount: 110,
    attachments: [
      { name: 'theme-tokens.css', size: '1.8 KB', type: 'code' },
    ],
    comments: [],
  },
];

export const DiscussionsPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ academyUuid?: string }>();
  const academies = useAcademyStore((state) => state.academies);
  const user = useAuthStore((state) => state.user);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB', primaryHover: '#1D4ED8', primarySoft: '#EFF6FF' };

  // Posts State
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Questions' | 'Discussions' | 'Announcements' | 'Resources' | 'Pinned' | 'My Posts' | 'Bookmarked'
  >('All');

  // Interactive post expanded comments & new comment text
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-101': true,
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('Discussion');
  const [newPostContent, setNewPostContent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'Questions':
          return post.type === 'Question';
        case 'Discussions':
          return post.type === 'Discussion';
        case 'Announcements':
          return post.type === 'Announcement';
        case 'Resources':
          return post.type === 'Resource';
        case 'Pinned':
          return Boolean(post.isPinned);
        case 'My Posts':
          return post.authorName === (user?.fullName || 'Alex Rivers');
        case 'Bookmarked':
          return Boolean(post.isBookmarked);
        default:
          return true;
      }
    });
  }, [posts, searchQuery, activeFilter, user]);

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isBookmarked = !p.isBookmarked;
          setToastMessage(isBookmarked ? 'Post saved to bookmarks!' : 'Post removed from bookmarks.');
          setTimeout(() => setToastMessage(null), 3000);
          return { ...p, isBookmarked };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment: CommentItem = {
            id: `c-${Date.now()}`,
            authorName: user?.fullName || 'Alex Rivers',
            authorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            authorRole: 'Student',
            createdAt: 'Just now',
            content: text,
            likes: 0,
          };
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      title: newPostTitle,
      content: newPostContent,
      type: newPostType,
      authorName: user?.fullName || 'Alex Rivers',
      authorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      authorRole: 'Student',
      createdAt: 'Just now',
      likesCount: 0,
      viewsCount: 1,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setToastMessage('Your post has been published to the community!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getTypeBadge = (type: PostType) => {
    switch (type) {
      case 'Announcement':
        return <Badge variant="warning" size="sm" className="gap-1"><Megaphone className="w-3 h-3" /> Announcement</Badge>;
      case 'Question':
        return <Badge variant="info" size="sm" className="gap-1"><HelpCircle className="w-3 h-3" /> Question</Badge>;
      case 'Resource':
        return <Badge variant="success" size="sm" className="gap-1"><FileText className="w-3 h-3" /> Resource</Badge>;
      default:
        return <Badge variant="neutral" size="sm" className="gap-1"><MessageSquare className="w-3 h-3" /> Discussion</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto hide-scrollbar pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. COMMUNITY PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Course Discussion Board</span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
              Course Community
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-500 font-normal">
              Public discussion space for enrolled students &amp; instructors to share notes, ask questions, and collaborate.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="font-semibold px-4 h-10 shrink-0 theme-bg cursor-pointer"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Post
          </Button>
        </div>
      </Card>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search discussions by title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] pl-9 pr-8 rounded-[10px] border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 theme-focus"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1 border-t border-slate-100">
          {(
            ['All', 'Questions', 'Discussions', 'Announcements', 'Resources', 'Pinned', 'My Posts', 'Bookmarked'] as const
          ).map((tab) => {
            const isSelected = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected ? 'theme-soft theme-text theme-border border shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. POSTS FEED */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isCommentsOpen = expandedComments[post.id] ?? false;

          return (
            <Card
              key={post.id}
              padding="md"
              className={`bg-white border transition-all space-y-4 shadow-2xs hover:shadow-xs ${
                post.isPinned ? 'border-amber-300/80 bg-amber-50/10' : 'border-slate-200/80'
              }`}
            >
              {/* POST HEADER: AUTHOR & METADATA */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{post.authorName}</span>
                      {post.authorRole === 'Instructor' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ★ Instructor
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">{post.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.isPinned && (
                    <Badge variant="warning" size="sm" className="gap-1 bg-amber-100 text-amber-800 border-amber-300">
                      <Pin className="w-3 h-3 text-amber-600" /> Pinned
                    </Badge>
                  )}
                  {getTypeBadge(post.type)}
                </div>
              </div>

              {/* POST TITLE & CONTENT */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-slate-900 leading-snug">{post.title}</h2>
                <p className="text-slate-700 font-normal leading-relaxed text-xs whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* ATTACHMENTS PREVIEW */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Attachments</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {post.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {file.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <Code className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-slate-900 block truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{file.size}</span>
                          </div>
                        </div>
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERACTIVE ACTION BAR */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                      post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{post.likesCount} Likes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(post.id)}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer ${
                      post.isBookmarked ? 'theme-text' : 'text-slate-400'
                    }`}
                    title="Bookmark Post"
                  >
                    <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText?.(window.location.href);
                      setToastMessage('Post link copied to clipboard!');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* NESTED COMMENTS SECTION */}
              {isCommentsOpen && (
                <div className="space-y-3 pt-3 border-t border-slate-100 bg-slate-50/60 p-4 rounded-xl">
                  <h4 className="font-semibold text-xs text-slate-900">Discussion Thread ({post.comments.length})</h4>

                  {post.comments.length > 0 && (
                    <div className="space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={comment.authorAvatar} alt={comment.authorName} className="w-6 h-6 rounded-full object-cover" />
                              <span className="font-semibold text-xs text-slate-900">{comment.authorName}</span>
                              {comment.authorRole === 'Instructor' && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">Instructor</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-normal pl-8">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ADD COMMENT INPUT */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write a reply or answer..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 h-[40px] px-3.5 rounded-[10px] border border-slate-200 bg-white text-xs font-medium text-slate-900 theme-focus"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      className="font-semibold px-4 h-[40px] theme-bg cursor-pointer"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 4. CREATE POST MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Community Discussion Post"
        subtitle="Share a topic, ask a question, or post a learning resource with your class."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePost} className="space-y-4 font-sans text-xs">
          <div className="space-y-1">
            <label className="block font-medium text-slate-900">Post Title *</label>
            <input
              type="text"
              placeholder="What is your topic or question?"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 theme-focus"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900">Post Category *</label>
            <select
              value={newPostType}
              onChange={(e) => setNewPostType(e.target.value as PostType)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden bg-white"
            >
              <option value="Discussion">General Discussion</option>
              <option value="Question">Question for Instructor &amp; Class</option>
              <option value="Resource">Resource &amp; Code Share</option>
              <option value="Assignment Discussion">Assignment Help</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900">Content / Details *</label>
            <textarea
              rows={5}
              placeholder="Provide context, error logs, or discussion background..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3 rounded-[10px] border border-slate-200 text-xs font-medium text-slate-900 theme-focus"
              required
            />
          </div>

          <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center space-y-1 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
            <Paperclip className="w-5 h-5 text-slate-400 mx-auto" />
            <span className="font-semibold text-xs text-slate-700 block">Attach Files or Code Snippets (Optional)</span>
            <span className="text-[10px] text-slate-400 font-mono">Supports PDF, ZIP, TS/JS, PNG</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="font-semibold">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold theme-bg cursor-pointer" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
