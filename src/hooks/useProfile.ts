import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  phone?: string;
  language_preference?: string;
  dark_mode?: boolean;
  email_signature?: string;
}

// Demo profile data for when auth fails
const DEMO_PROFILE: UserProfile = {
  id: 'demo-profile-id',
  user_id: 'demo-user-id',
  email: 'demo@healthcare-portfolio.com',
  first_name: 'Demo',
  last_name: 'User',
  role: 'demo',
  is_active: true,
  language_preference: 'en',
  dark_mode: false
};

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        // Check if we should provide demo profile
        const currentUrl = window.location.href;
        
        // If user is trying to access the app and no auth, provide demo profile
        if (currentUrl.includes('dashboard') || currentUrl.includes('patients') || 
            localStorage.getItem('demo-mode') === 'true') {
          console.log('Providing demo profile for unauthenticated access');
          setProfile(DEMO_PROFILE);
          localStorage.setItem('demo-mode', 'true');
        } else {
          setProfile(null);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createProfile(user.user);
          return;
        }
        
        // If user email is demo, provide demo profile as fallback
        if (user.user.email === 'demo@healthcare-portfolio.com') {
          setProfile(DEMO_PROFILE);
          setLoading(false);
          return;
        }
        
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Fallback to demo profile if available
      const { data: user } = await supabase.auth.getUser();
      if (user.user?.email === 'demo@healthcare-portfolio.com') {
        setProfile(DEMO_PROFILE);
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (user: any) => {
    try {
      const newProfile = {
        user_id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || user.user_metadata?.role === 'demo' ? 'Demo' : '',
        last_name: user.user_metadata?.last_name || user.user_metadata?.role === 'demo' ? 'User' : '',
        role: user.user_metadata?.role || (user.email === 'demo@healthcare-portfolio.com' ? 'demo' : 'staff'),
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
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) return;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', profile.user_id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!profile) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    changePassword,
    uploadAvatar,
    refetchProfile: fetchProfile
  };
};