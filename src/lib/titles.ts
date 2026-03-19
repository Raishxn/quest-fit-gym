import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const fetchUserTitles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_titles')
    .select('*, title:titles(*)')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching titles:', error);
    return [];
  }
  return data;
};

export const updateSelectedTitle = async (userId: string, titleId: string | null) => {
  const { error } = await supabase
    .from('profiles')
    .update({ selected_title_id: titleId })
    .eq('user_id', userId);
    
  if (error) throw error;
};

export const fetchAllTitles = async () => {
  const { data, error } = await supabase
    .from('titles')
    .select('*')
    .order('requirement_value', { ascending: true }); // basic sorting
    
  if (error) {
    console.error('Error fetching all titles:', error);
    return [];
  }
  return data;
};

export const unlockTitle = async (userId: string, titleId: string) => {
  const { error } = await supabase
    .from('user_titles')
    .insert({ user_id: userId, title_id: titleId, is_equipped: false });
    
  if (error) throw error;
};
