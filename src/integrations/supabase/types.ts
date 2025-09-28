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
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          created_by: string
          id: string
          message: string | null
          minutes_before: number
          reminder_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          created_by: string
          id?: string
          message?: string | null
          minutes_before?: number
          reminder_type: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          created_by?: string
          id?: string
          message?: string | null
          minutes_before?: number
          reminder_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string | null
          cancellation_reason: string | null
          checked_in_at: string | null
          completed_at: string | null
          confirmation_status: string | null
          created_at: string
          description: string | null
          end_time: string
          ghl_appointment_id: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          notes: string | null
          organization_id: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_notes: string | null
          patient_phone: string | null
          provider_id: string | null
          provider_name: string | null
          recurrence_pattern: string | null
          recurring_appointment_id: string | null
          start_time: string
          status: string
          synced_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string | null
          cancellation_reason?: string | null
          checked_in_at?: string | null
          completed_at?: string | null
          confirmation_status?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          ghl_appointment_id?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          notes?: string | null
          organization_id?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_notes?: string | null
          patient_phone?: string | null
          provider_id?: string | null
          provider_name?: string | null
          recurrence_pattern?: string | null
          recurring_appointment_id?: string | null
          start_time: string
          status?: string
          synced_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string | null
          cancellation_reason?: string | null
          checked_in_at?: string | null
          completed_at?: string | null
          confirmation_status?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          ghl_appointment_id?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          notes?: string | null
          organization_id?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_notes?: string | null
          patient_phone?: string | null
          provider_id?: string | null
          provider_name?: string | null
          recurrence_pattern?: string | null
          recurring_appointment_id?: string | null
          start_time?: string
          status?: string
          synced_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
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
      custom_templates: {
        Row: {
          age_groups: string[] | null
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          keywords: string[] | null
          name: string
          organization_id: string | null
          specialty: string | null
          template_data: Json
          updated_at: string
          urgency_level: string | null
          version: number | null
        }
        Insert: {
          age_groups?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          keywords?: string[] | null
          name: string
          organization_id?: string | null
          specialty?: string | null
          template_data: Json
          updated_at?: string
          urgency_level?: string | null
          version?: number | null
        }
        Update: {
          age_groups?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          keywords?: string[] | null
          name?: string
          organization_id?: string | null
          specialty?: string | null
          template_data?: Json
          updated_at?: string
          urgency_level?: string | null
          version?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          name: string
          organization_id: string | null
          patient_id: string | null
          patient_name: string | null
          referral_source: string | null
          status: string
          type: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          name: string
          organization_id?: string | null
          patient_id?: string | null
          patient_name?: string | null
          referral_source?: string | null
          status?: string
          type?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          name?: string
          organization_id?: string | null
          patient_id?: string | null
          patient_name?: string | null
          referral_source?: string | null
          status?: string
          type?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_audit: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          form_submission_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          form_submission_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          form_submission_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_audit_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          form_type: string
          id: string
          ip_address: unknown
          submission_count: number | null
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          form_type: string
          id?: string
          ip_address: unknown
          submission_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          form_type?: string
          id?: string
          ip_address?: unknown
          submission_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          form_data: Json
          form_type: string
          honeypot_field: string | null
          id: string
          ip_address: unknown | null
          is_verified: boolean | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          status: string
          submission_source: string | null
          submission_time_ms: number | null
          submitted_at: string
          updated_at: string
          user_agent: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          form_data: Json
          form_type: string
          honeypot_field?: string | null
          id?: string
          ip_address?: unknown | null
          is_verified?: boolean | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          submission_source?: string | null
          submission_time_ms?: number | null
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          form_data?: Json
          form_type?: string
          honeypot_field?: string | null
          id?: string
          ip_address?: unknown | null
          is_verified?: boolean | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          submission_source?: string | null
          submission_time_ms?: number | null
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
          verification_token?: string | null
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
      impersonation_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          impersonated_user_id: string
          ip_address: unknown | null
          is_active: boolean
          overlord_id: string
          reason: string | null
          started_at: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          impersonated_user_id: string
          ip_address?: unknown | null
          is_active?: boolean
          overlord_id: string
          reason?: string | null
          started_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          impersonated_user_id?: string
          ip_address?: unknown | null
          is_active?: boolean
          overlord_id?: string
          reason?: string | null
          started_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      ip_whitelist: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          ip_address: unknown
          is_active: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          last_used_at: string | null
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_status: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          priority: string | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_status?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_status?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          assigned_provider_name: string | null
          assigned_to: string | null
          attorney_contact: string | null
          attorney_name: string | null
          attorney_referred: boolean | null
          case_type: string | null
          consultation_scheduled_at: string | null
          created_at: string
          created_by: string
          description: string | null
          estimated_value: number | null
          expected_close_date: string | null
          form_submission_id: string | null
          id: string
          insurance_coverage_amount: number | null
          last_contact_date: string | null
          name: string
          next_follow_up_date: string | null
          notes: string | null
          organization_id: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          pipeline_stage: string
          priority: string | null
          referral_source: string | null
          source: string | null
          status: string
          tags: string[] | null
          treatment_start_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_provider_name?: string | null
          assigned_to?: string | null
          attorney_contact?: string | null
          attorney_name?: string | null
          attorney_referred?: boolean | null
          case_type?: string | null
          consultation_scheduled_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          form_submission_id?: string | null
          id?: string
          insurance_coverage_amount?: number | null
          last_contact_date?: string | null
          name: string
          next_follow_up_date?: string | null
          notes?: string | null
          organization_id?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          pipeline_stage?: string
          priority?: string | null
          referral_source?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          treatment_start_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_provider_name?: string | null
          assigned_to?: string | null
          attorney_contact?: string | null
          attorney_name?: string | null
          attorney_referred?: boolean | null
          case_type?: string | null
          consultation_scheduled_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          form_submission_id?: string | null
          id?: string
          insurance_coverage_amount?: number | null
          last_contact_date?: string | null
          name?: string
          next_follow_up_date?: string | null
          notes?: string | null
          organization_id?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          pipeline_stage?: string
          priority?: string | null
          referral_source?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          treatment_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          branding: Json | null
          city: string | null
          created_at: string
          email: string | null
          features: Json
          id: string
          max_patients: number
          max_users: number
          name: string
          phone: string | null
          slug: string
          state: string | null
          subscription_plan: string
          subscription_status: string
          trial_ends_at: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          branding?: Json | null
          city?: string | null
          created_at?: string
          email?: string | null
          features?: Json
          id?: string
          max_patients?: number
          max_users?: number
          name: string
          phone?: string | null
          slug: string
          state?: string | null
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          branding?: Json | null
          city?: string | null
          created_at?: string
          email?: string | null
          features?: Json
          id?: string
          max_patients?: number
          max_users?: number
          name?: string
          phone?: string | null
          slug?: string
          state?: string | null
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      patient_conversations: {
        Row: {
          conversation_type: string
          created_at: string
          created_by: string | null
          ghl_conversation_id: string | null
          id: string
          last_message_at: string | null
          patient_id: string
          status: string
          title: string | null
          unread_count: number
          updated_at: string
        }
        Insert: {
          conversation_type?: string
          created_at?: string
          created_by?: string | null
          ghl_conversation_id?: string | null
          id?: string
          last_message_at?: string | null
          patient_id: string
          status?: string
          title?: string | null
          unread_count?: number
          updated_at?: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          created_by?: string | null
          ghl_conversation_id?: string | null
          id?: string
          last_message_at?: string | null
          patient_id?: string
          status?: string
          title?: string | null
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_files: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          patient_id: string
          uploaded_by: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          patient_id: string
          uploaded_by: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          patient_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          ghl_delivered_at: string | null
          ghl_message_id: string | null
          ghl_read_at: string | null
          ghl_sent_at: string | null
          id: string
          last_retry_at: string | null
          message_type: string
          metadata: Json | null
          retry_count: number | null
          sender_id: string | null
          sender_type: string
          status: string
          sync_status: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          ghl_delivered_at?: string | null
          ghl_message_id?: string | null
          ghl_read_at?: string | null
          ghl_sent_at?: string | null
          id?: string
          last_retry_at?: string | null
          message_type?: string
          metadata?: Json | null
          retry_count?: number | null
          sender_id?: string | null
          sender_type: string
          status?: string
          sync_status?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          ghl_delivered_at?: string | null
          ghl_message_id?: string | null
          ghl_read_at?: string | null
          ghl_sent_at?: string | null
          id?: string
          last_retry_at?: string | null
          message_type?: string
          metadata?: Json | null
          retry_count?: number | null
          sender_id?: string | null
          sender_type?: string
          status?: string
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "patient_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notes: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          patient_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          patient_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          patient_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_providers: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          is_active: boolean
          patient_id: string
          provider_id: string
          role: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          patient_id: string
          provider_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          patient_id?: string
          provider_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_providers_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_providers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patients: {
        Row: {
          accident_date: string | null
          accident_description: string | null
          accident_impact_details: Json | null
          accident_time: string | null
          address: string | null
          adjuster_name: string | null
          age: number | null
          alcohol_consumption: string | null
          allergies: string | null
          alternative_communication: string | null
          attorney_name: string | null
          attorney_phone: string | null
          auto_insurance_company: string | null
          auto_policy_number: string | null
          body_part_hit: string | null
          case_type: string | null
          cell_phone: string | null
          chronic_conditions: string | null
          city: string | null
          claim_number: string | null
          consciousness_duration: string | null
          consent_acknowledgement: boolean | null
          created_at: string
          current_medications: string | null
          current_symptoms: Json | null
          date_of_birth: string | null
          did_go_to_hospital: boolean | null
          drivers_license: string | null
          drivers_license_state: string | null
          email: string | null
          email_consent: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          emergency_hospital_details: string | null
          emergency_hospital_visit: boolean | null
          employer_address: string | null
          employer_name: string | null
          employment_status: string | null
          family_medical_history: string | null
          first_name: string | null
          functional_limitations: string | null
          gender: string | null
          ghl_contact_id: string | null
          group_number: string | null
          health_insurance: string | null
          health_insurance_id: string | null
          home_phone: string | null
          hospital_name: string | null
          id: string
          insurance_phone_number: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string | null
          last_synced_at: string | null
          loss_of_consciousness: string | null
          marital_status: string | null
          medicaid_medicare_id: string | null
          medical_systems_review: Json | null
          organization_id: string | null
          other_medical_history: string | null
          pain_description: Json | null
          pain_frequency: string | null
          pain_location: string | null
          pain_quality: string | null
          pain_severity: number | null
          past_injuries: string | null
          patient_signature: string | null
          person_type: string | null
          phone: string | null
          pip_form_submitted_at: string | null
          preferred_language: string | null
          previous_accidents: string | null
          profile_picture_url: string | null
          release_information: Json | null
          signature_date: string | null
          smoking_history: string | null
          smoking_status: string | null
          social_security_number: string | null
          state: string | null
          street_surface: string | null
          student_status: string | null
          symptom_changes: string | null
          systems_review: Json | null
          tags: string[] | null
          updated_at: string
          weather_conditions: string | null
          what_body_hit: string | null
          work_phone: string | null
          zip_code: string | null
        }
        Insert: {
          accident_date?: string | null
          accident_description?: string | null
          accident_impact_details?: Json | null
          accident_time?: string | null
          address?: string | null
          adjuster_name?: string | null
          age?: number | null
          alcohol_consumption?: string | null
          allergies?: string | null
          alternative_communication?: string | null
          attorney_name?: string | null
          attorney_phone?: string | null
          auto_insurance_company?: string | null
          auto_policy_number?: string | null
          body_part_hit?: string | null
          case_type?: string | null
          cell_phone?: string | null
          chronic_conditions?: string | null
          city?: string | null
          claim_number?: string | null
          consciousness_duration?: string | null
          consent_acknowledgement?: boolean | null
          created_at?: string
          current_medications?: string | null
          current_symptoms?: Json | null
          date_of_birth?: string | null
          did_go_to_hospital?: boolean | null
          drivers_license?: string | null
          drivers_license_state?: string | null
          email?: string | null
          email_consent?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          emergency_hospital_details?: string | null
          emergency_hospital_visit?: boolean | null
          employer_address?: string | null
          employer_name?: string | null
          employment_status?: string | null
          family_medical_history?: string | null
          first_name?: string | null
          functional_limitations?: string | null
          gender?: string | null
          ghl_contact_id?: string | null
          group_number?: string | null
          health_insurance?: string | null
          health_insurance_id?: string | null
          home_phone?: string | null
          hospital_name?: string | null
          id?: string
          insurance_phone_number?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          last_synced_at?: string | null
          loss_of_consciousness?: string | null
          marital_status?: string | null
          medicaid_medicare_id?: string | null
          medical_systems_review?: Json | null
          organization_id?: string | null
          other_medical_history?: string | null
          pain_description?: Json | null
          pain_frequency?: string | null
          pain_location?: string | null
          pain_quality?: string | null
          pain_severity?: number | null
          past_injuries?: string | null
          patient_signature?: string | null
          person_type?: string | null
          phone?: string | null
          pip_form_submitted_at?: string | null
          preferred_language?: string | null
          previous_accidents?: string | null
          profile_picture_url?: string | null
          release_information?: Json | null
          signature_date?: string | null
          smoking_history?: string | null
          smoking_status?: string | null
          social_security_number?: string | null
          state?: string | null
          street_surface?: string | null
          student_status?: string | null
          symptom_changes?: string | null
          systems_review?: Json | null
          tags?: string[] | null
          updated_at?: string
          weather_conditions?: string | null
          what_body_hit?: string | null
          work_phone?: string | null
          zip_code?: string | null
        }
        Update: {
          accident_date?: string | null
          accident_description?: string | null
          accident_impact_details?: Json | null
          accident_time?: string | null
          address?: string | null
          adjuster_name?: string | null
          age?: number | null
          alcohol_consumption?: string | null
          allergies?: string | null
          alternative_communication?: string | null
          attorney_name?: string | null
          attorney_phone?: string | null
          auto_insurance_company?: string | null
          auto_policy_number?: string | null
          body_part_hit?: string | null
          case_type?: string | null
          cell_phone?: string | null
          chronic_conditions?: string | null
          city?: string | null
          claim_number?: string | null
          consciousness_duration?: string | null
          consent_acknowledgement?: boolean | null
          created_at?: string
          current_medications?: string | null
          current_symptoms?: Json | null
          date_of_birth?: string | null
          did_go_to_hospital?: boolean | null
          drivers_license?: string | null
          drivers_license_state?: string | null
          email?: string | null
          email_consent?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          emergency_hospital_details?: string | null
          emergency_hospital_visit?: boolean | null
          employer_address?: string | null
          employer_name?: string | null
          employment_status?: string | null
          family_medical_history?: string | null
          first_name?: string | null
          functional_limitations?: string | null
          gender?: string | null
          ghl_contact_id?: string | null
          group_number?: string | null
          health_insurance?: string | null
          health_insurance_id?: string | null
          home_phone?: string | null
          hospital_name?: string | null
          id?: string
          insurance_phone_number?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          last_synced_at?: string | null
          loss_of_consciousness?: string | null
          marital_status?: string | null
          medicaid_medicare_id?: string | null
          medical_systems_review?: Json | null
          organization_id?: string | null
          other_medical_history?: string | null
          pain_description?: Json | null
          pain_frequency?: string | null
          pain_location?: string | null
          pain_quality?: string | null
          pain_severity?: number | null
          past_injuries?: string | null
          patient_signature?: string | null
          person_type?: string | null
          phone?: string | null
          pip_form_submitted_at?: string | null
          preferred_language?: string | null
          previous_accidents?: string | null
          profile_picture_url?: string | null
          release_information?: Json | null
          signature_date?: string | null
          smoking_history?: string | null
          smoking_status?: string | null
          social_security_number?: string | null
          state?: string | null
          street_surface?: string | null
          student_status?: string | null
          symptom_changes?: string | null
          systems_review?: Json | null
          tags?: string[] | null
          updated_at?: string
          weather_conditions?: string | null
          what_body_hit?: string | null
          work_phone?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dark_mode: boolean | null
          email: string
          email_signature: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          language_preference: string | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dark_mode?: boolean | null
          email: string
          email_signature?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          language_preference?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dark_mode?: boolean | null
          email?: string
          email_signature?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          language_preference?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string
          created_by: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          provider_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          created_by: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          provider_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          created_by?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          provider_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      soap_note_attachments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          soap_note_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          soap_note_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          soap_note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soap_note_attachments_soap_note_id_fkey"
            columns: ["soap_note_id"]
            isOneToOne: false
            referencedRelation: "soap_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_note_templates: {
        Row: {
          chief_complaint: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      soap_notes: {
        Row: {
          appointment_id: string | null
          assessment: string | null
          assessment_data: Json
          chief_complaint: string | null
          created_at: string
          created_by: string
          date_of_service: string
          id: string
          is_draft: boolean
          last_modified_by: string
          objective: string | null
          objective_data: Json
          organization_id: string | null
          patient_id: string
          plan: string | null
          plan_data: Json
          provider_id: string
          provider_name: string
          subjective: string | null
          subjective_data: Json
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          appointment_id?: string | null
          assessment?: string | null
          assessment_data?: Json
          chief_complaint?: string | null
          created_at?: string
          created_by: string
          date_of_service?: string
          id?: string
          is_draft?: boolean
          last_modified_by: string
          objective?: string | null
          objective_data?: Json
          organization_id?: string | null
          patient_id: string
          plan?: string | null
          plan_data?: Json
          provider_id: string
          provider_name: string
          subjective?: string | null
          subjective_data?: Json
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          appointment_id?: string | null
          assessment?: string | null
          assessment_data?: Json
          chief_complaint?: string | null
          created_at?: string
          created_by?: string
          date_of_service?: string
          id?: string
          is_draft?: boolean
          last_modified_by?: string
          objective?: string | null
          objective_data?: Json
          organization_id?: string | null
          patient_id?: string
          plan?: string | null
          plan_data?: Json
          provider_id?: string
          provider_name?: string
          subjective?: string | null
          subjective_data?: Json
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          plan_name: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id: string
          plan_name: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          plan_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
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
      template_usage: {
        Row: {
          chief_complaint: string | null
          created_at: string
          id: string
          patient_id: string | null
          template_id: string | null
          template_name: string
          template_type: string
          usage_context: Json | null
          used_by: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          id?: string
          patient_id?: string | null
          template_id?: string | null
          template_name: string
          template_type: string
          usage_context?: Json | null
          used_by: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          id?: string
          patient_id?: string | null
          template_id?: string | null
          template_name?: string
          template_type?: string
          usage_context?: Json | null
          used_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_usage_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "custom_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_versions: {
        Row: {
          change_notes: string | null
          created_at: string
          created_by: string
          id: string
          template_data: Json
          template_id: string | null
          version: number
        }
        Insert: {
          change_notes?: string | null
          created_at?: string
          created_by: string
          id?: string
          template_data: Json
          template_id?: string | null
          version: number
        }
        Update: {
          change_notes?: string | null
          created_at?: string
          created_by?: string
          id?: string
          template_data?: Json
          template_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "custom_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json | null
          setting_key: string
          setting_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          setting_key: string
          setting_value?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_patient_to_provider: {
        Args: {
          patient_id_param: string
          provider_id_param: string
          role_param?: string
        }
        Returns: string
      }
      can_access_patient: {
        Args: { patient_id_param: string }
        Returns: boolean
      }
      check_form_submission_rate_limit: {
        Args: {
          client_ip: unknown
          form_type_param: string
          max_submissions?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      find_duplicate_opportunities: {
        Args: { check_email?: string; check_name: string; check_phone?: string }
        Returns: {
          created_at: string
          id: string
          patient_email: string
          patient_name: string
          patient_phone: string
          pipeline_stage: string
        }[]
      }
      get_colleague_basic_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          first_name: string
          is_active: boolean
          last_name: string
          role: string
          user_id: string
        }[]
      }
      get_current_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_soap_notes_with_patient_info: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          appointment_id: string
          assessment_data: Json
          chief_complaint: string
          created_at: string
          date_of_service: string
          id: string
          is_draft: boolean
          objective_data: Json
          patient_id: string
          patient_name: string
          plan_data: Json
          provider_id: string
          provider_name: string
          subjective_data: Json
          updated_at: string
          vital_signs: Json
        }[]
      }
      is_chat_admin: {
        Args: { chat_id_to_check: string; user_id_to_check: string }
        Returns: boolean
      }
      is_chat_participant: {
        Args: { chat_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_overlord: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_patient_access: {
        Args: {
          action_param: string
          new_data_param?: Json
          old_data_param?: Json
          record_id_param: string
          table_name_param: string
        }
        Returns: undefined
      }
      unassign_patient_from_provider: {
        Args: { patient_id_param: string; provider_id_param: string }
        Returns: boolean
      }
      user_belongs_to_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
      validate_form_submission: {
        Args: {
          form_data_param: Json
          form_type_param: string
          honeypot_value?: string
        }
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
