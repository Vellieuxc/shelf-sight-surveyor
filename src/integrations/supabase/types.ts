export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      picture_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          picture_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          picture_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          picture_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "picture_comments_picture_id_fkey"
            columns: ["picture_id"]
            isOneToOne: false
            referencedRelation: "pictures"
            referencedColumns: ["id"]
          },
        ]
      }
      pictures: {
        Row: {
          analysis_data: Json | null
          created_at: string
          id: string
          image_url: string
          last_edited_at: string | null
          last_edited_by: string | null
          store_id: string
          uploaded_by: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          id?: string
          image_url: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          store_id: string
          uploaded_by: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          id?: string
          image_url?: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          store_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pictures_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string
          first_name: string | null
          id: string
          is_blocked: boolean | null
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          email: string
          first_name?: string | null
          id: string
          is_blocked?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          country: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_closed: boolean
          title: string
        }
        Insert: {
          category?: string | null
          country?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_closed?: boolean
          title: string
        }
        Update: {
          category?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_closed?: boolean
          title?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string
          country: string
          created_at: string
          created_by: string
          google_map_pin: string | null
          id: string
          name: string
          project_id: string
          store_image: string | null
          type: string
        }
        Insert: {
          address: string
          country: string
          created_at?: string
          created_by: string
          google_map_pin?: string | null
          id?: string
          name: string
          project_id: string
          store_image?: string | null
          type: string
        }
        Update: {
          address?: string
          country?: string
          created_at?: string
          created_by?: string
          google_map_pin?: string | null
          id?: string
          name?: string
          project_id?: string
          store_image?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      connect_to_project: {
        Args: Record<PropertyKey, never> | { project_id_param: string }
        Returns: undefined
      }
      create_picture_comments_function_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_picture_comments_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: { role_to_check: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_project_member: {
        Args: { project_id_to_check: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "crew" | "consultant" | "boss"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["crew", "consultant", "boss"],
    },
  },
} as const
