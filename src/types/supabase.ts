export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: 'admin' | 'learner'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          role?: 'admin' | 'learner'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'admin' | 'learner'
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          category: 'Beginner' | 'Intermediate' | 'Advanced'
          created_by: string
          published: boolean
          created_at: string
          updated_at: string
          thumbnail_url?: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'Beginner' | 'Intermediate' | 'Advanced'
          created_by: string
          published?: boolean
          created_at?: string
          updated_at?: string
          thumbnail_url?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'Beginner' | 'Intermediate' | 'Advanced'
          created_by?: string
          published?: boolean
          created_at?: string
          updated_at?: string
          thumbnail_url?: string
        }
      }
      modules: {
        Row: {
          id: string
          title: string
          course_id: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          course_id: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          course_id?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          youtube_url: string
          module_id: string
          order_index: number
          created_at: string
          updated_at: string
          duration_seconds?: number
        }
        Insert: {
          id?: string
          title: string
          youtube_url: string
          module_id: string
          order_index?: number
          created_at?: string
          updated_at?: string
          duration_seconds?: number
        }
        Update: {
          id?: string
          title?: string
          youtube_url?: string
          module_id?: string
          order_index?: number
          created_at?: string
          updated_at?: string
          duration_seconds?: number
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          completed_at?: string | null
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          watched: boolean
          watched_at: string | null
          watch_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          watched?: boolean
          watched_at?: string | null
          watch_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          watched?: boolean
          watched_at?: string | null
          watch_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}