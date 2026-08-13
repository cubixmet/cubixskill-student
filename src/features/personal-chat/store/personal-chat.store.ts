import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'zip' | 'audio' | 'video' | 'link';
  size?: string;
  url: string;
}

export type ConversationStatus = 'open' | 'waiting' | 'replied' | 'resolved' | 'closed';
export type SenderRole = 'student' | 'instructor' | 'staff';
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export type RelatedItemType =
  | 'General Course Question'
  | 'Module'
  | 'Lesson'
  | 'Assignment'
  | 'Quiz'
  | 'Live Class'
  | 'Certificate'
  | 'Technical Support';

export interface ChatContext {
  courseUuid?: string;
  courseTitle?: string;
  moduleTitle?: string;
  lessonUuid?: string;
  lessonTitle?: string;
  assignmentTitle?: string;
  liveClassTitle?: string;
}

export interface PersonalConversation {
  uuid: string;
  academyUuid: string;
  courseUuid: string;
  studentUuid: string;
  participantUuids: string[];
  instructorName: string;
  instructorAvatar: string;
  instructorRole: string;
  instructorStatus: 'online' | 'offline' | 'replies_in_few_hours' | 'replies_within_24h';
  subject: string;
  relatedType?: RelatedItemType;
  relatedTitle?: string;
  relatedUuid?: string;
  status: ConversationStatus;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isMuted?: boolean;
}

export interface PersonalMessage {
  uuid: string;
  conversationUuid: string;
  senderUuid: string;
  senderName: string;
  senderAvatar: string;
  senderRole: SenderRole;
  content: string;
  replyToMessageUuid?: string;
  attachments: ChatAttachment[];
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  editedAt?: string;
}

interface NewConversationInput {
  academyUuid: string;
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentAvatar: string;
  recipientRole: string;
  subject: string;
  relatedType?: RelatedItemType;
  relatedTitle?: string;
  initialMessage: string;
  attachments?: ChatAttachment[];
}

interface SendMessageInput {
  conversationUuid: string;
  senderUuid: string;
  senderName: string;
  senderAvatar: string;
  senderRole: SenderRole;
  content: string;
  replyToMessageUuid?: string;
  attachments?: ChatAttachment[];
}

interface PersonalChatStoreState {
  conversations: PersonalConversation[];
  messages: Record<string, PersonalMessage[]>; // keyed by conversationUuid

  // Actions
  createConversation: (input: NewConversationInput) => string;
  sendMessage: (input: SendMessageInput) => string;
  retryMessage: (messageUuid: string, conversationUuid: string) => void;
  editStudentMessage: (messageUuid: string, conversationUuid: string, newContent: string) => void;
  deleteStudentMessage: (messageUuid: string, conversationUuid: string) => void;
  markConversationRead: (conversationUuid: string) => void;
  markConversationResolved: (conversationUuid: string) => void;
  reopenConversation: (conversationUuid: string) => void;
  muteConversation: (conversationUuid: string, isMuted?: boolean) => void;
  simulateInstructorReply: (conversationUuid: string, replyText?: string, attachment?: ChatAttachment) => void;

  // Selectors
  getConversationsByCourse: (courseUuid: string) => PersonalConversation[];
  getConversationByUuid: (uuid: string) => PersonalConversation | undefined;
  getMessagesByConversation: (conversationUuid: string) => PersonalMessage[];
}

