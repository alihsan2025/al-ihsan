import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Call a Supabase Edge Function.
 * Fires and forgets — failures are logged but never block the UI.
 */
export const callEdgeFunction = async (
  functionName: string,
  body: Record<string, unknown>
) => {
  try {
    // Get the current session token for auth (if logged in)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`,
    };

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.warn(`Edge function ${functionName} returned ${response.status}:`, text);
    }
  } catch (error) {
    // Never throw — email notifications must not block the user experience
    console.warn(`Edge function ${functionName} call failed (non-blocking):`, error);
  }
};
