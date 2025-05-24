import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type Course = Database['public']['Tables']['courses']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];

interface CourseState {
  courses: Course[];
  filteredCourses: Course[];
  selectedCourse: Course | null;
  selectedCourseModules: Module[];
  isLoading: boolean;
  error: string | null;
  
  fetchCourses: () => Promise<void>;
  fetchCoursesByCategory: (category: string) => Promise<void>;
  fetchCourseDetails: (courseId: string) => Promise<void>;
  createCourse: (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  publishCourse: (courseId: string, publish: boolean) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  filteredCourses: [],
  selectedCourse: null,
  selectedCourseModules: [],
  isLoading: false,
  error: null,
  
  fetchCourses: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ courses: data, filteredCourses: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching courses:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchCoursesByCategory: async (category: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (category === 'All') {
        await get().fetchCourses();
        return;
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ filteredCourses: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchCourseDetails: async (courseId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseError) throw courseError;
      
      // Get course modules with videos
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          videos (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (modulesError) throw modulesError;
      
      set({
        selectedCourse: courseData,
        selectedCourseModules: modulesData,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createCourse: async (courseData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the courses state
      set(state => ({
        courses: [data, ...state.courses],
        isLoading: false
      }));
      
      return data.id;
    } catch (error) {
      console.error('Error creating course:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateCourse: async (courseId, courseData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId);
      
      if (error) throw error;
      
      // Update the courses state
      set(state => ({
        courses: state.courses.map(course => 
          course.id === courseId ? { ...course, ...courseData } : course
        ),
        selectedCourse: state.selectedCourse?.id === courseId 
          ? { ...state.selectedCourse, ...courseData }
          : state.selectedCourse,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating course:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteCourse: async (courseId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      
      // Update the courses state
      set(state => ({
        courses: state.courses.filter(course => course.id !== courseId),
        filteredCourses: state.filteredCourses.filter(course => course.id !== courseId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting course:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  publishCourse: async (courseId, publish) => {
    try {
      await get().updateCourse(courseId, { published: publish });
    } catch (error) {
      console.error('Error publishing course:', error);
      throw error;
    }
  }
}));