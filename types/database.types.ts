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
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          youtube_id: string
          title: string
          channel: string
          duration: number
          thumbnail_url: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          youtube_id?: string
          title?: string
          channel?: string
          duration?: number
          thumbnail_url?: string
          user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      analyses: {
        Row: {
          id: string
          video_id: string
          chapters: Json
          summary: string | null
          transcript: Json
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          chapters?: Json
          summary?: string | null
          transcript?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          chapters?: Json
          summary?: string | null
          transcript?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error?: string | null
          user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          youtube_refresh_token: string | null
          analysis_count: number
          analysis_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          youtube_refresh_token?: string | null
          analysis_count?: number
          analysis_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          youtube_refresh_token?: string | null
          analysis_count?: number
          analysis_limit?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
