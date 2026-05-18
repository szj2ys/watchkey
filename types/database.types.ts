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
      videos: {
        Row: {
          id: string
          youtube_id: string
          title: string
          channel: string
          duration: number
          thumbnail_url: string
          created_at: string
        }
        Insert: {
          id?: string
          youtube_id: string
          title: string
          channel: string
          duration: number
          thumbnail_url: string
          created_at?: string
        }
        Update: {
          id?: string
          youtube_id?: string
          title?: string
          channel?: string
          duration?: number
          thumbnail_url?: string
          created_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          video_id: string
          chapters: Json
          summary: string | null
          transcript: Json
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          chapters?: Json
          summary?: string | null
          transcript?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          chapters?: Json
          summary?: string | null
          transcript?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
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
