export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      approval_events: {
        Row: {
          action: string
          admin_user: string
          affected_user: string
          created_at: string
          gym_id: string | null
          id: string
          notes: string | null
        }
        Insert: {
          action: string
          admin_user: string
          affected_user: string
          created_at?: string
          gym_id?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          action?: string
          admin_user?: string
          affected_user?: string
          created_at?: string
          gym_id?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_events_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          age_group: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          gym_id: string | null
          id: string
          image: string | null
          name: string
          published: boolean
          schedule: string | null
          target_body_area: string | null
          trainer: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          gym_id?: string | null
          id?: string
          image?: string | null
          name: string
          published?: boolean
          schedule?: string | null
          target_body_area?: string | null
          trainer?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          gym_id?: string | null
          id?: string
          image?: string | null
          name?: string
          published?: boolean
          schedule?: string | null
          target_body_area?: string | null
          trainer?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          gym_id: string | null
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          gym_id?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          gym_id?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          benefits: string[]
          created_at: string
          features: string[]
          gym_id: string | null
          id: string
          name: string
          period: string
          price: number
          published: boolean
          recommended: boolean
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          benefits?: string[]
          created_at?: string
          features?: string[]
          gym_id?: string | null
          id?: string
          name: string
          period?: string
          price?: number
          published?: boolean
          recommended?: boolean
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          benefits?: string[]
          created_at?: string
          features?: string[]
          gym_id?: string | null
          id?: string
          name?: string
          period?: string
          price?: number
          published?: boolean
          recommended?: boolean
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          age: number | null
          created_at: string
          email: string | null
          first_name: string | null
          gender: string | null
          gym_id: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_image: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          age?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gender?: string | null
          gym_id?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_image?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          age?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gender?: string | null
          gym_id?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_image?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          areas_of_expertise: string[]
          bio: string | null
          certifications: string[]
          created_at: string
          display_name: string | null
          gym_id: string | null
          id: string
          is_demo: boolean
          profile_image: string | null
          specialties: string[]
          updated_at: string
          user_id: string | null
          years_of_experience: number
        }
        Insert: {
          areas_of_expertise?: string[]
          bio?: string | null
          certifications?: string[]
          created_at?: string
          display_name?: string | null
          gym_id?: string | null
          id?: string
          is_demo?: boolean
          profile_image?: string | null
          specialties?: string[]
          updated_at?: string
          user_id?: string | null
          years_of_experience?: number
        }
        Update: {
          areas_of_expertise?: string[]
          bio?: string | null
          certifications?: string[]
          created_at?: string
          display_name?: string | null
          gym_id?: string | null
          id?: string
          is_demo?: boolean
          profile_image?: string | null
          specialties?: string[]
          updated_at?: string
          user_id?: string | null
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          gym_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          gym_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          gym_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_account_status: {
        Args: {
          _notes?: string
          _status: Database["public"]["Enums"]["account_status"]
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_status: "pending" | "approved" | "rejected" | "suspended"
      app_role: "member" | "trainer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["pending", "approved", "rejected", "suspended"],
      app_role: ["member", "trainer", "admin"],
    },
  },
} as const
