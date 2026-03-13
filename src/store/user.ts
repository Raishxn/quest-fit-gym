import { create } from 'zustand';
import type { UserProfile } from '@/types';

// Mock user for development
const MOCK_USER: UserProfile = {
  id: 'mock-1',
  email: 'heroi@questfit.com',
  username: 'heroi_rpg',
  name: 'Herói RPG',
  avatarUrl: undefined,
  bio: 'Level up your body ⚔️',
  theme: 'dark-red',
  xp: 4250,
  level: 3,
  className: 'Guerreiro',
  specialization: 'hercules',
  strAttr: 24,
  endAttr: 15,
  vitAttr: 18,
  agiAttr: 8,
  streak: 12,
  plan: 'free',
  anamnesisComplete: true,
};

interface UserStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: MOCK_USER,
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
