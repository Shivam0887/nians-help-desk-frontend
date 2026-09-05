import { create } from 'zustand';
import type { User } from '../types/index.ts';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('helpdesk_token', token);
      localStorage.setItem('helpdesk_user', JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('helpdesk_token');
      localStorage.removeItem('helpdesk_user');
    }
    set({ user: null, token: null, isLoading: false });
  },

  initAuth: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const token = localStorage.getItem('helpdesk_token');
      const userJson = localStorage.getItem('helpdesk_user');

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isLoading: false });
        return;
      }
    } catch {
      localStorage.removeItem('helpdesk_token');
      localStorage.removeItem('helpdesk_user');
    }

    set({ user: null, token: null, isLoading: false });
  },
}));

interface CreateTicketModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCreateTicketModal = create<CreateTicketModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
