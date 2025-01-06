import { SelectCircuitLocation } from "@/db/schema/circuit-locations-schema"

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
          track_map_url: string | null
          updated_at: string
          website_url: string | null
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
          track_map_url?: string | null
          updated_at?: string
          website_url?: string | null
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
          track_map_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          from_currency: string
          id: string
          is_active: boolean
          last_fetch_error: string | null
          last_fetch_success: string
          last_updated: string
          rate: number
          to_currency: string
        }
        Insert: {
          from_currency: string
          id: string
          is_active?: boolean
          last_fetch_error?: string | null
          last_fetch_success?: string
          last_updated?: string
          rate: number
          to_currency: string
        }
        Update: {
          from_currency?: string
          id?: string
          is_active?: boolean
          last_fetch_error?: string | null
          last_fetch_success?: string
          last_updated?: string
          rate?: number
          to_currency?: string
        }
        Relationships: []
      }
      flight_bookings: {
        Row: {
          added_to_trip: boolean
          arrival_city: string | null
          arrival_iata: string
          arrival_time: string
          booking_reference: string | null
          completed_at: string | null
          created_at: string
          departure_city: string | null
          departure_iata: string
          departure_time: string
          expires_at: string
          id: string
          last_error_message: string | null
          offer_data: Json
          offer_id: string
          order_id: string | null
          passenger_data: Json
          payment_data: Json | null
          payment_required: boolean
          payment_required_by: string | null
          race_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: string
          total_currency: string
          trip_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          added_to_trip?: boolean
          arrival_city?: string | null
          arrival_iata: string
          arrival_time: string
          booking_reference?: string | null
          completed_at?: string | null
          created_at?: string
          departure_city?: string | null
          departure_iata: string
          departure_time: string
          expires_at: string
          id?: string
          last_error_message?: string | null
          offer_data: Json
          offer_id: string
          order_id?: string | null
          passenger_data: Json
          payment_data?: Json | null
          payment_required?: boolean
          payment_required_by?: string | null
          race_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount: string
          total_currency: string
          trip_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          added_to_trip?: boolean
          arrival_city?: string | null
          arrival_iata?: string
          arrival_time?: string
          booking_reference?: string | null
          completed_at?: string | null
          created_at?: string
          departure_city?: string | null
          departure_iata?: string
          departure_time?: string
          expires_at?: string
          id?: string
          last_error_message?: string | null
          offer_data?: Json
          offer_id?: string
          order_id?: string | null
          passenger_data?: Json
          payment_data?: Json | null
          payment_required?: boolean
          payment_required_by?: string | null
          race_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: string
          total_currency?: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_bookings_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          }
        ]
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
      merch: {
        Row: {
          category: Database["public"]["Enums"]["merch_category"]
          created_at: string
          currency: string
          description: string
          id: string
          image_url: string | null
          in_stock: string
          name: string
          price: string
          purchase_url: string | null
          race_id: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["merch_category"]
          created_at?: string
          currency?: string
          description: string
          id?: string
          image_url?: string | null
          in_stock?: string
          name: string
          price: string
          purchase_url?: string | null
          race_id: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["merch_category"]
          created_at?: string
          currency?: string
          description?: string
          id?: string
          image_url?: string | null
          in_stock?: string
          name?: string
          price?: string
          purchase_url?: string | null
          race_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          },
          {
            foreignKeyName: "package_tickets_package_id_ticket_packages_id_fk"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ticket_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_tickets_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_tickets_ticket_id_tickets_id_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
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
      race_history: {
        Row: {
          created_at: string
          full_history: string
          id: string
          memorable_moments: Json
          meta_description: string | null
          meta_title: string | null
          race_id: string
          record_breakers: Json
          timeline: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_history: string
          id?: string
          memorable_moments?: Json
          meta_description?: string | null
          meta_title?: string | null
          race_id: string
          record_breakers?: Json
          timeline?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_history?: string
          id?: string
          memorable_moments?: Json
          meta_description?: string | null
          meta_title?: string | null
          race_id?: string
          record_breakers?: Json
          timeline?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_history_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
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
      stripe_accounts: {
        Row: {
          attrs: Json | null
          business_type: string | null
          country: string | null
          created: string | null
          email: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      stripe_balance: {
        Row: {
          amount: number | null
          attrs: Json | null
          balance_type: string | null
          currency: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          balance_type?: string | null
          currency?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          balance_type?: string | null
          currency?: string | null
        }
        Relationships: []
      }
      stripe_balance_transactions: {
        Row: {
          amount: number | null
          attrs: Json | null
          created: string | null
          currency: string | null
          description: string | null
          fee: number | null
          id: string | null
          net: number | null
          status: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          fee?: number | null
          id?: string | null
          net?: number | null
          status?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          fee?: number | null
          id?: string | null
          net?: number | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
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
          },
          {
            foreignKeyName: "ticket_feature_mappings_feature_id_ticket_features_id_fk"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "ticket_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_feature_mappings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_feature_mappings_ticket_id_tickets_id_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_features: {
        Row: {
          category: Database["public"]["Enums"]["feature_category"]
          created_at: string
          description: string | null
          display_priority: number
          feature_type: Database["public"]["Enums"]["feature_type"]
          icon: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["feature_category"]
          created_at?: string
          description?: string | null
          display_priority?: number
          feature_type?: Database["public"]["Enums"]["feature_type"]
          icon?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["feature_category"]
          created_at?: string
          description?: string | null
          display_priority?: number
          feature_type?: Database["public"]["Enums"]["feature_type"]
          icon?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ticket_packages: {
        Row: {
          base_price: number
          created_at: string
          currency: string
          description: string
          id: number
          is_featured: boolean
          max_quantity: number
          name: string
          package_type: Database["public"]["Enums"]["package_type"]
          race_id: string
          terms_and_conditions: string
          updated_at: string
          updated_by: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          base_price?: number
          created_at?: string
          currency?: string
          description: string
          id?: number
          is_featured?: boolean
          max_quantity?: number
          name: string
          package_type?: Database["public"]["Enums"]["package_type"]
          race_id: string
          terms_and_conditions?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: string
          description?: string
          id?: number
          is_featured?: boolean
          max_quantity?: number
          name?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          race_id?: string
          terms_and_conditions?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_packages_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          }
        ]
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
          saved_merch: Json | null
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
          saved_merch?: Json | null
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
          saved_merch?: Json | null
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
          last_notified_at: string | null
          notification_channel: Database["public"]["Enums"]["notification_channel"]
          notification_count: number
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
          last_notified_at?: string | null
          notification_channel: Database["public"]["Enums"]["notification_channel"]
          notification_count?: number
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
          last_notified_at?: string | null
          notification_channel?: Database["public"]["Enums"]["notification_channel"]
          notification_count?: number
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
      booking_status:
        | "pending"
        | "confirmed"
        | "failed"
        | "expired"
        | "cancelled"
      feature_category: "access" | "hospitality" | "experience"
      feature_type: "included" | "optional" | "upgrade"
      location_type:
        | "circuit"
        | "city_center"
        | "hotel"
        | "restaurant"
        | "attraction"
        | "transport"
        | "airport"
      membership: "free" | "pro"
      merch_category:
        | "clothing"
        | "accessories"
        | "memorabilia"
        | "collectibles"
        | "other"
      notification_channel: "email" | "sms" | "both"
      notification_status: "pending" | "sent" | "failed" | "cancelled"
      notification_type:
        | "ticket_available"
        | "price_change"
        | "package_available"
      package_type: "weekend" | "vip" | "hospitality" | "custom"
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
    track_map_url: string | null
    openf1_key: number | null
    openf1_short_name: string | null
    timezone_id: string | null
    timezone_name: string | null
    website_url: string | null
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
