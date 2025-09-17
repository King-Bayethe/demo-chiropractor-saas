import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_EMAIL = 'demo@healthcare-portfolio.com';
const DEMO_USER_PASSWORD = 'DemoPortfolio2024!';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAsDemo = async () => {
    try {
      // First try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });
      
      if (error) {
        console.error('Demo sign in error:', error);
        
        // If user doesn't exist or email not confirmed, try to create/recreate
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          
          console.log('Creating demo user...');
          await createDemoUser();
          
          // Wait a bit and try again
          setTimeout(async () => {
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: DEMO_USER_EMAIL,
              password: DEMO_USER_PASSWORD,
            });
            if (retryError) {
              console.error('Retry demo sign in error:', retryError);
              // For demo purposes, we'll continue even if login fails
              // The user can still see the demo data
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error signing in as demo user:', error);
      // Don't throw error for demo - allow partial functionality
    }
  };

  const createDemoUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: 'Demo',
            last_name: 'User',
            role: 'demo'
          }
        }
      });
      
      if (error) {
        console.error('Error creating demo user:', error);
        
        // If user already exists, that's okay for demo
        if (error.message.includes('User already registered')) {
          console.log('Demo user already exists');
        }
      } else {
        console.log('Demo user created successfully');
      }
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signInAsDemo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};