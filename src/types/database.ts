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
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price: number
          width_meters: number
          depth_meters: number
          bedrooms: number
          bathrooms: number
          suites: number
          garage_spots: number
          built_area: number
          style: string | null
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          price: number
          width_meters: number
          depth_meters: number
          bedrooms: number
          bathrooms: number
          suites: number
          garage_spots: number
          built_area: number
          style?: string | null
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          price?: number
          width_meters?: number
          depth_meters?: number
          bedrooms?: number
          bathrooms?: number
          suites?: number
          garage_spots?: number
          built_area?: number
          style?: string | null
          is_featured?: boolean
          created_at?: string
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          is_cover: boolean
          display_order: number
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          is_cover?: boolean
          display_order?: number
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          is_cover?: boolean
          display_order?: number
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string | null
          terrain_dimensions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message?: string | null
          terrain_dimensions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string | null
          terrain_dimensions?: string | null
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

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProjectImage = Database['public']['Tables']['project_images']['Row']
export type ProjectImageInsert = Database['public']['Tables']['project_images']['Insert']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']

// Helper type for project with images
export type ProjectWithImages = Project & {
  project_images: ProjectImage[]
}
