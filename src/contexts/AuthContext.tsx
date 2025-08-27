import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useProfile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  // Impersonation state
  isImpersonating: boolean;
  originalUser: User | null;
  originalProfile: UserProfile | null;
  impersonatedUser: User | null;
  impersonatedProfile: UserProfile | null;
  startImpersonation: (targetUserId: string, reason?: string) => Promise<boolean>;
  endImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [impersonatedProfile, setImpersonatedProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: user } = await supabase.auth.getUser();
          if (user.user) {
            await createProfile(user.user);
          }
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfile = async (user: User) => {
    try {
      const newProfile = {
        user_id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: 'staff',
        is_active: true,
        language_preference: 'en',
        dark_mode: false
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const startImpersonation = async (targetUserId: string, reason?: string): Promise<boolean> => {
    try {
      // Verify current user is overlord
      if (profile?.role !== 'overlord') {
        throw new Error('Only overlords can impersonate users');
      }

      // Fetch target user profile
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (profileError) {
        throw new Error('Target user not found');
      }

      // Create impersonation session record
      const { error: sessionError } = await supabase
        .from('impersonation_sessions')
        .insert({
          overlord_id: user!.id,
          impersonated_user_id: targetUserId,
          reason: reason || 'User support',
          ip_address: null, // Could be populated from request
          user_agent: navigator.userAgent
        });

      if (sessionError) {
        throw new Error('Failed to create impersonation session');
      }

      // Store original user data
      setOriginalUser(user);
      setOriginalProfile(profile);

      // Create mock user object for impersonated user
      const mockUser: User = {
        id: targetUserId,
        email: targetProfile.email,
        user_metadata: {
          first_name: targetProfile.first_name,
          last_name: targetProfile.last_name
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update state for impersonation
      setUser(mockUser);
      setProfile(targetProfile);
      setImpersonatedUser(mockUser);
      setImpersonatedProfile(targetProfile);
      setIsImpersonating(true);

      return true;
    } catch (error) {
      console.error('Error starting impersonation:', error);
      return false;
    }
  };

  const endImpersonation = async (): Promise<void> => {
    try {
      if (!isImpersonating || !originalUser) return;

      // End the impersonation session
      await supabase
        .from('impersonation_sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          is_active: false 
        })
        .eq('overlord_id', originalUser.id)
        .eq('is_active', true);

      // Restore original user state
      setUser(originalUser);
      setProfile(originalProfile);
      setIsImpersonating(false);
      setImpersonatedUser(null);
      setImpersonatedProfile(null);
      setOriginalUser(null);
      setOriginalProfile(null);
    } catch (error) {
      console.error('Error ending impersonation:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid auth state conflicts
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    refreshProfile,
    isImpersonating,
    originalUser,
    originalProfile,
    impersonatedUser,
    impersonatedProfile,
    startImpersonation,
    endImpersonation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};