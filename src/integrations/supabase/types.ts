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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          description: string
          description_en: string
          icon_emoji: string
          id: string
          key: string
          name: string
          name_en: string
          xp_reward: number
        }
        Insert: {
          category: string
          description: string
          description_en: string
          icon_emoji: string
          id?: string
          key: string
          name: string
          name_en: string
          xp_reward?: number
        }
        Update: {
          category?: string
          description?: string
          description_en?: string
          icon_emoji?: string
          id?: string
          key?: string
          name?: string
          name_en?: string
          xp_reward?: number
        }
        Relationships: []
      }
      active_missions: {
        Row: {
          claimed: boolean
          completed: boolean
          completed_at: string | null
          current_value: number
          expires_at: string | null
          id: string
          mission_id: string
          started_at: string | null
          target_value: number
          user_id: string
        }
        Insert: {
          claimed?: boolean
          completed?: boolean
          completed_at?: string | null
          current_value?: number
          expires_at?: string | null
          id?: string
          mission_id: string
          started_at?: string | null
          target_value?: number
          user_id: string
        }
        Update: {
          claimed?: boolean
          completed?: boolean
          completed_at?: string | null
          current_value?: number
          expires_at?: string | null
          id?: string
          mission_id?: string
          started_at?: string | null
          target_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis: {
        Row: {
          activity_level: string
          arm_cm: number | null
          biological_sex: string
          birth_date: string
          bmi: number
          bmi_category: string
          bmr: number
          body_fat_percent: number | null
          created_at: string
          dietary_preferences: Json
          goal: string
          height_cm: number
          hip_cm: number | null
          id: string
          medical_conditions: Json
          target_calories: number
          target_carbs_g: number
          target_fat_g: number
          target_protein_g: number
          target_water_ml: number
          tdee: number
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number
        }
        Insert: {
          activity_level: string
          arm_cm?: number | null
          biological_sex: string
          birth_date: string
          bmi: number
          bmi_category: string
          bmr: number
          body_fat_percent?: number | null
          created_at?: string
          dietary_preferences?: Json
          goal: string
          height_cm: number
          hip_cm?: number | null
          id?: string
          medical_conditions?: Json
          target_calories: number
          target_carbs_g: number
          target_fat_g: number
          target_protein_g: number
          target_water_ml: number
          tdee: number
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg: number
        }
        Update: {
          activity_level?: string
          arm_cm?: number | null
          biological_sex?: string
          birth_date?: string
          bmi?: number
          bmi_category?: string
          bmr?: number
          body_fat_percent?: number | null
          created_at?: string
          dietary_preferences?: Json
          goal?: string
          height_cm?: number
          hip_cm?: number | null
          id?: string
          medical_conditions?: Json
          target_calories?: number
          target_carbs_g?: number
          target_fat_g?: number
          target_protein_g?: number
          target_water_ml?: number
          tdee?: number
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          body_fat_percent: number | null
          created_at: string
          id: string
          measured_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number
        }
        Insert: {
          body_fat_percent?: number | null
          created_at?: string
          id?: string
          measured_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg: number
        }
        Update: {
          body_fat_percent?: number | null
          created_at?: string
          id?: string
          measured_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      cardio_sessions: {
        Row: {
          avg_heart_rate: number | null
          avg_pace_min_km: number | null
          calories_burned: number | null
          distance_km: number | null
          duration_minutes: number
          id: string
          notes: string | null
          started_at: string
          subtype: string | null
          type: string
          user_id: string
          xp_gained: number
        }
        Insert: {
          avg_heart_rate?: number | null
          avg_pace_min_km?: number | null
          calories_burned?: number | null
          distance_km?: number | null
          duration_minutes: number
          id?: string
          notes?: string | null
          started_at?: string
          subtype?: string | null
          type: string
          user_id: string
          xp_gained?: number
        }
        Update: {
          avg_heart_rate?: number | null
          avg_pace_min_km?: number | null
          calories_burned?: number | null
          distance_km?: number | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          started_at?: string
          subtype?: string | null
          type?: string
          user_id?: string
          xp_gained?: number
        }
        Relationships: []
      }
      classes: {
        Row: {
          archetype: string
          bonus_type: string
          bonus_value: number
          created_at: string | null
          debuff_type: string | null
          debuff_value: number | null
          description: string | null
          icon_emoji: string
          id: string
          name: string
          rarity: string
          unlock_requirement: string | null
        }
        Insert: {
          archetype: string
          bonus_type?: string
          bonus_value?: number
          created_at?: string | null
          debuff_type?: string | null
          debuff_value?: number | null
          description?: string | null
          icon_emoji?: string
          id?: string
          name: string
          rarity?: string
          unlock_requirement?: string | null
        }
        Update: {
          archetype?: string
          bonus_type?: string
          bonus_value?: number
          created_at?: string | null
          debuff_type?: string | null
          debuff_value?: number | null
          description?: string | null
          icon_emoji?: string
          id?: string
          name?: string
          rarity?: string
          unlock_requirement?: string | null
        }
        Relationships: []
      }
      diet_days: {
        Row: {
          date: string
          goal_met: boolean
          id: string
          macros_goal_met: boolean
          total_calories: number
          total_carbs_g: number
          total_fat_g: number
          total_fiber_g: number
          total_protein_g: number
          total_water_ml: number
          user_id: string
        }
        Insert: {
          date: string
          goal_met?: boolean
          id?: string
          macros_goal_met?: boolean
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number
          total_protein_g?: number
          total_water_ml?: number
          user_id: string
        }
        Update: {
          date?: string
          goal_met?: boolean
          id?: string
          macros_goal_met?: boolean
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number
          total_protein_g?: number
          total_water_ml?: number
          user_id?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          exercise_id: string
          id: string
          order: number
          session_id: string
        }
        Insert: {
          exercise_id: string
          id?: string
          order: number
          session_id: string
        }
        Update: {
          exercise_id?: string
          id?: string
          order?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_ranks: {
        Row: {
          best_reps: number
          best_weight_kg: number
          current_rank: string
          exercise_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_reps?: number
          best_weight_kg?: number
          current_rank?: string
          exercise_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_reps?: number
          best_weight_kg?: number
          current_rank?: string
          exercise_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_ranks_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          equipment: string
          id: string
          instructions: string | null
          is_custom: boolean
          is_deleted: boolean
          muscle_group: string
          name: string
          name_en: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          equipment?: string
          id?: string
          instructions?: string | null
          is_custom?: boolean
          is_deleted?: boolean
          muscle_group: string
          name: string
          name_en?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          equipment?: string
          id?: string
          instructions?: string | null
          is_custom?: boolean
          is_deleted?: boolean
          muscle_group?: string
          name?: string
          name_en?: string | null
          type?: string
        }
        Relationships: []
      }
      feed_activities: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_public: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_reactions: {
        Row: {
          created_at: string
          emoji: string
          feed_activity_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          feed_activity_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          feed_activity_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_reactions_feed_activity_id_fkey"
            columns: ["feed_activity_id"]
            isOneToOne: false
            referencedRelation: "feed_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          brand: string | null
          calories_per_100g: number
          carbs_per_100g: number
          created_at: string
          created_by: string | null
          fat_per_100g: number
          fiber_per_100g: number
          id: string
          is_custom: boolean
          is_verified: boolean
          name: string
          name_en: string | null
          protein_per_100g: number
          sodium_per_100g: number
          source: string
        }
        Insert: {
          brand?: string | null
          calories_per_100g: number
          carbs_per_100g: number
          created_at?: string
          created_by?: string | null
          fat_per_100g: number
          fiber_per_100g?: number
          id?: string
          is_custom?: boolean
          is_verified?: boolean
          name: string
          name_en?: string | null
          protein_per_100g: number
          sodium_per_100g?: number
          source?: string
        }
        Update: {
          brand?: string | null
          calories_per_100g?: number
          carbs_per_100g?: number
          created_at?: string
          created_by?: string | null
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          is_custom?: boolean
          is_verified?: boolean
          name?: string
          name_en?: string | null
          protein_per_100g?: number
          sodium_per_100g?: number
          source?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          initiator_id: string
          receiver_id: string
          status: Database["public"]["Enums"]["friendship_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          initiator_id: string
          receiver_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
        }
        Update: {
          created_at?: string
          id?: string
          initiator_id?: string
          receiver_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
        }
        Relationships: []
      }
      gift_codes: {
        Row: {
          code: string
          created_at: string | null
          creator_user_id: string
          expires_at: string
          id: string
          months_granted: number
          plan_granted: string
          redeemed_at: string | null
          redeemed_by_user_id: string | null
          source_interval: string
          source_plan: string
          status: string
        }
        Insert: {
          code: string
          created_at?: string | null
          creator_user_id: string
          expires_at: string
          id?: string
          months_granted?: number
          plan_granted: string
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          source_interval: string
          source_plan: string
          status?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          creator_user_id?: string
          expires_at?: string
          id?: string
          months_granted?: number
          plan_granted?: string
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          source_interval?: string
          source_plan?: string
          status?: string
        }
        Relationships: []
      }
      global_missions: {
        Row: {
          current_value: number
          description: string
          ends_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          objective_type: string
          objective_value: number
          starts_at: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          current_value?: number
          description: string
          ends_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          objective_type: string
          objective_value: number
          starts_at?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          current_value?: number
          description?: string
          ends_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          objective_type?: string
          objective_value?: number
          starts_at?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      meal_items: {
        Row: {
          calories: number
          carbs_g: number
          fat_g: number
          fiber_g: number
          food_id: string
          id: string
          meal_id: string
          protein_g: number
          quantity_g: number
        }
        Insert: {
          calories: number
          carbs_g: number
          fat_g: number
          fiber_g?: number
          food_id: string
          id?: string
          meal_id: string
          protein_g: number
          quantity_g: number
        }
        Update: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          food_id?: string
          id?: string
          meal_id?: string
          protein_g?: number
          quantity_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          diet_day_id: string
          id: string
          name: string
          order: number
          time: string
        }
        Insert: {
          diet_day_id: string
          id?: string
          name: string
          order?: number
          time: string
        }
        Update: {
          diet_day_id?: string
          id?: string
          name?: string
          order?: number
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_diet_day_id_fkey"
            columns: ["diet_day_id"]
            isOneToOne: false
            referencedRelation: "diet_days"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_templates: {
        Row: {
          coin_reward: number
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          objective_type: string
          objective_value: number
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string | null
          description: string
          icon?: string
          id: string
          is_active?: boolean | null
          objective_type: string
          objective_value?: number
          title: string
          type?: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          objective_type?: string
          objective_value?: number
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      party_members: {
        Row: {
          id: string
          joined_at: string | null
          party_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          party_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          party_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "workout_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          exercise_id: string
          id: string
          reps: number
          set_at: string
          user_id: string
          volume: number
          weight_kg: number
        }
        Insert: {
          exercise_id: string
          id?: string
          reps: number
          set_at?: string
          user_id: string
          volume: number
          weight_kg: number
        }
        Update: {
          exercise_id?: string
          id?: string
          reps?: number
          set_at?: string
          user_id?: string
          volume?: number
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_exercises: {
        Row: {
          day_id: string
          default_reps: number
          default_sets: number
          exercise_id: string
          id: string
          notes: string | null
          order: number
          rest_seconds: number
        }
        Insert: {
          day_id: string
          default_reps?: number
          default_sets?: number
          exercise_id: string
          id?: string
          notes?: string | null
          order: number
          rest_seconds?: number
        }
        Update: {
          day_id?: string
          default_reps?: number
          default_sets?: number
          exercise_id?: string
          id?: string
          notes?: string | null
          order?: number
          rest_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "planned_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agi_attr: number
          anamnesis_complete: boolean
          avatar_frame: string | null
          avatar_position: string | null
          avatar_url: string | null
          banner_position: string | null
          banner_url: string | null
          bio: string | null
          class_name: Database["public"]["Enums"]["rpg_class"]
          created_at: string
          current_class_id: string | null
          current_playlist_name: string | null
          current_workout_status: string | null
          email: string | null
          end_attr: number
          id: string
          last_activity_date: string | null
          last_seen: string | null
          level: number
          locale: string
          name: string
          name_effect: Json | null
          plan: Database["public"]["Enums"]["user_plan"]
          preferences: Json
          privacy_settings: Json
          privacy_share_status: boolean | null
          profile_gradient: string | null
          profile_wallpaper_url: string | null
          specialization: Database["public"]["Enums"]["specialization"] | null
          str_attr: number
          streak: number
          theme: string
          updated_at: string
          user_id: string
          username: string | null
          vit_attr: number
          weight_unit: string
          xp: number
        }
        Insert: {
          agi_attr?: number
          anamnesis_complete?: boolean
          avatar_frame?: string | null
          avatar_position?: string | null
          avatar_url?: string | null
          banner_position?: string | null
          banner_url?: string | null
          bio?: string | null
          class_name?: Database["public"]["Enums"]["rpg_class"]
          created_at?: string
          current_class_id?: string | null
          current_playlist_name?: string | null
          current_workout_status?: string | null
          email?: string | null
          end_attr?: number
          id?: string
          last_activity_date?: string | null
          last_seen?: string | null
          level?: number
          locale?: string
          name?: string
          name_effect?: Json | null
          plan?: Database["public"]["Enums"]["user_plan"]
          preferences?: Json
          privacy_settings?: Json
          privacy_share_status?: boolean | null
          profile_gradient?: string | null
          profile_wallpaper_url?: string | null
          specialization?: Database["public"]["Enums"]["specialization"] | null
          str_attr?: number
          streak?: number
          theme?: string
          updated_at?: string
          user_id: string
          username?: string | null
          vit_attr?: number
          weight_unit?: string
          xp?: number
        }
        Update: {
          agi_attr?: number
          anamnesis_complete?: boolean
          avatar_frame?: string | null
          avatar_position?: string | null
          avatar_url?: string | null
          banner_position?: string | null
          banner_url?: string | null
          bio?: string | null
          class_name?: Database["public"]["Enums"]["rpg_class"]
          created_at?: string
          current_class_id?: string | null
          current_playlist_name?: string | null
          current_workout_status?: string | null
          email?: string | null
          end_attr?: number
          id?: string
          last_activity_date?: string | null
          last_seen?: string | null
          level?: number
          locale?: string
          name?: string
          name_effect?: Json | null
          plan?: Database["public"]["Enums"]["user_plan"]
          preferences?: Json
          privacy_settings?: Json
          privacy_share_status?: boolean | null
          profile_gradient?: string | null
          profile_wallpaper_url?: string | null
          specialization?: Database["public"]["Enums"]["specialization"] | null
          str_attr?: number
          streak?: number
          theme?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          vit_attr?: number
          weight_unit?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_class_id_fkey"
            columns: ["current_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      set_logs: {
        Row: {
          completed_at: string
          exercise_log_id: string
          id: string
          reps: number
          rest_seconds: number | null
          rpe: number | null
          set_number: number
          type: Database["public"]["Enums"]["set_type"]
          weight_kg: number
        }
        Insert: {
          completed_at?: string
          exercise_log_id: string
          id?: string
          reps: number
          rest_seconds?: number | null
          rpe?: number | null
          set_number: number
          type?: Database["public"]["Enums"]["set_type"]
          weight_kg?: number
        }
        Update: {
          completed_at?: string
          exercise_log_id?: string
          id?: string
          reps?: number
          rest_seconds?: number | null
          rpe?: number | null
          set_number?: number
          type?: Database["public"]["Enums"]["set_type"]
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_log_id_fkey"
            columns: ["exercise_log_id"]
            isOneToOne: false
            referencedRelation: "exercise_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      social_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          session_id: string | null
          user_id: string
          workout_duration: number | null
          workout_summary: Json | null
          workout_volume: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          session_id?: string | null
          user_id: string
          workout_duration?: number | null
          workout_summary?: Json | null
          workout_volume?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          session_id?: string | null
          user_id?: string
          workout_duration?: number | null
          workout_summary?: Json | null
          workout_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          interval: string | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          interval?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          interval?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_class_progress: {
        Row: {
          class_id: string
          class_level: number
          class_rank: string
          class_xp: number
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          class_level?: number
          class_rank?: string
          class_xp?: number
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          class_level?: number
          class_rank?: string
          class_xp?: number
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_class_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_days: {
        Row: {
          id: string
          name: string
          order: number
          program_id: string
          week_day: number | null
        }
        Insert: {
          id?: string
          name: string
          order: number
          program_id: string
          week_day?: number | null
        }
        Update: {
          id?: string
          name?: string
          order?: number
          program_id?: string
          week_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_parties: {
        Row: {
          code: string
          created_at: string | null
          ended_at: string | null
          host_id: string
          id: string
          max_members: number | null
          name: string
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          max_members?: number | null
          name: string
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          max_members?: number | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      workout_programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string
          day_id: string | null
          duration_min: number | null
          ended_at: string | null
          id: string
          notes: string | null
          program_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["workout_status"]
          total_sets: number | null
          total_volume_kg: number | null
          user_id: string
          xp_gained: number
        }
        Insert: {
          created_at?: string
          day_id?: string | null
          duration_min?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["workout_status"]
          total_sets?: number | null
          total_volume_kg?: number | null
          user_id: string
          xp_gained?: number
        }
        Update: {
          created_at?: string
          day_id?: string | null
          duration_min?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["workout_status"]
          total_sets?: number | null
          total_volume_kg?: number | null
          user_id?: string
          xp_gained?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json
          source: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json
          source: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json
          source?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      friendship_status: "pending" | "accepted" | "rejected" | "blocked"
      party_status: "waiting" | "active" | "completed" | "cancelled"
      rpg_class:
        | "Iniciante"
        | "Aprendiz"
        | "Guerreiro"
        | "Veterano"
        | "Elite"
        | "Lendário"
        | "Imortal"
      set_type: "warmup" | "working" | "backoff"
      specialization: "hercules" | "hermes" | "apollo" | "athena"
      user_plan: "free" | "vip" | "vip_plus" | "pro"
      workout_status: "active" | "completed" | "abandoned"
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
      app_role: ["admin", "moderator", "user"],
      friendship_status: ["pending", "accepted", "rejected", "blocked"],
      party_status: ["waiting", "active", "completed", "cancelled"],
      rpg_class: [
        "Iniciante",
        "Aprendiz",
        "Guerreiro",
        "Veterano",
        "Elite",
        "Lendário",
        "Imortal",
      ],
      set_type: ["warmup", "working", "backoff"],
      specialization: ["hercules", "hermes", "apollo", "athena"],
      user_plan: ["free", "vip", "vip_plus", "pro"],
      workout_status: ["active", "completed", "abandoned"],
    },
  },
} as const
