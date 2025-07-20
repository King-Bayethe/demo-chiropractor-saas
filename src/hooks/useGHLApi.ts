import { supabase } from "@/integrations/supabase/client";

export const useGHLApi = () => {
  const callGHLFunction = async (functionName: string, options: RequestInit = {}) => {
    try {
      const response = await supabase.functions.invoke(functionName, {
        body: options.body,
        headers: options.headers as Record<string, string>,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  };

  const contacts = {
    getAll: () => callGHLFunction('ghl-contacts'),
    getById: (id: string) => callGHLFunction(`ghl-contacts/${id}`),
    create: (contactData: any) => callGHLFunction('ghl-contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),
    update: (id: string, contactData: any) => callGHLFunction(`ghl-contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(contactData),
    }),
  };

  const opportunities = {
    getAll: () => callGHLFunction('ghl-opportunities'),
    getReporting: () => callGHLFunction('ghl-opportunities/reporting'),
  };

  const conversations = {
    getAll: () => callGHLFunction('ghl-conversations'),
    getMessages: (conversationId: string) => callGHLFunction(`ghl-conversations/${conversationId}`),
    sendMessage: (messageData: any) => callGHLFunction('ghl-conversations', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
  };

  const emails = {
    getAll: () => callGHLFunction('ghl-emails'),
    send: (emailData: any) => callGHLFunction('ghl-emails', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }),
  };

  return {
    contacts,
    opportunities,
    conversations,
    emails,
  };
};