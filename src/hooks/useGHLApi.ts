import { supabase } from "@/integrations/supabase/client";

export const useGHLApi = () => {
  const callGHLFunction = async (functionName: string, options: RequestInit = {}) => {
    try {
      console.log(`Calling ${functionName} with:`, options);
      
      const response = await supabase.functions.invoke(functionName, {
        body: options.body,
        headers: options.headers as Record<string, string>,
      });

      console.log(`${functionName} response:`, response);

      if (response.error) {
        console.error(`${functionName} function error:`, response.error);
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  };

  const contacts = {
    getAll: async () => {
      console.log('Starting to fetch all contacts with batching...');
      let allContacts = [];
      let searchAfter = undefined;
      let hasMore = true;
      let batchCount = 0;

      while (hasMore && batchCount < 10) { // Safety limit of 10 batches
        batchCount++;
        console.log(`Fetching batch ${batchCount}, searchAfter:`, searchAfter);
        
        const batchResponse = await callGHLFunction('ghl-contacts', {
          body: JSON.stringify({ 
            action: 'getAll',
            searchAfter: searchAfter,
            pageLimit: 500 
          }),
        });

        if (batchResponse?.contacts) {
          allContacts.push(...batchResponse.contacts);
          console.log(`Batch ${batchCount} returned ${batchResponse.contacts.length} contacts. Total so far: ${allContacts.length}`);
          
          // Check if there are more contacts to fetch
          if (batchResponse.contacts.length > 0 && batchResponse.contacts[batchResponse.contacts.length - 1]?.searchAfter) {
            searchAfter = batchResponse.contacts[batchResponse.contacts.length - 1].searchAfter;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`Finished fetching contacts. Total: ${allContacts.length} contacts in ${batchCount} batches`);
      return { contacts: allContacts, total: allContacts.length };
    },
    getById: (id: string) => callGHLFunction('ghl-contacts', {
      body: JSON.stringify({ action: 'getById', contactId: id }),
    }),
    create: (contactData: any) => callGHLFunction('ghl-contacts', {
      body: JSON.stringify({ action: 'create', data: contactData }),
    }),
    update: (id: string, contactData: any) => callGHLFunction('ghl-contacts', {
      body: JSON.stringify({ action: 'update', contactId: id, data: contactData }),
    }),
  };

  const opportunities = {
    getAll: () => callGHLFunction('ghl-opportunities'),
    getReporting: () => callGHLFunction('ghl-opportunities/reporting'),
  };

  const conversations = {
    getAll: () => callGHLFunction('ghl-conversations', {
      body: JSON.stringify({ method: 'GET' }),
    }),
    getMessages: (conversationId: string) => callGHLFunction(`ghl-conversations/${conversationId}`),
    sendMessage: (messageData: any) => callGHLFunction('ghl-conversations', {
      body: JSON.stringify({ method: 'POST', ...messageData }),
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