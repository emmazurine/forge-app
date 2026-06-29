import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Conversation, Message } from '../types/message';
import { PortfolioSnapshot } from '../types/portfolio';

const NOW = Date.now();

const SEED: Conversation[] = [
  {
    id: '1',
    participantId: '1',
    participantName: 'Alex Chen',
    participantInitials: 'AC',
    participantAvatarColor: '#6366F1',
    participantSchool: 'George Mason University',
    updatedAt: NOW - 1000 * 60 * 45,
    messages: [
      {
        id: 'm1',
        senderId: '1',
        text: "Hey! Saw your profile on Forge — we're both into AI. I'm building a recommendation engine for research opportunities, would love to chat!",
        sentAt: NOW - 1000 * 60 * 120,
      },
      {
        id: 'm2',
        senderId: 'me',
        text: "Hey Alex! That sounds really cool. I've been thinking about something similar. When are you free this week?",
        sentAt: NOW - 1000 * 60 * 75,
      },
      {
        id: 'm3',
        senderId: '1',
        text: "I'm usually at Fenwick Library on Thursdays around 2pm. Want to meet up there?",
        sentAt: NOW - 1000 * 60 * 45,
      },
    ],
  },
  {
    id: '2',
    participantId: '2',
    participantName: 'Sofia Reyes',
    participantInitials: 'SR',
    participantAvatarColor: '#22C55E',
    participantSchool: 'George Mason University',
    updatedAt: NOW - 1000 * 60 * 60 * 22,
    messages: [
      {
        id: 'm4',
        senderId: '2',
        text: "Hi! Looking for a hackathon team for HackDC next month. Interested in teaming up?",
        sentAt: NOW - 1000 * 60 * 60 * 22,
      },
    ],
  },
];

interface MessagesStore {
  conversations: Conversation[];
  getConversation: (participantId: string) => Conversation | undefined;
  getOrCreate: (
    participantId: string,
    info: Pick<Conversation, 'participantName' | 'participantInitials' | 'participantAvatarColor' | 'participantSchool'>
  ) => Conversation;
  sendMessage: (conversationId: string, text: string) => void;
  sendPortfolio: (conversationId: string, snapshot: PortfolioSnapshot) => void;
}

export const useMessagesStore = create<MessagesStore>()(
  persist(
    (set, get) => ({
      conversations: SEED,

      getConversation: (participantId) =>
        get().conversations.find((c) => c.participantId === participantId),

      getOrCreate: (participantId, info) => {
        const existing = get().conversations.find((c) => c.participantId === participantId);
        if (existing) return existing;
        const newConv: Conversation = {
          id: participantId,
          participantId,
          ...info,
          messages: [],
          updatedAt: Date.now(),
        };
        set((s) => ({ conversations: [newConv, ...s.conversations] }));
        return newConv;
      },

      sendMessage: (conversationId, text) => {
        const msg: Message = {
          id: `msg-${Date.now()}`,
          senderId: 'me',
          text,
          sentAt: Date.now(),
        };
        set((s) => ({
          conversations: s.conversations
            .map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
                : c
            )
            .sort((a, b) => b.updatedAt - a.updatedAt),
        }));
      },

      sendPortfolio: (conversationId, snapshot) => {
        const msg: Message = {
          id: `msg-${Date.now()}`,
          senderId: 'me',
          text: '',
          sentAt: Date.now(),
          type: 'portfolio',
          portfolio: snapshot,
        };
        set((s) => ({
          conversations: s.conversations
            .map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
                : c
            )
            .sort((a, b) => b.updatedAt - a.updatedAt),
        }));
      },
    }),
    {
      name: 'forge-messages',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted: any, current) => {
        const persistedConvos: Conversation[] = persisted?.conversations ?? [];
        if (persistedConvos.length === 0) return current;
        const merged = [...persistedConvos];
        for (const seed of SEED) {
          if (!merged.find((c) => c.participantId === seed.participantId)) {
            merged.push(seed);
          }
        }
        return { ...current, conversations: merged.sort((a, b) => b.updatedAt - a.updatedAt) };
      },
    }
  )
);