const INITIAL_CONVERSATIONS: PersonalConversation[] = [
  {
    uuid: 'c891a123-1111-4000-8000-000000000001',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    studentUuid: 'usr-student-01',
    participantUuids: ['usr-student-01', 'usr-inst-101'],
    instructorName: 'Dr. Vikramaditya Rao',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    instructorRole: 'Course Instructor',
    instructorStatus: 'online',
    subject: 'Clarification on Module 3 State Hydration Architecture',
    relatedType: 'Module',
    relatedTitle: 'Module 3: Server Actions & State Hydration',
    status: 'replied',
    unreadCount: 1,
    createdAt: '2026-08-05T14:30:00.000Z',
    updatedAt: '2026-08-06T11:15:00.000Z',
  },
  {
    uuid: 'c891a123-2222-4000-8000-000000000002',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    studentUuid: 'usr-student-01',
    participantUuids: ['usr-student-01', 'usr-staff-102'],
    instructorName: 'Priya Sharma (Support Lead)',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    instructorRole: 'Course Support',
    instructorStatus: 'replies_in_few_hours',
    subject: 'Assignment 3 Capstone Extension Request',
    relatedType: 'Assignment',
    relatedTitle: 'Assignment 3: Build Custom Zustand Middleware',
    status: 'open',
    unreadCount: 0,
    createdAt: '2026-08-04T09:20:00.000Z',
    updatedAt: '2026-08-05T16:45:00.000Z',
  },
  {
    uuid: 'c891a123-3333-4000-8000-000000000003',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    studentUuid: 'usr-student-01',
    participantUuids: ['usr-student-01', 'usr-inst-101'],
    instructorName: 'Dr. Vikramaditya Rao',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    instructorRole: 'Course Instructor',
    instructorStatus: 'online',
    subject: 'Feedback on Quiz 2 Optimistic Updates',
    relatedType: 'Quiz',
    relatedTitle: 'Quiz 2: React 19 Compiler & Hydration',
    status: 'resolved',
    unreadCount: 0,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-02T15:30:00.000Z',
  },
];

const INITIAL_MESSAGES: Record<string, PersonalMessage[]> = {
  'c891a123-1111-4000-8000-000000000001': [
    {
      uuid: 'msg-101',
      conversationUuid: 'c891a123-1111-4000-8000-000000000001',
      senderUuid: 'usr-student-01',
      senderName: 'Alex Rivers',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderRole: 'student',
      content:
        'Hello Dr. Vikram! In Lesson 3.2, you mentioned using `useHasHydrated` hook for theme persistence. I uploaded my code snippet below. Could you check if my fallback logic is optimal?',
      attachments: [
        {
          id: 'att-1',
          name: 'useHasHydrated.tsx',
          type: 'document',
          size: '3.2 KB',
          url: '#',
        },
      ],
      deliveryStatus: 'seen',
      createdAt: '2026-08-05T14:30:00.000Z',
    },
    {
      uuid: 'msg-102',
      conversationUuid: 'c891a123-1111-4000-8000-000000000001',
      senderUuid: 'usr-inst-101',
      senderName: 'Dr. Vikramaditya Rao',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      senderRole: 'instructor',
      content:
        'Hi Alex! Your implementation looks very clean. However, make sure you don’t mutate local state inside render. I attached a diagram showing the exact hydration lifecycle order.',
      attachments: [
        {
          id: 'att-2',
          name: 'Hydration_Order_Diagram.png',
          type: 'image',
          size: '1.4 MB',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        },
      ],
      deliveryStatus: 'seen',
      createdAt: '2026-08-05T16:10:00.000Z',
    },
    {
      uuid: 'msg-103',
      conversationUuid: 'c891a123-1111-4000-8000-000000000001',
      senderUuid: 'usr-student-01',
      senderName: 'Alex Rivers',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderRole: 'student',
      replyToMessageUuid: 'msg-102',
      content:
        'Thank you so much! That diagram clarifies it completely. Does this also apply when using SSR in Next.js App Router?',
      attachments: [],
      deliveryStatus: 'seen',
      createdAt: '2026-08-06T10:00:00.000Z',
    },
    {
      uuid: 'msg-104',
      conversationUuid: 'c891a123-1111-4000-8000-000000000001',
      senderUuid: 'usr-inst-101',
      senderName: 'Dr. Vikramaditya Rao',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      senderRole: 'instructor',
      content:
        'Yes, absolutely! In Next.js App Router, server components pass initial JSON props, so Zustand store hydration should occur inside `useEffect` or React 19 `use` hook boundary.',
      attachments: [],
      deliveryStatus: 'delivered',
      createdAt: '2026-08-06T11:15:00.000Z',
    },
  ],
  'c891a123-2222-4000-8000-000000000002': [
    {
      uuid: 'msg-201',
      conversationUuid: 'c891a123-2222-4000-8000-000000000002',
      senderUuid: 'usr-student-01',
      senderName: 'Alex Rivers',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderRole: 'student',
      content:
        'Hi Support team, due to a minor power outage during the storm yesterday, could I request a 24-hour extension on Assignment 3?',
      attachments: [
        {
          id: 'att-3',
          name: 'Power_Outage_Notice.pdf',
          type: 'pdf',
          size: '512 KB',
          url: '#',
        },
      ],
      deliveryStatus: 'delivered',
      createdAt: '2026-08-04T09:20:00.000Z',
    },
  ],
  'c891a123-3333-4000-8000-000000000003': [
    {
      uuid: 'msg-301',
      conversationUuid: 'c891a123-3333-4000-8000-000000000003',
      senderUuid: 'usr-student-01',
      senderName: 'Alex Rivers',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderRole: 'student',
      content: 'I scored 95% on Quiz 2! Just wanted to thank you for the detailed explanations in the review video.',
      attachments: [],
      deliveryStatus: 'seen',
      createdAt: '2026-08-01T10:00:00.000Z',
    },
    {
      uuid: 'msg-302',
      conversationUuid: 'c891a123-3333-4000-8000-000000000003',
      senderUuid: 'usr-inst-101',
      senderName: 'Dr. Vikramaditya Rao',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      senderRole: 'instructor',
      content: 'Congratulations Alex! Fantastic work. I am marking this thread resolved.',
      attachments: [],
      deliveryStatus: 'seen',
      createdAt: '2026-08-02T15:30:00.000Z',
    },
  ],
};

