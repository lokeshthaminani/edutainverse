import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Module, Video } from './courseStore';

interface ModuleState {
  modules: Module[];
  selectedModule: Module | null;
  moduleVideos: Video[];
  isLoading: boolean;
  error: string | null;
  
  fetchModules: (courseId: string) => Promise<void>;
  fetchModuleDetails: (moduleId: string) => Promise<void>;
  createModule: (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateModule: (moduleId: string, moduleData: Partial<Module>) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  reorderModules: (courseId: string, moduleIds: string[]) => Promise<void>;
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: [],
  selectedModule: null,
  moduleVideos: [],
  isLoading: false,
  error: null,
  
  fetchModules: async (courseId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      set({ modules: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching modules:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchModuleDetails: async (moduleId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get module details
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();
      
      if (moduleError) throw moduleError;
      
      // Get module videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });
      
      if (videosError) throw videosError;
      
      set({
        selectedModule: moduleData,
        moduleVideos: videosData,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching module details:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createModule: async (moduleData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the highest order index for the course
      const { data: existingModules, error: fetchError } = await supabase
        .from('modules')
        .select('order_index')
        .eq('course_id', moduleData.course_id)
        .order('order_index', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      const newOrderIndex = existingModules.length > 0 ? (existingModules[0]?.order_index || 0) + 1 : 0;
      
      const { data, error } = await supabase
        .from('modules')
        .insert({ ...moduleData, order_index: newOrderIndex })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the modules state
      set(state => ({
        modules: [...state.modules, data],
        isLoading: false
      }));
      
      return data.id;
    } catch (error) {
      console.error('Error creating module:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateModule: async (moduleId, moduleData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId);
      
      if (error) throw error;
      
      // Update the modules state
      set(state => ({
        modules: state.modules.map(module => 
          module.id === moduleId ? { ...module, ...moduleData } : module
        ),
        selectedModule: state.selectedModule?.id === moduleId 
          ? { ...state.selectedModule, ...moduleData }
          : state.selectedModule,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating module:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteModule: async (moduleId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);
      
      if (error) throw error;
      
      // Update the modules state
      set(state => ({
        modules: state.modules.filter(module => module.id !== moduleId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting module:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  reorderModules: async (courseId, moduleIds) => {
    try {
      set({ isLoading: true, error: null });
      
      // Update each module with new order index
      const updates = moduleIds.map((id, index) => 
        supabase
          .from('modules')
          .update({ order_index: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
      
      // Refresh the modules
      await get().fetchModules(courseId);
    } catch (error) {
      console.error('Error reordering modules:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));