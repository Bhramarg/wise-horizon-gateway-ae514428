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
      certificate_tags: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_test_at: string | null
          locked_at: string | null
          ndef_payload: string
          password_protected: boolean
          payload_digest: string
          replaced_by: string | null
          result_id: string
          revoked_at: string | null
          secret_hash: string | null
          status: Database["public"]["Enums"]["tag_status"]
          tag_password_hash: string | null
          tag_uid_hash: string | null
          updated_at: string
          write_counter: number
          written_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          last_test_at?: string | null
          locked_at?: string | null
          ndef_payload: string
          password_protected?: boolean
          payload_digest: string
          replaced_by?: string | null
          result_id: string
          revoked_at?: string | null
          secret_hash?: string | null
          status?: Database["public"]["Enums"]["tag_status"]
          tag_password_hash?: string | null
          tag_uid_hash?: string | null
          updated_at?: string
          write_counter?: number
          written_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_test_at?: string | null
          locked_at?: string | null
          ndef_payload?: string
          password_protected?: boolean
          payload_digest?: string
          replaced_by?: string | null
          result_id?: string
          revoked_at?: string | null
          secret_hash?: string | null
          status?: Database["public"]["Enums"]["tag_status"]
          tag_password_hash?: string | null
          tag_uid_hash?: string | null
          updated_at?: string
          write_counter?: number
          written_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_tags_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "certificate_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_tags_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "results"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_layouts: {
        Row: {
          id: string
          level: string
          background_url: string | null
          fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          level: string
          background_url?: string | null
          fields?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          level?: string
          background_url?: string | null
          fields?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      institution_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          institution_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          institution_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          institution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          academic_period: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          grade: string | null
          id: string
          institution_id: string
          issued_at: string | null
          marks: Json
          portfolio_key_hash: string | null
          portfolio_key_issued_at: string | null
          portfolio_path: string | null
          qualification: string
          review_note: string | null
          revocation_reason: string | null
          revoked_at: string | null
          status: Database["public"]["Enums"]["result_status"]
          student_id: string
          submitted_at: string | null
          total: number | null
          updated_at: string
          verification_code: string
        }
        Insert: {
          academic_period: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          grade?: string | null
          id?: string
          institution_id: string
          issued_at?: string | null
          marks?: Json
          portfolio_key_hash?: string | null
          portfolio_key_issued_at?: string | null
          portfolio_path?: string | null
          qualification: string
          review_note?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          student_id: string
          submitted_at?: string | null
          total?: number | null
          updated_at?: string
          verification_code?: string
        }
        Update: {
          academic_period?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          grade?: string | null
          id?: string
          institution_id?: string
          issued_at?: string | null
          marks?: Json
          portfolio_key_hash?: string | null
          portfolio_key_issued_at?: string | null
          portfolio_path?: string | null
          qualification?: string
          review_note?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          student_id?: string
          submitted_at?: string | null
          total?: number | null
          updated_at?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          birthmark: string | null
          caste: string | null
          created_at: string
          created_by: string
          date_of_birth: string | null
          expires_at: string | null
          face_id_number: string | null
          full_name: string
          guardians: Json
          id: string
          institution_id: string
          metadata: Json
          photo_path: string | null
          prev_school_doc_path: string | null
          programme: string
          student_number: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          birthmark?: string | null
          caste?: string | null
          created_at?: string
          created_by: string
          date_of_birth?: string | null
          expires_at?: string | null
          face_id_number?: string | null
          full_name: string
          guardians?: Json
          id?: string
          institution_id: string
          metadata?: Json
          photo_path?: string | null
          prev_school_doc_path?: string | null
          programme: string
          student_number: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          birthmark?: string | null
          caste?: string | null
          created_at?: string
          created_by?: string
          date_of_birth?: string | null
          expires_at?: string | null
          face_id_number?: string | null
          full_name?: string
          guardians?: Json
          id?: string
          institution_id?: string
          metadata?: Json
          photo_path?: string | null
          prev_school_doc_path?: string | null
          programme?: string
          student_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["subject_category"]
          code: string
          created_at: string
          created_by: string | null
          id: string
          level: string
          name: string
          passing_marks: number
          practical_marks: number
          theory_marks: number
          total_marks: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: Database["public"]["Enums"]["subject_category"]
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          level: string
          name: string
          passing_marks?: number
          practical_marks?: number
          theory_marks?: number
          total_marks?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["subject_category"]
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          name?: string
          passing_marks?: number
          practical_marks?: number
          theory_marks?: number
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      tag_events: {
        Row: {
          actor_id: string | null
          details: Json
          event_type: Database["public"]["Enums"]["tag_event_type"]
          id: string
          occurred_at: string
          tag_id: string
          tag_uid_hash: string | null
        }
        Insert: {
          actor_id?: string | null
          details?: Json
          event_type: Database["public"]["Enums"]["tag_event_type"]
          id?: string
          occurred_at?: string
          tag_id: string
          tag_uid_hash?: string | null
        }
        Update: {
          actor_id?: string | null
          details?: Json
          event_type?: Database["public"]["Enums"]["tag_event_type"]
          id?: string
          occurred_at?: string
          tag_id?: string
          tag_uid_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tag_events_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "certificate_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "dms"
      result_status:
        | "draft"
        | "submitted"
        | "approved"
        | "issued"
        | "revoked"
        | "on_hold"
        | "review_required"
      subject_category: "fixed" | "changeable" | "optional"
      tag_event_type:
        | "prepared"
        | "written"
        | "verified"
        | "locked"
        | "revoked"
        | "replaced"
        | "scan_mismatch"
      tag_status: "prepared" | "written" | "locked" | "revoked" | "replaced"
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
      app_role: ["admin", "dms"],
      result_status: [
        "draft",
        "submitted",
        "approved",
        "issued",
        "revoked",
        "on_hold",
        "review_required",
      ],
      subject_category: ["fixed", "changeable", "optional"],
      tag_event_type: [
        "prepared",
        "written",
        "verified",
        "locked",
        "revoked",
        "replaced",
        "scan_mismatch",
      ],
      tag_status: ["prepared", "written", "locked", "revoked", "replaced"],
    },
  },
} as const