export const usePersonalChatStore = create<PersonalChatStoreState>()(
  persist(
    (set, get) => ({
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,

      createConversation: (input) => {
        const conversationUuid = `c891a123-${Date.now()}`;
        const messageUuid = `msg-${Date.now()}`;
        const now = new Date().toISOString();

        const newConv: PersonalConversation = {
          uuid: conversationUuid,
          academyUuid: input.academyUuid,
          courseUuid: input.courseUuid,
          studentUuid: input.studentUuid,
          participantUuids: [input.studentUuid, 'usr-inst-101'],
          instructorName:
            input.recipientRole === 'Course Support'
              ? 'Priya Sharma (Support Lead)'
              : 'Dr. Vikramaditya Rao',
          instructorAvatar:
            input.recipientRole === 'Course Support'
              ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
          instructorRole: input.recipientRole || 'Course Instructor',
          instructorStatus: 'online',
          subject: input.subject,
          relatedType: input.relatedType,
          relatedTitle: input.relatedTitle,
          status: 'waiting',
          unreadCount: 0,
          createdAt: now,
          updatedAt: now,
        };

        const initialMsg: PersonalMessage = {
          uuid: messageUuid,
          conversationUuid,
          senderUuid: input.studentUuid,
          senderName: input.studentName,
          senderAvatar: input.studentAvatar,
          senderRole: 'student',
          content: input.initialMessage,
          attachments: input.attachments || [],
          deliveryStatus: 'sent',
          createdAt: now,
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          messages: {
            ...state.messages,
            [conversationUuid]: [initialMsg],
          },
        }));

        return conversationUuid;
      },

      sendMessage: (input) => {
        const messageUuid = `msg-${Date.now()}`;
        const now = new Date().toISOString();

        const newMsg: PersonalMessage = {
          uuid: messageUuid,
          conversationUuid: input.conversationUuid,
          senderUuid: input.senderUuid,
          senderName: input.senderName,
          senderAvatar: input.senderAvatar,
          senderRole: input.senderRole,
          content: input.content,
          replyToMessageUuid: input.replyToMessageUuid,
          attachments: input.attachments || [],
          deliveryStatus: 'sending',
          createdAt: now,
        };

        set((state) => {
          const currentMsgs = state.messages[input.conversationUuid] || [];
          const updatedConversations = state.conversations.map((c) => {
            if (c.uuid === input.conversationUuid) {
              return {
                ...c,
                status: (input.senderRole === 'student' ? 'waiting' : 'replied') as ConversationStatus,
                updatedAt: now,
              };
            }
            return c;
          });

          return {
            conversations: updatedConversations,
            messages: {
              ...state.messages,
              [input.conversationUuid]: [...currentMsgs, newMsg],
            },
          };
        });

        // Network simulation sending -> sent -> delivered
        setTimeout(() => {
          set((state) => {
            const list = state.messages[input.conversationUuid] || [];
            const updated = list.map((m) => (m.uuid === messageUuid ? { ...m, deliveryStatus: 'sent' as DeliveryStatus } : m));
            return { messages: { ...state.messages, [input.conversationUuid]: updated } };
          });
        }, 400);

        setTimeout(() => {
          set((state) => {
            const list = state.messages[input.conversationUuid] || [];
            const updated = list.map((m) => (m.uuid === messageUuid ? { ...m, deliveryStatus: 'delivered' as DeliveryStatus } : m));
            return { messages: { ...state.messages, [input.conversationUuid]: updated } };
          });
        }, 1200);

        return messageUuid;
      },

      retryMessage: (messageUuid, conversationUuid) => {
        set((state) => {
          const list = state.messages[conversationUuid] || [];
          const updated = list.map((m) => (m.uuid === messageUuid ? { ...m, deliveryStatus: 'sent' as DeliveryStatus } : m));
          return { messages: { ...state.messages, [conversationUuid]: updated } };
        });
      },

      editStudentMessage: (messageUuid, conversationUuid, newContent) => {
        const now = new Date().toISOString();
        set((state) => {
          const list = state.messages[conversationUuid] || [];
          const updated = list.map((m) => (m.uuid === messageUuid ? { ...m, content: newContent, editedAt: now } : m));
          return { messages: { ...state.messages, [conversationUuid]: updated } };
        });
      },

      deleteStudentMessage: (messageUuid, conversationUuid) => {
        set((state) => {
          const list = state.messages[conversationUuid] || [];
          const updated = list.filter((m) => m.uuid !== messageUuid || m.senderRole !== 'student');
          return { messages: { ...state.messages, [conversationUuid]: updated } };
        });
      },

      markConversationRead: (conversationUuid) => {
        set((state) => ({
          conversations: state.conversations.map((c) => (c.uuid === conversationUuid ? { ...c, unreadCount: 0 } : c)),
          messages: {
            ...state.messages,
            [conversationUuid]: (state.messages[conversationUuid] || []).map((m) => ({
              ...m,
              deliveryStatus: m.deliveryStatus === 'delivered' ? 'seen' : m.deliveryStatus,
            })),
          },
        }));
      },

      markConversationResolved: (conversationUuid) => {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.uuid === conversationUuid ? { ...c, status: 'resolved', updatedAt: now } : c
          ),
        }));
      },

      reopenConversation: (conversationUuid) => {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.uuid === conversationUuid ? { ...c, status: 'open', updatedAt: now } : c
          ),
        }));
      },

      muteConversation: (conversationUuid, isMuted = true) => {
        set((state) => ({
          conversations: state.conversations.map((c) => (c.uuid === conversationUuid ? { ...c, isMuted } : c)),
        }));
      },

      simulateInstructorReply: (conversationUuid, replyText, attachment) => {
        const conv = get().conversations.find((c) => c.uuid === conversationUuid);
        if (!conv) return;

        const messageUuid = `msg-reply-${Date.now()}`;
        const now = new Date().toISOString();

        const defaultReply = `Thank you for your message! I have reviewed your question regarding "${conv.subject}". Here is the recommended guidance for implementation.`;

        const newMsg: PersonalMessage = {
          uuid: messageUuid,
          conversationUuid,
          senderUuid: 'usr-inst-101',
          senderName: conv.instructorName || 'Dr. Vikramaditya Rao',
          senderAvatar: conv.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
          senderRole: 'instructor',
          content: replyText || defaultReply,
          attachments: attachment ? [attachment] : [],
          deliveryStatus: 'delivered',
          createdAt: now,
        };

        set((state) => {
          const currentMsgs = state.messages[conversationUuid] || [];
          return {
            conversations: state.conversations.map((c) =>
              c.uuid === conversationUuid
                ? {
                    ...c,
                    status: 'replied',
                    unreadCount: c.unreadCount + 1,
                    updatedAt: now,
                  }
                : c
            ),
            messages: {
              ...state.messages,
              [conversationUuid]: [...currentMsgs, newMsg],
            },
          };
        });
      },

      getConversationsByCourse: (courseUuid) => {
        return get()
          .conversations.filter((c) => c.courseUuid === courseUuid)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getConversationByUuid: (uuid) => {
        return get().conversations.find((c) => c.uuid === uuid);
      },

      getMessagesByConversation: (conversationUuid) => {
        return get().messages[conversationUuid] || [];
      },
    }),
    {
      name: 'cubixskill_personal_chat_store_v1',
    }
  )
);
