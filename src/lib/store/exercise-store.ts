// Store cho exercises

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { Exercise, Chapter, UserProgress } from '@/types';

interface ExerciseState {
  exercises: Exercise[];
  chapters: Chapter[];
  currentExercise: Exercise | null;
  userProgress: Map<string, UserProgress>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchExercises: (subjectSlug: string, chapterNumber?: number) => Promise<void>;
  fetchChapters: (subjectSlug: string) => Promise<void>;
  fetchExerciseBySlug: (slug: string) => Promise<void>;
  fetchUserProgress: () => Promise<void>;
  submitExercise: (exerciseId: string, answer: string) => Promise<void>;
  setCurrentExercise: (exercise: Exercise | null) => void;
  clearError: () => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: [],
      chapters: [],
      currentExercise: null,
      userProgress: new Map(),
      isLoading: false,
      error: null,

      fetchExercises: async (subjectSlug: string, chapterNumber?: number) => {
        set({ isLoading: true, error: null });
        try {
          let query = supabase
            .from('exercises')
            .select('*')
            .eq('subject_slug', subjectSlug)
            .eq('is_published', true)
            .order('chapter_number', { ascending: true })
            .order('exercise_number', { ascending: true });

          if (chapterNumber) {
            query = query.eq('chapter_number', chapterNumber);
          }

          const { data, error } = await query;

          if (error) throw error;

          const exercises: Exercise[] = (data || []).map((item: any) => ({
            id: item.id,
            slug: item.slug,
            subjectSlug: item.subject_slug,
            chapterNumber: item.chapter_number,
            exerciseNumber: item.exercise_number,
            title: item.title,
            difficulty: item.difficulty,
            content: item.content,
            solution: item.solution,
            hints: item.hints || [],
            tags: item.tags || [],
            points: item.points,
            timeLimit: item.time_limit,
            createdAt: new Date(item.created_at),
          }));

          set({ exercises, isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to fetch exercises' 
          });
        }
      },

      fetchChapters: async (subjectSlug: string) => {
        try {
          const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('subject_slug', subjectSlug)
            .eq('is_published', true)
            .order('chapter_number', { ascending: true });

          if (error) throw error;

          const chapters: Chapter[] = (data || []).map((item: any) => ({
            id: item.id,
            subjectSlug: item.subject_slug,
            chapterNumber: item.chapter_number,
            title: item.title,
            description: item.description,
            estimatedTime: item.estimated_time,
            orderIndex: item.order_index,
          }));

          set({ chapters });
        } catch (error) {
          console.error('Failed to fetch chapters:', error);
        }
      },

      fetchExerciseBySlug: async (slug: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

          if (error) throw error;

          const exercise: Exercise = {
            id: data.id,
            slug: data.slug,
            subjectSlug: data.subject_slug,
            chapterNumber: data.chapter_number,
            exerciseNumber: data.exercise_number,
            title: data.title,
            difficulty: data.difficulty,
            content: data.content,
            solution: data.solution,
            hints: data.hints || [],
            tags: data.tags || [],
            points: data.points,
            timeLimit: data.time_limit,
            createdAt: new Date(data.created_at),
          };

          set({ currentExercise: exercise, isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to fetch exercise' 
          });
        }
      },

      fetchUserProgress: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('user_exercise_progress')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          const progressMap = new Map<string, UserProgress>();
          (data || []).forEach((item: any) => {
            progressMap.set(item.exercise_id, {
              id: item.id,
              userId: item.user_id,
              exerciseId: item.exercise_id,
              status: item.status,
              attempts: item.attempts,
              score: item.score,
              startedAt: item.started_at ? new Date(item.started_at) : undefined,
              completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
              timeSpent: item.time_spent,
            });
          });

          set({ userProgress: progressMap });
        } catch (error) {
          console.error('Failed to fetch user progress:', error);
        }
      },

      submitExercise: async (exerciseId: string, answer: string) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          // Insert submission
          const { error: submitError } = await supabase
            .from('exercise_submissions')
            .insert({
              user_id: user.id,
              exercise_id: exerciseId,
              content: answer,
            });

          if (submitError) throw submitError;

          // Update progress
          const { error: progressError } = await supabase
            .from('user_exercise_progress')
            .upsert({
              user_id: user.id,
              exercise_id: exerciseId,
              status: 'completed',
              attempts: get().userProgress.get(exerciseId)?.attempts || 0 + 1,
              completed_at: new Date().toISOString(),
              last_answer: answer,
            }, {
              onConflict: 'user_id,exercise_id'
            });

          if (progressError) throw progressError;

          // Refresh progress
          await get().fetchUserProgress();
        } catch (error) {
          console.error('Failed to submit exercise:', error);
          throw error;
        }
      },

      setCurrentExercise: (exercise: Exercise | null) => {
        set({ currentExercise: exercise });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'exercise-storage',
      partialize: (state) => ({ userProgress: Array.from(state.userProgress.entries()) }),
    }
  )
);
