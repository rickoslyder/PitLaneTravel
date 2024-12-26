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
      activities: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          itinerary_id: number
          location: string | null
          notes: string | null
          start_time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          itinerary_id: number
          location?: string | null
          notes?: string | null
          start_time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          itinerary_id?: number
          location?: string | null
          notes?: string | null
          start_time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "saved_itineraries"
            referencedColumns: ["id"]
          }
        ]
      }
      airports: {
        Row: {
          circuit_id: string
          code: string
          created_at: string
          distance: number
          id: string
          name: string
          transfer_time: string
          updated_at: string
        }
        Insert: {
          circuit_id: string
          code: string
          created_at?: string
          distance: number
          id?: string
          name: string
          transfer_time: string
          updated_at?: string
        }
        Update: {
          circuit_id?: string
          code?: string
          created_at?: string
          distance?: number
          id?: string
          name?: string
          transfer_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "airports_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      circuit_details: {
        Row: {
          circuit_id: string
          corners: number
          created_at: string
          drs_zones: number
          id: string
          lap_record_driver: string | null
          lap_record_time: string | null
          lap_record_year: number | null
          length: number
          updated_at: string
        }
        Insert: {
          circuit_id: string
          corners: number
          created_at?: string
          drs_zones: number
          id?: string
          lap_record_driver?: string | null
          lap_record_time?: string | null
          lap_record_year?: number | null
          length: number
          updated_at?: string
        }
        Update: {
          circuit_id?: string
          corners?: number
          created_at?: string
          drs_zones?: number
          id?: string
          lap_record_driver?: string | null
          lap_record_time?: string | null
          lap_record_year?: number | null
          length?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circuit_details_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: true
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      circuit_locations: {
        Row: {
          address: string | null
          circuit_id: string
          created_at: string
          description: string | null
          distance_from_circuit: number | null
          id: string
          latitude: number
          longitude: number
          name: string
          place_id: string | null
          timezone: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          circuit_id: string
          created_at?: string
          description?: string | null
          distance_from_circuit?: number | null
          id?: string
          latitude: number
          longitude: number
          name: string
          place_id?: string | null
          timezone?: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          circuit_id?: string
          created_at?: string
          description?: string | null
          distance_from_circuit?: number | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          place_id?: string | null
          timezone?: string | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circuit_locations_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      circuits: {
        Row: {
          country: string
          created_at: string
          id: string
          image_url: string | null
          latitude: number
          location: string
          longitude: number
          name: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          image_url?: string | null
          latitude: number
          location: string
          longitude: number
          name: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          image_url?: string | null
          latitude?: number
          location?: string
          longitude?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      local_attractions: {
        Row: {
          booking_required: boolean | null
          circuit_id: string
          created_at: string
          description: string
          distance_from_circuit: number | null
          distance_from_city: number | null
          estimated_duration: string | null
          f1_relevance: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          peak_times: Json | null
          price_range: string | null
          recommended_times: string[] | null
          updated_at: string
        }
        Insert: {
          booking_required?: boolean | null
          circuit_id: string
          created_at?: string
          description: string
          distance_from_circuit?: number | null
          distance_from_city?: number | null
          estimated_duration?: string | null
          f1_relevance?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          peak_times?: Json | null
          price_range?: string | null
          recommended_times?: string[] | null
          updated_at?: string
        }
        Update: {
          booking_required?: boolean | null
          circuit_id?: string
          created_at?: string
          description?: string
          distance_from_circuit?: number | null
          distance_from_city?: number | null
          estimated_duration?: string | null
          f1_relevance?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          peak_times?: Json | null
          price_range?: string | null
          recommended_times?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_attractions_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      meetups: {
        Row: {
          attendees: string[] | null
          created_at: string
          date: string
          description: string
          id: string
          location: string
          max_attendees: number | null
          race_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          date: string
          description: string
          id?: string
          location: string
          max_attendees?: number | null
          race_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          location?: string
          max_attendees?: number | null
          race_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetups_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      package_tickets: {
        Row: {
          discount_percentage: number | null
          package_id: number
          quantity: number
          ticket_id: number
        }
        Insert: {
          discount_percentage?: number | null
          package_id: number
          quantity?: number
          ticket_id: number
        }
        Update: {
          discount_percentage?: number | null
          package_id?: number
          quantity?: number
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_tickets_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ticket_packages"
            referencedColumns: ["id"]
          }
        ]
      }
      podium_results: {
        Row: {
          circuit_id: string
          created_at: string
          driver: string
          id: string
          position: number
          team: string
          updated_at: string
          year: number
        }
        Insert: {
          circuit_id: string
          created_at?: string
          driver: string
          id?: string
          position: number
          team: string
          updated_at?: string
          year: number
        }
        Update: {
          circuit_id?: string
          created_at?: string
          driver?: string
          id?: string
          position?: number
          team?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "podium_results_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          membership: Database["public"]["Enums"]["membership"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          membership?: Database["public"]["Enums"]["membership"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          membership?: Database["public"]["Enums"]["membership"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      races: {
        Row: {
          circuit_id: string
          country: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_sprint_weekend: boolean
          name: string
          round: number
          season: number
          slug: string | null
          status: Database["public"]["Enums"]["race_status"]
          updated_at: string
          weekend_end: string | null
          weekend_start: string | null
        }
        Insert: {
          circuit_id: string
          country: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_sprint_weekend?: boolean
          name: string
          round: number
          season: number
          slug?: string | null
          status?: Database["public"]["Enums"]["race_status"]
          updated_at?: string
          weekend_end?: string | null
          weekend_start?: string | null
        }
        Update: {
          circuit_id?: string
          country?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_sprint_weekend?: boolean
          name?: string
          round?: number
          season?: number
          slug?: string | null
          status?: Database["public"]["Enums"]["race_status"]
          updated_at?: string
          weekend_end?: string | null
          weekend_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "races_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          race_id: string
          rating: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          race_id: string
          rating: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          race_id?: string
          rating?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_itineraries: {
        Row: {
          created_at: string
          id: number
          itinerary: Json
          race_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          itinerary: Json
          race_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          itinerary?: Json
          race_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_itineraries_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      supporting_series: {
        Row: {
          created_at: string
          id: string
          race_id: string
          round: number
          series: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          race_id: string
          round: number
          series: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          race_id?: string
          round?: number
          series?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supporting_series_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_feature_mappings: {
        Row: {
          feature_id: number
          ticket_id: number
        }
        Insert: {
          feature_id: number
          ticket_id: number
        }
        Update: {
          feature_id?: number
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_feature_mappings_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "ticket_features"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_features: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      ticket_packages: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      ticket_pricing: {
        Row: {
          created_at: string
          currency: string
          id: number
          price: number
          ticket_id: number
          updated_at: string
          updated_by: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          currency: string
          id?: number
          price: number
          ticket_id: number
          updated_at?: string
          updated_by?: string | null
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: number
          price?: number
          ticket_id?: number
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_pricing_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          availability: string
          created_at: string
          days_included: Json
          description: string
          id: number
          is_child_ticket: boolean
          race_id: string
          reseller_url: string
          ticket_type: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          availability: string
          created_at?: string
          days_included: Json
          description: string
          id?: number
          is_child_ticket?: boolean
          race_id: string
          reseller_url: string
          ticket_type: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          availability?: string
          created_at?: string
          days_included?: Json
          description?: string
          id?: number
          is_child_ticket?: boolean
          race_id?: string
          reseller_url?: string
          ticket_type?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      tips: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          race_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          race_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          race_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tips_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      transport_info: {
        Row: {
          circuit_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          options: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          circuit_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          options?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          circuit_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          options?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_info_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          }
        ]
      }
      trips: {
        Row: {
          created_at: string
          description: string
          id: string
          race_id: string
          shared_with: string[] | null
          title: string
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["trip_visibility"]
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          race_id: string
          shared_with?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["trip_visibility"]
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          race_id?: string
          shared_with?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["trip_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "trips_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          phone: string | null
          race_id: string
          status: Database["public"]["Enums"]["waitlist_status"]
          ticket_category_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          phone?: string | null
          race_id: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          ticket_category_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          phone?: string | null
          race_id?: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          ticket_category_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      location_type:
        | "circuit"
        | "city_center"
        | "hotel"
        | "restaurant"
        | "attraction"
        | "transport"
      membership: "free" | "pro"
      notification_type: "email" | "sms" | "both"
      race_status: "upcoming" | "in_progress" | "completed" | "cancelled"
      trip_visibility: "private" | "public" | "shared"
      waitlist_status: "pending" | "notified" | "purchased" | "expired"
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
    : never = never
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
    : never = never
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
    : never = never
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
    : never = never
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type RaceWithCircuit = Database["public"]["Tables"]["races"]["Row"] & {
  circuit: Database["public"]["Tables"]["circuits"]["Row"] | null
}