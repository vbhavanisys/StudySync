import { supabase } from './supabase';

export interface SupabaseApplication {
  id?: string | number;
  company: string;
  role: string;
  status: string;
  applied_date: string;
}

export interface SupabaseNote {
  id?: string | number;
  title: string;
  content: string;
}

// ================= APPLICATIONS TABLE CRUD =================

export async function fetchApplications(): Promise<SupabaseApplication[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching applications from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function addApplication(app: Omit<SupabaseApplication, 'id'>): Promise<{ data: SupabaseApplication | null; error: string | null }> {
  // First attempt: insert without id (assuming auto-increment / identity column)
  const { data, error } = await supabase
    .from('applications')
    .insert([app])
    .select();

  if (!error && data && data.length > 0) {
    return { data: data[0], error: null };
  }

  // If error mentions null value in column "id" or missing id, retry with generated ID
  const errStr = JSON.stringify(error || '');
  if (error && (errStr.includes('null value in column "id"') || errStr.includes('id') || error.code === '23502')) {
    console.warn('Retrying Supabase application insert with generated numeric ID...');
    const generatedId = Date.now();
    const { data: retryData, error: retryError } = await supabase
      .from('applications')
      .insert([{ ...app, id: generatedId }])
      .select();

    if (!retryError && retryData && retryData.length > 0) {
      return { data: retryData[0], error: null };
    }

    if (retryError) {
      console.error('Error on retried application insert:', retryError);
      return { data: null, error: retryError.message || 'Failed to insert application with generated ID' };
    }
  }

  if (error) {
    console.error('Error inserting application into Supabase:', error);
    return { data: null, error: error.message || error.details || 'Supabase insert error' };
  }

  return { data: null, error: 'No data returned from Supabase insert' };
}

export async function deleteApplication(id: string | number): Promise<boolean> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application from Supabase:', error);
    return false;
  }
  return true;
}

// ================= NOTES TABLE CRUD =================

export async function fetchNotes(): Promise<SupabaseNote[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching notes from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function addNote(note: Omit<SupabaseNote, 'id'>): Promise<{ data: SupabaseNote | null; error: string | null }> {
  // First attempt: insert without id (assuming auto-increment / identity column)
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select();

  if (!error && data && data.length > 0) {
    return { data: data[0], error: null };
  }

  // If error mentions null value in column "id" or missing id, retry with generated ID
  const errStr = JSON.stringify(error || '');
  if (error && (errStr.includes('null value in column "id"') || errStr.includes('id') || error.code === '23502')) {
    console.warn('Retrying Supabase note insert with generated numeric ID...');
    const generatedId = Date.now();
    const { data: retryData, error: retryError } = await supabase
      .from('notes')
      .insert([{ ...note, id: generatedId }])
      .select();

    if (!retryError && retryData && retryData.length > 0) {
      return { data: retryData[0], error: null };
    }

    if (retryError) {
      console.error('Error on retried note insert:', retryError);
      return { data: null, error: retryError.message || 'Failed to insert note with generated ID' };
    }
  }

  if (error) {
    console.error('Error inserting note into Supabase:', error);
    return { data: null, error: error.message || error.details || 'Supabase insert error' };
  }

  return { data: null, error: 'No data returned from Supabase insert' };
}

export async function deleteNote(id: string | number): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting note from Supabase:', error);
    return false;
  }
  return true;
}
