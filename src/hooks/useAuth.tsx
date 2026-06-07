"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface Profile {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  presence_status: string | null;
  activity_status: string | null;
  last_seen_at: string | null;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (
    name: string,
    email: string,
    username: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return profile as Profile | null;
  }, []);

  const fetchRole = useCallback(async (userId: string) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    return (roleData as UserRole | null)?.role ?? null;
  }, []);

  const loadUserData = useCallback(
    async (user: User) => {
      const [profile, role] = await Promise.all([
        fetchProfile(user.id),
        fetchRole(user.id),
      ]);
      setState({ user, profile, role, loading: false });
    },
    [fetchProfile, fetchRole]
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setState({ user: null, profile: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signUp = async (
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: name },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, role: null, loading: false });
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updateProfile = async (
    data: Partial<Profile>
  ): Promise<{ error: string | null }> => {
    if (!state.user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("user_id", state.user.id);
    if (error) return { error: error.message };
    // Refresh profile
    const updated = await fetchProfile(state.user.id);
    setState((s) => ({ ...s, profile: updated }));
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
