import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  // Get settings from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  
  // Add debug logs
  console.log('Creating conversation with settings:', settings);
  console.log('Greeting value:', settings.greeting);
  console.log('Context value:', settings.context);
  console.log('API Token (first 10 chars):', token?.substring(0, 10) + '...');
  
  // Build the context string
  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. Additional context: `;
  }
  contextString += settings.context || "";
  
  const payload = {
    persona_id: settings.persona || "pd43ffef",
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : "Hey there! I'm your technical co-pilot! Let's get get started building with Tavus.",
    conversational_context: contextString
  };
  
  console.log('Sending payload to API:', payload);
  
  try {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": token ?? "",
      },
      body: JSON.stringify(payload),
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response?.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      
      // Check for specific error types
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Tavus API key.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (response.status === 402) {
        throw new Error('Insufficient credits. Please check your Tavus account balance.');
      } else {
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('Conversation creation failed:', error);
    throw error;
  }
};
