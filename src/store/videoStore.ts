import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Video } from './courseStore';

interface VideoState {
  videos: Video[];
  selectedVideo: Video | null;
  isLoading: boolean;
  error: string | null;
  
  fetchVideos: (moduleId: string) => Promise<void>;
  createVideo: (videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateVideo: (videoId: string, videoData: Partial<Video>) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  reorderVideos: (moduleId: string, videoIds: string[]) => Promise<void>;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  selectedVideo: null,
  isLoading: false,
  error: null,
  
  fetchVideos: async (moduleId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      set({ videos: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching videos:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createVideo: async (videoData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the highest order index for the module
      const { data: existingVideos, error: fetchError } = await supabase
        .from('videos')
        .select('order_index')
        .eq('module_id', videoData.module_id)
        .order('order_index', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      const newOrderIndex = existingVideos.length > 0 ? (existingVideos[0]?.order_index || 0) + 1 : 0;
      
      // Extract YouTube video ID from URL
      const youtubeUrl = videoData.youtube_url;
      
      const { data, error } = await supabase
        .from('videos')
        .insert({ ...videoData, order_index: newOrderIndex })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the videos state
      set(state => ({
        videos: [...state.videos, data],
        isLoading: false
      }));
      
      return data.id;
    } catch (error) {
      console.error('Error creating video:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateVideo: async (videoId, videoData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', videoId);
      
      if (error) throw error;
      
      // Update the videos state
      set(state => ({
        videos: state.videos.map(video => 
          video.id === videoId ? { ...video, ...videoData } : video
        ),
        selectedVideo: state.selectedVideo?.id === videoId 
          ? { ...state.selectedVideo, ...videoData }
          : state.selectedVideo,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating video:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteVideo: async (videoId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
      
      // Update the videos state
      set(state => ({
        videos: state.videos.filter(video => video.id !== videoId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting video:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  reorderVideos: async (moduleId, videoIds) => {
    try {
      set({ isLoading: true, error: null });
      
      // Update each video with new order index
      const updates = videoIds.map((id, index) => 
        supabase
          .from('videos')
          .update({ order_index: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
      
      // Refresh the videos
      await get().fetchVideos(moduleId);
    } catch (error) {
      console.error('Error reordering videos:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));