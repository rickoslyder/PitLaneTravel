import { SelectCircuitLocation } from "@/db/schema"

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
      admin_activities: {
        Row: {
          created_at: string
          description: string
          id: string
          type: Database["public"]["Enums"]["admin_activity_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          type: Database["public"]["Enums"]["admin_activity_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          type?: Database["public"]["Enums"]["admin_activity_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          airport_code: string | null
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
          transfer_time: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          airport_code?: string | null
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
          transfer_time?: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          airport_code?: string | null
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
          transfer_time?: string | null
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
          openf1_key: number | null
          openf1_short_name: string | null
          timezone_id: string | null
          timezone_name: string | null
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
          openf1_key?: number | null
          openf1_short_name?: string | null
          timezone_id?: string | null
          timezone_name?: string | null
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
          openf1_key?: number | null
          openf1_short_name?: string | null
          timezone_id?: string | null
          timezone_name?: string | null
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
          is_admin: boolean
          membership: Database["public"]["Enums"]["membership"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_admin?: boolean
          membership?: Database["public"]["Enums"]["membership"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_admin?: boolean
          membership?: Database["public"]["Enums"]["membership"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      race_weather: {
        Row: {
          cloud_cover: number | null
          conditions: string
          created_at: string
          date: string
          dew: number | null
          feels_like: number
          humidity: number
          icon: string
          id: string
          precip: number
          precip_prob: number
          pressure: number | null
          race_id: string
          sunrise: string | null
          sunset: string | null
          temp: number
          temp_max: number
          temp_min: number
          unit_group: Database["public"]["Enums"]["unit_group"]
          updated_at: string
          uv_index: number | null
          visibility: number | null
          wind_dir: number | null
          wind_speed: number
        }
        Insert: {
          cloud_cover?: number | null
          conditions: string
          created_at?: string
          date: string
          dew?: number | null
          feels_like: number
          humidity: number
          icon: string
          id?: string
          precip: number
          precip_prob: number
          pressure?: number | null
          race_id: string
          sunrise?: string | null
          sunset?: string | null
          temp: number
          temp_max: number
          temp_min: number
          unit_group?: Database["public"]["Enums"]["unit_group"]
          updated_at?: string
          uv_index?: number | null
          visibility?: number | null
          wind_dir?: number | null
          wind_speed: number
        }
        Update: {
          cloud_cover?: number | null
          conditions?: string
          created_at?: string
          date?: string
          dew?: number | null
          feels_like?: number
          humidity?: number
          icon?: string
          id?: string
          precip?: number
          precip_prob?: number
          pressure?: number | null
          race_id?: string
          sunrise?: string | null
          sunset?: string | null
          temp?: number
          temp_max?: number
          temp_min?: number
          unit_group?: Database["public"]["Enums"]["unit_group"]
          updated_at?: string
          uv_index?: number | null
          visibility?: number | null
          wind_dir?: number | null
          wind_speed?: number
        }
        Relationships: [
          {
            foreignKeyName: "race_weather_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
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
          openf1_meeting_key: number | null
          openf1_session_key: number | null
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
          openf1_meeting_key?: number | null
          openf1_session_key?: number | null
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
          openf1_meeting_key?: number | null
          openf1_session_key?: number | null
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
          end_time: string | null
          id: string
          openf1_session_key: number | null
          race_id: string
          round: number
          series: string
          start_time: string | null
          status: Database["public"]["Enums"]["supporting_series_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          openf1_session_key?: number | null
          race_id: string
          round: number
          series: string
          start_time?: string | null
          status?:
            | Database["public"]["Enums"]["supporting_series_status"]
            | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          openf1_session_key?: number | null
          race_id?: string
          round?: number
          series?: string
          start_time?: string | null
          status?:
            | Database["public"]["Enums"]["supporting_series_status"]
            | null
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
          accommodation: Json | null
          created_at: string
          custom_notes: Json | null
          description: string
          flights: Json | null
          id: string
          packing_list: string[] | null
          race_id: string
          shared_with: string[] | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          transportation_notes: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["trip_visibility"]
        }
        Insert: {
          accommodation?: Json | null
          created_at?: string
          custom_notes?: Json | null
          description: string
          flights?: Json | null
          id?: string
          packing_list?: string[] | null
          race_id: string
          shared_with?: string[] | null
          status?: Database["public"]["Enums"]["trip_status"]
          title: string
          transportation_notes?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["trip_visibility"]
        }
        Update: {
          accommodation?: Json | null
          created_at?: string
          custom_notes?: Json | null
          description?: string
          flights?: Json | null
          id?: string
          packing_list?: string[] | null
          race_id?: string
          shared_with?: string[] | null
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
          transportation_notes?: string | null
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
      world_plugs: {
        Row: {
          country_code: string
          created_at: string
          frequency: string
          id: number
          image_url: string | null
          name: string
          plug_type: string
          updated_at: string
          voltage: string
        }
        Insert: {
          country_code: string
          created_at?: string
          frequency: string
          id?: number
          image_url?: string | null
          name: string
          plug_type: string
          updated_at?: string
          voltage: string
        }
        Update: {
          country_code?: string
          created_at?: string
          frequency?: string
          id?: number
          image_url?: string | null
          name?: string
          plug_type?: string
          updated_at?: string
          voltage?: string
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
      admin_activity_type:
        | "ticket"
        | "meetup"
        | "transport"
        | "attraction"
        | "series"
      location_type:
        | "circuit"
        | "city_center"
        | "hotel"
        | "restaurant"
        | "attraction"
        | "transport"
        | "airport"
      membership: "free" | "pro"
      notification_type: "email" | "sms" | "both"
      race_status: "upcoming" | "in_progress" | "completed" | "cancelled"
      supporting_series_status:
        | "scheduled"
        | "live"
        | "completed"
        | "delayed"
        | "cancelled"
      trip_status: "planning" | "booked" | "completed"
      trip_visibility: "private" | "public" | "shared"
      unit_group: "us" | "metric"
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

export interface RaceWithCircuitAndSeries {
  id: string
  circuit_id: string
  name: string
  date: string
  season: number
  round: number
  country: string
  description: string | null
  weekend_start: string | null
  weekend_end: string | null
  status: "in_progress" | "upcoming" | "completed" | "cancelled"
  slug: string | null
  is_sprint_weekend: boolean
  openf1_meeting_key: number | null
  openf1_session_key: number | null
  created_at: string
  updated_at: string
  circuit: {
    id: string
    name: string
    country: string
    location: string
    latitude: number
    longitude: number
    image_url: string | null
    openf1_key: number | null
    openf1_short_name: string | null
    timezone_id: string | null
    timezone_name: string | null
    created_at: string
    updated_at: string
    locations?: SelectCircuitLocation[]
  } | null
  supporting_series: Array<{
    id: string
    race_id: string
    series: string
    round: number
    created_at: string
    updated_at: string
    start_time: string | null
    end_time: string | null
    openf1_session_key: number | null
  }>
}
