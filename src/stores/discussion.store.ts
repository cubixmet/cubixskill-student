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
}

const INITIAL_MOCK_POSTS: DiscussionPost[] = [
  {
    postUuid: 'post-401',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    authorUuid: 'inst-1',
    authorName: 'Dr. Aarav Patel',
    authorRole: 'instructor',
    content: 'Welcome everyone to the React 19 Mastery Course Community! Feel free to ask questions about compiler mechanics or server actions here.',
    replyCount: 2,
    createdAt: '2026-08-08T09:00:00Z',
    status: 'active',
  },
  {
    postUuid: 'post-402',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    authorUuid: 'std-production-1',
    authorName: 'Alex Student',
    authorRole: 'student',
    content: 'Has anyone tested useActionState with optimistic UI updates on high latency networks? Attached the architecture diagram.',
    attachments: [
      {
        attachmentUuid: 'att-1',
        fileName: 'useActionState_diagram.png',
        mimeType: 'image/png',
        fileSize: 552960, // 540 KB
        fileUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
      },
    ],
    replyCount: 1,
    createdAt: '2026-08-09T14:30:00Z',
    status: 'active',
  },
];

const INITIAL_MOCK_REPLIES: Record<string, DiscussionReply[]> = {
  'post-401': [
    {
      replyUuid: 'rep-401-1',
      postUuid: 'post-401',
      authorUuid: 'std-production-1',
      authorName: 'Alex Student',
      authorRole: 'student',
      content: 'Excited to be here! Working through Module 1 compiler mechanics now.',
      createdAt: '2026-08-08T10:15:00Z',
      status: 'active',
    },
    {
      replyUuid: 'rep-401-2',
      postUuid: 'post-401',
      authorUuid: 'acad-staff-1',
      authorName: 'CubixSkill Academy Team',
      authorRole: 'academy',
      content: 'Great to have you Alex! Let us know if you need assistance during the labs.',
      createdAt: '2026-08-08T11:00:00Z',
      status: 'active',
    },
  ],
  'post-402': [
    {
      replyUuid: 'rep-402-1',
      postUuid: 'post-402',
      authorUuid: 'inst-1',
      authorName: 'Dr. Aarav Patel',
      authorRole: 'instructor',
      content: 'Great question Alex! In Lesson 1.2 we demonstrate how useOptimistic handles rollback gracefully during server action delays.',
      createdAt: '2026-08-09T16:00:00Z',
      status: 'active',
    },
  ],
};

export const useDiscussionStore = create<DiscussionStoreState>()(
  persist(
    (set, get) => ({
      posts: INITIAL_MOCK_POSTS,
      replies: INITIAL_MOCK_REPLIES,

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
    }),
    {
      name: 'cubixskill:discussion-store',
    }
  )
);
