import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { COLLAB_POSTS } from '../data/collaborations';
import { CollabPost } from '../types/collaboration';

interface CollaborationsStore {
  posts: CollabPost[];
  appliedIds: string[];
  addPost: (post: CollabPost) => void;
  closePost: (id: string) => void;
  reopenPost: (id: string) => void;
  removePost: (id: string) => void;
  toggleApply: (postId: string) => void;
}

export const useCollaborationsStore = create<CollaborationsStore>()(
  persist(
    (set, get) => ({
      posts: COLLAB_POSTS,
      appliedIds: [],
      addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
      closePost: (id) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, isOpen: false } : p)) })),
      reopenPost: (id) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, isOpen: true } : p)) })),
      removePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
      toggleApply: (postId) => {
        const { appliedIds } = get();
        if (appliedIds.includes(postId)) {
          set({ appliedIds: appliedIds.filter((id) => id !== postId) });
        } else {
          set({ appliedIds: [...appliedIds, postId] });
        }
      },
    }),
    {
      name: 'forge-collaborations',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted: any, current) => {
        const persistedPosts: CollabPost[] = persisted?.posts ?? [];
        const userAdded = persistedPosts.filter((p) => p.userId === 'me');
        return {
          ...current,
          posts: [...userAdded, ...COLLAB_POSTS],
          appliedIds: persisted?.appliedIds ?? [],
        };
      },
    }
  )
);
