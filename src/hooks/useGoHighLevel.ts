import { supabase } from "@/integrations/supabase/client";

export const useGoHighLevel = () => {
  const getMessageRecording = async (messageId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-recordings', {
        body: { recordingId: messageId }
      });
      
      if (error) {
        console.error('Error fetching recording:', error);
        throw error;
      }
      
      return {
        recording: {
          url: data?.audioDataUrl || data?.url,
          metadata: data?.metadata
        }
      };
    } catch (error) {
      console.error('Failed to get message recording:', error);
      throw error;
    }
  };

  const getMessageTranscription = async (messageId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-transcriptions', {
        body: { recordingId: messageId }
      });
      
      if (error) {
        console.error('Error fetching transcription:', error);
        throw error;
      }
      
      return {
        transcription: {
          text: data?.text,
          status: data?.status,
          confidence: data?.confidence
        }
      };
    } catch (error) {
      console.error('Failed to get message transcription:', error);
      throw error;
    }
  };

  return {
    getMessageRecording,
    getMessageTranscription
  };
};