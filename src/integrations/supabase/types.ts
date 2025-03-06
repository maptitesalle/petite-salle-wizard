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
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          cardio_age_cardio: number | null
          cardio_vo2max: number | null
          condition_arthrose: boolean | null
          condition_autres_info_sante: string | null
          condition_hypothyroidie: boolean | null
          condition_insuffisance_cardiaque: boolean | null
          condition_obesite: boolean | null
          condition_problemes_respiratoires: boolean | null
          created_at: string
          flexibilite_cou: number | null
          flexibilite_epaules: number | null
          flexibilite_hanches: number | null
          flexibilite_ischios: number | null
          flexibilite_lombaires: number | null
          force_bas_du_corps: number | null
          force_haut_du_corps: number | null
          force_milieu_du_corps: number | null
          id: string
          metabolique_age_metabolique: number | null
          metabolique_masse_graisseuse: number | null
          metabolique_masse_musculaire: number | null
          metabolique_poids: number | null
          objective_amelioration_cardio: boolean | null
          objective_amelioration_souplesse: boolean | null
          objective_maintien_forme: boolean | null
          objective_perte_de_poids: boolean | null
          objective_prise_de_masse: boolean | null
          restriction_sans_gluten: boolean | null
          restriction_sans_oeuf: boolean | null
          restriction_sans_produit_laitier: boolean | null
          restriction_vegan: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cardio_age_cardio?: number | null
          cardio_vo2max?: number | null
          condition_arthrose?: boolean | null
          condition_autres_info_sante?: string | null
          condition_hypothyroidie?: boolean | null
          condition_insuffisance_cardiaque?: boolean | null
          condition_obesite?: boolean | null
          condition_problemes_respiratoires?: boolean | null
          created_at?: string
          flexibilite_cou?: number | null
          flexibilite_epaules?: number | null
          flexibilite_hanches?: number | null
          flexibilite_ischios?: number | null
          flexibilite_lombaires?: number | null
          force_bas_du_corps?: number | null
          force_haut_du_corps?: number | null
          force_milieu_du_corps?: number | null
          id?: string
          metabolique_age_metabolique?: number | null
          metabolique_masse_graisseuse?: number | null
          metabolique_masse_musculaire?: number | null
          metabolique_poids?: number | null
          objective_amelioration_cardio?: boolean | null
          objective_amelioration_souplesse?: boolean | null
          objective_maintien_forme?: boolean | null
          objective_perte_de_poids?: boolean | null
          objective_prise_de_masse?: boolean | null
          restriction_sans_gluten?: boolean | null
          restriction_sans_oeuf?: boolean | null
          restriction_sans_produit_laitier?: boolean | null
          restriction_vegan?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cardio_age_cardio?: number | null
          cardio_vo2max?: number | null
          condition_arthrose?: boolean | null
          condition_autres_info_sante?: string | null
          condition_hypothyroidie?: boolean | null
          condition_insuffisance_cardiaque?: boolean | null
          condition_obesite?: boolean | null
          condition_problemes_respiratoires?: boolean | null
          created_at?: string
          flexibilite_cou?: number | null
          flexibilite_epaules?: number | null
          flexibilite_hanches?: number | null
          flexibilite_ischios?: number | null
          flexibilite_lombaires?: number | null
          force_bas_du_corps?: number | null
          force_haut_du_corps?: number | null
          force_milieu_du_corps?: number | null
          id?: string
          metabolique_age_metabolique?: number | null
          metabolique_masse_graisseuse?: number | null
          metabolique_masse_musculaire?: number | null
          metabolique_poids?: number | null
          objective_amelioration_cardio?: boolean | null
          objective_amelioration_souplesse?: boolean | null
          objective_maintien_forme?: boolean | null
          objective_perte_de_poids?: boolean | null
          objective_prise_de_masse?: boolean | null
          restriction_sans_gluten?: boolean | null
          restriction_sans_oeuf?: boolean | null
          restriction_sans_produit_laitier?: boolean | null
          restriction_vegan?: boolean | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
