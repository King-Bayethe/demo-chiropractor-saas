import { supabase } from "@/integrations/supabase/client";

export const useGoHighLevel = () => {
  const getMessageRecording = async (messageId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-recordings', {
        body: { recordingId: messageId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recording:', error);
      throw error;
    }
  };

  const getMessageTranscription = async (messageId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-transcriptions', {
        body: { recordingId: messageId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transcription:', error);
      throw error;
    }
  };

  return {
    getMessageRecording,
    getMessageTranscription
  };
};