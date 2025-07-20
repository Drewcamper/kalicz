import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication with Google
export const signInWithGoogle = async () => {
  const { user, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) console.error('Sign-in error:', error);
  return user;
};

// Storage functions
export const uploadImage = async (file, path) => {
  const { data, error } = await supabase.storage.from('images').upload(path, file);
  if (error) console.error('Upload error:', error);
  return data;
};

export const getImageUrl = path => {
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
};

// Database functions
export const getImages = async () => {
  const { data, error } = await supabase.from('images').select('*');
  if (error) console.error('Database error:', error);
  return data;
};
