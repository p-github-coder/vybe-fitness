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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string | null
          created_at: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      attendance: {
        Row: {
          attended_on: string
          booking_id: string | null
          class_id: string | null
          created_at: string
          id: string
          member_id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          trainer_id: string | null
        }
        Insert: {
          attended_on?: string
          booking_id?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          trainer_id?: string | null
        }
        Update: {
          attended_on?: string
          booking_id?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string | null
          class_id: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time?: string | null
          class_id: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string | null
          class_id?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          age_group: string | null
          capacity: number
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number
          gym_id: string | null
          id: string
          image: string | null
          name: string
          published: boolean
          schedule: string | null
          target_body_area: string | null
          trainer: string | null
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          capacity?: number
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          gym_id?: string | null
          id?: string
          image?: string | null
          name: string
          published?: boolean
          schedule?: string | null
          target_body_area?: string | null
          trainer?: string | null
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          capacity?: number
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          gym_id?: string | null
          id?: string
          image?: string | null
          name?: string
          published?: boolean
          schedule?: string | null
          target_body_area?: string | null
          trainer?: string | null
          trainer_id?: string | null
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
      equipment: {
        Row: {
          benefits: string[]
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          image: string | null
          name: string
          published: boolean
          recommended_goals: string[]
          target_muscles: string[]
          updated_at: string
        }
        Insert: {
          benefits?: string[]
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image?: string | null
          name: string
          published?: boolean
          recommended_goals?: string[]
          target_muscles?: string[]
          updated_at?: string
        }
        Update: {
          benefits?: string[]
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image?: string | null
          name?: string
          published?: boolean
          recommended_goals?: string[]
          target_muscles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          equipment_id: string | null
          equipment_name: string | null
          id: string
          image: string | null
          instructions: string | null
          name: string
          published: boolean
          recommended_reps: string | null
          target_muscles: string[]
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment_id?: string | null
          equipment_name?: string | null
          id?: string
          image?: string | null
          instructions?: string | null
          name: string
          published?: boolean
          recommended_reps?: string | null
          target_muscles?: string[]
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment_id?: string | null
          equipment_name?: string | null
          id?: string
          image?: string | null
          instructions?: string | null
          name?: string
          published?: boolean
          recommended_reps?: string | null
          target_muscles?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      fitness_profiles: {
        Row: {
          age: number | null
          body_focus_areas: string[]
          completed: boolean
          completed_at: string | null
          created_at: string
          equipment_preferences: string[]
          fitness_level: string
          goals: string[]
          height_cm: number | null
          id: string
          updated_at: string
          user_id: string
          weight_kg: number | null
          workout_preferences: string[]
        }
        Insert: {
          age?: number | null
          body_focus_areas?: string[]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          equipment_preferences?: string[]
          fitness_level?: string
          goals?: string[]
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          workout_preferences?: string[]
        }
        Update: {
          age?: number | null
          body_focus_areas?: string[]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          equipment_preferences?: string[]
          fitness_level?: string
          goals?: string[]
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          workout_preferences?: string[]
        }
        Relationships: []
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
          access_level: string
          benefits: string[]
          created_at: string
          duration_days: number
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
          access_level?: string
          benefits?: string[]
          created_at?: string
          duration_days?: number
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
          access_level?: string
          benefits?: string[]
          created_at?: string
          duration_days?: number
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
      progress_entries: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recorded_on: string
          updated_at: string
          user_id: string
          weight_kg: number | null
          workouts_completed: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_on?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          workouts_completed?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_on?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          workouts_completed?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      trainer_assignments: {
        Row: {
          created_at: string
          id: string
          member_id: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          trainer_id?: string
        }
        Relationships: []
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
      user_memberships: {
        Row: {
          created_at: string
          expires_on: string | null
          id: string
          plan_id: string | null
          started_on: string
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_on?: string | null
          id?: string
          plan_id?: string | null
          started_on?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_on?: string | null
          id?: string
          plan_id?: string | null
          started_on?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
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
      workout_plan_items: {
        Row: {
          created_at: string
          day_of_week: string | null
          duration: string | null
          equipment: string | null
          exercise_id: string | null
          exercise_name: string
          id: string
          instructions: string | null
          plan_id: string
          reps: string | null
          sets: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          day_of_week?: string | null
          duration?: string | null
          equipment?: string | null
          exercise_id?: string | null
          exercise_name: string
          id?: string
          instructions?: string | null
          plan_id: string
          reps?: string | null
          sets?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          day_of_week?: string | null
          duration?: string | null
          equipment?: string | null
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          instructions?: string | null
          plan_id?: string
          reps?: string | null
          sets?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          focus: string | null
          id: string
          member_id: string
          notes: string | null
          source: string
          title: string
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          focus?: string | null
          id?: string
          member_id: string
          notes?: string | null
          source?: string
          title: string
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          focus?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          source?: string
          title?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: []
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
      attendance_status: "present" | "absent" | "late" | "excused"
      booking_status: "confirmed" | "cancelled" | "completed" | "waitlist"
      membership_status: "active" | "expired" | "cancelled" | "pending"
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
      attendance_status: ["present", "absent", "late", "excused"],
      booking_status: ["confirmed", "cancelled", "completed", "waitlist"],
      membership_status: ["active", "expired", "cancelled", "pending"],
    },
  },
} as const
