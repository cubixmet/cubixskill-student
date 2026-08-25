import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DiscussionAttachment {
  attachmentUuid: string;
  fileName: string;
  mimeType: string;
  fileSize: number; // in bytes
  fileUrl: string;
}

export interface DiscussionPost {
  postUuid: string;
  academyUuid: string;
  courseUuid: string;
  authorUuid: string;
  authorName: string;
  authorRole: 'student' | 'academy' | 'instructor';
  content: string;
  attachments?: DiscussionAttachment[];
  replyCount: number;
  createdAt: string;
  status: 'active' | 'deleted';
}

export interface DiscussionReply {
  replyUuid: string;
  postUuid: string;
  authorUuid: string;
  authorName: string;
  authorRole: 'student' | 'academy' | 'instructor';
  content: string;
  attachments?: DiscussionAttachment[];
  createdAt: string;
  status: 'active' | 'deleted';
}

interface DiscussionStoreState {
  posts: DiscussionPost[];
  replies: Record<string, DiscussionReply[]>; // Keyed by postUuid

  addPost: (data: Omit<DiscussionPost, 'postUuid' | 'replyCount' | 'createdAt' | 'status'>) => DiscussionPost;
  addReply: (data: Omit<DiscussionReply, 'replyUuid' | 'createdAt' | 'status'>) => DiscussionReply;
  deletePost: (postUuid: string) => void;
  deleteReply: (postUuid: string, replyUuid: string) => void;
  getCoursePosts: (courseUuid: string) => DiscussionPost[];
  getPostReplies: (postUuid: string) => DiscussionReply[];
  getTotalDiscussionStorage: (academyUuid?: string) => number;
  reset: () => void;
}

export const useDiscussionStore = create<DiscussionStoreState>()(
  persist(
    (set, get) => ({
      posts: [],
      replies: {},

      addPost: (data) => {
        const newPost: DiscussionPost = {
          ...data,
          postUuid: `post-${Date.now()}`,
          replyCount: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
        }));

        return newPost;
      },

      addReply: (data) => {
        const newReply: DiscussionReply = {
          ...data,
          replyUuid: `rep-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const currentReplies = state.replies[data.postUuid] || [];
          const updatedReplies = [...currentReplies, newReply];

          const updatedPosts = state.posts.map((p) =>
            p.postUuid === data.postUuid ? { ...p, replyCount: p.replyCount + 1 } : p
          );

          return {
            posts: updatedPosts,
            replies: {
              ...state.replies,
              [data.postUuid]: updatedReplies,
            },
          };
        });

        return newReply;
      },

      deletePost: (postUuid) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.postUuid === postUuid ? { ...p, status: 'deleted' } : p)),
        }));
      },

      deleteReply: (postUuid, replyUuid) => {
        set((state) => {
          const postReplies = state.replies[postUuid] || [];
          const updatedReplies = postReplies.map((r) => (r.replyUuid === replyUuid ? { ...r, status: 'deleted' as const } : r));

          return {
            replies: {
              ...state.replies,
              [postUuid]: updatedReplies,
            },
          };
        });
      },

      getCoursePosts: (courseUuid) => {
        return get().posts.filter((p) => p.status === 'active' && p.courseUuid === courseUuid);
      },

      getPostReplies: (postUuid) => {
        return (get().replies[postUuid] || []).filter((r) => r.status === 'active');
      },

      getTotalDiscussionStorage: (academyUuid) => {
        let total = 0;
        get().posts.forEach((p) => {
          if (p.status === 'active' && (!academyUuid || p.academyUuid === academyUuid)) {
            p.attachments?.forEach((att) => (total += att.fileSize || 0));
          }
        });
        Object.values(get().replies).forEach((replyList) => {
          replyList.forEach((r) => {
            if (r.status === 'active') {
              r.attachments?.forEach((att) => (total += att.fileSize || 0));
            }
          });
        });
        return total;
      },

      reset: () => set({ posts: [], replies: {} }),
    }),
    {
      name: 'cubixskill:discussion-store',
    }
  )
);
