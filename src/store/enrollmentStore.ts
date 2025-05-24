import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];

interface EnrollmentState {
  enrollments: Enrollment[];
  courseProgress: {
    [courseId: string]: {
      totalVideos: number;
      watchedVideos: number;
      percentComplete: number;
      isCompleted: boolean;
    };
  };
  isLoading: boolean;
  error: string | null;
  
  fetchUserEnrollments: (userId: string) => Promise<void>;
  enrollInCourse: (userId: string, courseId: string) => Promise<void>;
  updateVideoProgress: (userId: string, videoId: string, watchPercentage: number) => Promise<void>;
  fetchCourseProgress: (userId: string, courseId: string) => Promise<void>;
  checkCourseCompletion: (userId: string, courseId: string) => Promise<boolean>;
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrollments: [],
  courseProgress: {},
  isLoading: false,
  error: null,
  
  fetchUserEnrollments: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set({ enrollments: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  enrollInCourse: async (userId: string, courseId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingEnrollment) {
        // Already enrolled
        set({ isLoading: false });
        return;
      }
      
      // Create enrollment
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Initialize progress records for all videos in the course
      const { data: coursesWithModules, error: fetchError } = await supabase
        .from('courses')
        .select(`
          id,
          modules (
            id,
            videos (
              id
            )
          )
        `)
        .eq('id', courseId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Flatten the videos from all modules
      const videoIds = coursesWithModules.modules.flatMap(module => 
        module.videos.map(video => video.id)
      );
      
      // Create progress entries for each video
      const progressEntries = videoIds.map(videoId => ({
        user_id: userId,
        video_id: videoId,
        watched: false,
        watch_percentage: 0,
      }));
      
      if (progressEntries.length > 0) {
        const { error: progressError } = await supabase
          .from('progress')
          .insert(progressEntries);
        
        if (progressError) throw progressError;
      }
      
      // Update the enrollments state
      set(state => ({
        enrollments: [...state.enrollments, data],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error enrolling in course:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  updateVideoProgress: async (userId: string, videoId: string, watchPercentage: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const watched = watchPercentage >= 90; // Consider watched if 90% or more is viewed
      
      // Check if progress record exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('progress')
          .update({
            watched,
            watch_percentage: watchPercentage,
            watched_at: watched ? new Date().toISOString() : existingProgress.watched_at
          })
          .eq('id', existingProgress.id);
        
        if (error) throw error;
      } else {
        // Create new progress
        const { error } = await supabase
          .from('progress')
          .insert({
            user_id: userId,
            video_id: videoId,
            watched,
            watch_percentage: watchPercentage,
            watched_at: watched ? new Date().toISOString() : null
          });
        
        if (error) throw error;
      }
      
      set({ isLoading: false });
      
      // Get video's module and course
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select(`
          module_id,
          modules (
            course_id
          )
        `)
        .eq('id', videoId)
        .single();
      
      if (videoError) throw videoError;
      
      // Check if course is completed
      const courseId = videoData.modules.course_id;
      const isCompleted = await get().checkCourseCompletion(userId, courseId);
      
      if (isCompleted) {
        // Update enrollment as completed
        const { error: updateError } = await supabase
          .from('enrollments')
          .update({
            completed_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchCourseProgress: async (userId: string, courseId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get all videos for the course
      const { data: coursesWithVideos, error: fetchError } = await supabase
        .from('courses')
        .select(`
          id,
          modules (
            id,
            videos (
              id
            )
          )
        `)
        .eq('id', courseId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Flatten the videos from all modules
      const videoIds = coursesWithVideos.modules.flatMap(module => 
        module.videos.map(video => video.id)
      );
      
      const totalVideos = videoIds.length;
      
      // Get user's progress for these videos
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .in('video_id', videoIds);
      
      if (progressError) throw progressError;
      
      const watchedVideos = progressData.filter(p => p.watched).length;
      const percentComplete = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;
      const isCompleted = totalVideos > 0 && watchedVideos === totalVideos;
      
      // Update the courseProgress state
      set(state => ({
        courseProgress: {
          ...state.courseProgress,
          [courseId]: {
            totalVideos,
            watchedVideos,
            percentComplete,
            isCompleted
          }
        },
        isLoading: false
      }));
      
      return {
        totalVideos,
        watchedVideos,
        percentComplete,
        isCompleted
      };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      set({ error: (error as Error).message, isLoading: false });
      return {
        totalVideos: 0,
        watchedVideos: 0,
        percentComplete: 0,
        isCompleted: false
      };
    }
  },
  
  checkCourseCompletion: async (userId: string, courseId: string) => {
    try {
      const progress = await get().fetchCourseProgress(userId, courseId);
      return progress.isCompleted;
    } catch (error) {
      console.error('Error checking course completion:', error);
      return false;
    }
  }
}));