import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Detect React Native vs web/SSR. On native navigator.product === 'ReactNative'.
const isNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Custom storage adapter that works on native, web client, and SSR
const storage = {
  getItem: (key: string): Promise<string | null> => {
    if (isNative) {
      return AsyncStorage.getItem(key);
    }
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    // SSR: no storage available
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (isNative) {
      return AsyncStorage.setItem(key, value);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    }
    // SSR: no-op
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (isNative) {
      return AsyncStorage.removeItem(key);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
    // SSR: no-op
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SupabaseUser = {
  id: string;
  email?: string;
  created_at: string;
};
