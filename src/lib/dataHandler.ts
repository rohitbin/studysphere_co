import { supabase } from './supabase';

export const getDbData = async () => {
  const { data: tests } = await supabase.from('tests').select('*');
  const { data: results } = await supabase.from('results').select('*');
  return { tests: tests || [], results: results || [] };
};

export const saveDbData = async (data: any) => {
  if (data.tests && data.tests.length > 0) {
    await supabase.from('tests').upsert(data.tests);
  }
  if (data.results && data.results.length > 0) {
    await supabase.from('results').upsert(data.results);
  }
};

export const getQuestionsData = async () => {
  const { data: questions } = await supabase.from('questions').select('*');
  return { questions: questions || [] };
};

export const saveQuestionsData = async (data: any) => {
  if (data.questions && data.questions.length > 0) {
    await supabase.from('questions').upsert(data.questions);
  }
};
