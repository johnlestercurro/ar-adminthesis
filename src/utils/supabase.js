import { createClient } from '@supabase/supabase-js';

// Supabase client for all tables (auth.users, profiles, feedback, metrics, activities, notifications, destinations)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Form Action utils
export const formActionDefault = {
  formProcess: false,
  formStatus: 200,
  formErrorMessage: '',
  formSuccessMessage: '',
};

// Check if the session exists and is valid: returns false if there's an error
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session', error.message);
    return false;
  }
  return !!data.session;
};
