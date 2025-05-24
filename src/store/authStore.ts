import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type UserRole = 'admin' | 'learner';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  
  signIn: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      await get().getUser();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, username: string, role: UserRole = 'learner') => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');
      
      // Create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          username,
          role,
        });
      
      if (profileError) throw profileError;
      await get().getUser();
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  getUser: async () => {
    try {
      set({ isLoading: true });
      
      // Get the current authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        set({ user: null, isLoading: false });
        return;
      }
      
      // Get the user profile
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) throw error;
      
      set({
        user: {
          id: profileData.id,
          email: profileData.email,
          username: profileData.username,
          role: profileData.role,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      set({ user: null, isLoading: false });
    }
  },
}));