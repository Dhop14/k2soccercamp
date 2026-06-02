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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      camp_settings: {
        Row: {
          id: string
          max_spots: number
          registrations_open: boolean
          updated_at: string
          waitlist_enabled: boolean
        }
        Insert: {
          id?: string
          max_spots?: number
          registrations_open?: boolean
          updated_at?: string
          waitlist_enabled?: boolean
        }
        Update: {
          id?: string
          max_spots?: number
          registrations_open?: boolean
          updated_at?: string
          waitlist_enabled?: boolean
        }
        Relationships: []
      }
      registrations: {
        Row: {
          activity_restrictions: string | null
          allergies: string
          created_at: string
          eligibility_ack: boolean
          email: string
          emergency_consent_accepted_at: string
          emergency_consent_version: string
          emergency_contact: string
          emergency_contact_name: string
          emergency_contact_phone: string
          grade_basis: string
          health_form_accepted_at: string
          health_form_version: string
          id: string
          immunization_notes: string | null
          immunization_status: string | null
          medical_conditions: string | null
          medications: string | null
          notes: string | null
          parent_name: string
          phone: string
          photo_release: boolean
          physician_name: string | null
          physician_phone: string | null
          player_age: number
          player_grade: number
          player_name: string
          secondary_emergency_contact: string | null
          sibling_note: string | null
          skill_level: string | null
          status: string
          waiver_accepted_at: string
          waiver_version: string
        }
        Insert: {
          activity_restrictions?: string | null
          allergies: string
          created_at?: string
          eligibility_ack: boolean
          email: string
          emergency_consent_accepted_at?: string
          emergency_consent_version: string
          emergency_contact: string
          emergency_contact_name: string
          emergency_contact_phone: string
          grade_basis: string
          health_form_accepted_at?: string
          health_form_version: string
          id?: string
          immunization_notes?: string | null
          immunization_status: string | null
          medical_conditions?: string | null
          medications?: string | null
          notes?: string | null
          parent_name: string
          phone: string
          photo_release?: boolean
          physician_name?: string | null
          physician_phone?: string | null
          player_age: number
          player_grade: number
          player_name: string
          secondary_emergency_contact?: string | null
          sibling_note?: string | null
          skill_level?: string | null
          status?: string
          waiver_accepted_at?: string
          waiver_version: string
        }
        Update: {
          activity_restrictions?: string | null
          allergies?: string
          created_at?: string
          eligibility_ack?: boolean
          email?: string
          emergency_consent_accepted_at?: string
          emergency_consent_version?: string
          emergency_contact?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          grade_basis?: string
          health_form_accepted_at?: string
          health_form_version?: string
          id?: string
          immunization_notes?: string | null
          immunization_status?: string
          medical_conditions?: string | null
          medications?: string | null
          notes?: string | null
          parent_name?: string
          phone?: string
          photo_release?: boolean
          physician_name?: string | null
          physician_phone?: string | null
          player_age?: number
          player_grade?: number
          player_name?: string
          secondary_emergency_contact?: string | null
          sibling_note?: string | null
          skill_level?: string | null
          status?: string
          waiver_accepted_at?: string
          waiver_version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_registration_status: {
        Args: Record<string, never>
        Returns: Json
      }
      submit_registration: {
        Args: {
          p_activity_restrictions?: string
          p_allergies: string
          p_eligibility_ack: boolean
          p_email: string
          p_emergency_consent_version: string
          p_emergency_contact: string
          p_emergency_contact_name: string
          p_emergency_contact_phone: string
          p_emergency_medical_consent_ack: boolean
          p_grade_basis: string
          p_health_form_ack: boolean
          p_health_form_version: string
          p_immunization_notes?: string
          p_immunization_status?: string | null
          p_medical_conditions?: string
          p_medications?: string
          p_notes?: string
          p_parent_name: string
          p_phone: string
          p_photo_release: boolean
          p_physician_name?: string
          p_physician_phone?: string
          p_player_age: number
          p_player_grade: number
          p_player_name: string
          p_secondary_emergency_contact?: string
          p_sibling_note?: string
          p_skill_level?: string
          p_waiver_version: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
