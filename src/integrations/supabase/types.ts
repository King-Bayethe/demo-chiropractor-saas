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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_notes: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          note: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          note: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_notifications: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          message: string
          scheduled_for: string
          sent_at: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          message: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          message?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          created_at: string
          description: string | null
          end_time: string
          ghl_appointment_id: string | null
          id: string
          location: string | null
          notes: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          provider_id: string | null
          provider_name: string | null
          start_time: string
          status: string
          synced_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          ghl_appointment_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          provider_id?: string | null
          provider_name?: string | null
          start_time: string
          status?: string
          synced_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          ghl_appointment_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          provider_id?: string | null
          provider_name?: string | null
          start_time?: string
          status?: string
          synced_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blocked_time_slots: {
        Row: {
          created_at: string
          created_by: string
          end_time: string
          id: string
          is_recurring: boolean | null
          provider_id: string | null
          provider_name: string | null
          reason: string | null
          recurrence_pattern: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          provider_id?: string | null
          provider_name?: string | null
          reason?: string | null
          recurrence_pattern?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          provider_id?: string | null
          provider_name?: string | null
          reason?: string | null
          recurrence_pattern?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          form_data: Json
          form_type: string
          id: string
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_data: Json
          form_type: string
          id?: string
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          form_type?: string
          id?: string
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          gender: string | null
          ghl_contact_id: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string | null
          last_synced_at: string | null
          phone: string | null
          state: string | null
          tags: string[] | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          gender?: string | null
          ghl_contact_id?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          last_synced_at?: string | null
          phone?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          gender?: string | null
          ghl_contact_id?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          last_synced_at?: string | null
          phone?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_chat_participants: {
        Row: {
          archived_at: string | null
          chat_id: string
          id: string
          is_admin: boolean | null
          joined_at: string
          last_read_at: string | null
          name: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          chat_id: string
          id?: string
          is_admin?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          name?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          chat_id?: string
          id?: string
          is_admin?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_chat_participants_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "team_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chats: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          last_message_at: string | null
          name: string | null
          type: Database["public"]["Enums"]["chat_type"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string
        }
        Relationships: []
      }
      team_messages: {
        Row: {
          archived_at: string | null
          chat_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          archived_at?: string | null
          chat_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          archived_at?: string | null
          chat_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_messages_profiles"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "team_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "team_messages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_chat_admin: {
        Args: { chat_id_to_check: string; user_id_to_check: string }
        Returns: boolean
      }
    }
    Enums: {
      chat_type: "direct" | "group"
      message_type: "text" | "image" | "file" | "system"
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
      chat_type: ["direct", "group"],
      message_type: ["text", "image", "file", "system"],
    },
  },
} as const
