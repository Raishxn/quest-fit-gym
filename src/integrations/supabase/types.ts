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
      Achievement: {
        Row: {
          category: string
          description: string
          iconEmoji: string | null
          id: string
          key: string
          name: string
          xpReward: number
        }
        Insert: {
          category: string
          description: string
          iconEmoji?: string | null
          id: string
          key: string
          name: string
          xpReward?: number
        }
        Update: {
          category?: string
          description?: string
          iconEmoji?: string | null
          id?: string
          key?: string
          name?: string
          xpReward?: number
        }
        Relationships: []
      }
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
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          progress: number
          started_at: string
          status: string
          target: number
          template_id: string
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          progress?: number
          started_at?: string
          status?: string
          target: number
          template_id: string
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          progress?: number
          started_at?: string
          status?: string
          target?: number
          template_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_missions_template_id_fkey"
            columns: ["template_id"]
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
      app_updates: {
        Row: {
          body: string
          id: string
          published_at: string
          title: string
          version: string
        }
        Insert: {
          body: string
          id?: string
          published_at?: string
          title: string
          version: string
        }
        Update: {
          body?: string
          id?: string
          published_at?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      BankComment: {
        Row: {
          authorId: string
          bankItemId: string
          body: string
          createdAt: string
          fileUrl: string | null
          id: string
          upvotes: number
        }
        Insert: {
          authorId: string
          bankItemId: string
          body: string
          createdAt?: string
          fileUrl?: string | null
          id: string
          upvotes?: number
        }
        Update: {
          authorId?: string
          bankItemId?: string
          body?: string
          createdAt?: string
          fileUrl?: string | null
          id?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "BankComment_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BankComment_bankItemId_fkey"
            columns: ["bankItemId"]
            isOneToOne: false
            referencedRelation: "BankItem"
            referencedColumns: ["id"]
          },
        ]
      }
      BankItem: {
        Row: {
          course: string | null
          createdAt: string
          fileHash: string
          fileUrl: string
          id: string
          institution: string | null
          period: string | null
          professor: string | null
          rating: number
          ratingCount: number
          subject: string
          title: string
          type: string
          uploadedBy: string
        }
        Insert: {
          course?: string | null
          createdAt?: string
          fileHash: string
          fileUrl: string
          id: string
          institution?: string | null
          period?: string | null
          professor?: string | null
          rating?: number
          ratingCount?: number
          subject: string
          title: string
          type: string
          uploadedBy: string
        }
        Update: {
          course?: string | null
          createdAt?: string
          fileHash?: string
          fileUrl?: string
          id?: string
          institution?: string | null
          period?: string | null
          professor?: string | null
          rating?: number
          ratingCount?: number
          subject?: string
          title?: string
          type?: string
          uploadedBy?: string
        }
        Relationships: [
          {
            foreignKeyName: "BankItem_uploadedBy_fkey"
            columns: ["uploadedBy"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      BankRating: {
        Row: {
          bankItemId: string
          createdAt: string
          id: string
          score: number
          userId: string
        }
        Insert: {
          bankItemId: string
          createdAt?: string
          id: string
          score: number
          userId: string
        }
        Update: {
          bankItemId?: string
          createdAt?: string
          id?: string
          score?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "BankRating_bankItemId_fkey"
            columns: ["bankItemId"]
            isOneToOne: false
            referencedRelation: "BankItem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BankRating_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
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
      body_weight_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
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
      ChatConversation: {
        Row: {
          createdAt: string
          id: string
          name: string | null
          type: string
        }
        Insert: {
          createdAt?: string
          id: string
          name?: string | null
          type: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string | null
          type?: string
        }
        Relationships: []
      }
      ChatMember: {
        Row: {
          conversationId: string
          id: string
          userId: string
        }
        Insert: {
          conversationId: string
          id: string
          userId: string
        }
        Update: {
          conversationId?: string
          id?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChatMember_conversationId_fkey"
            columns: ["conversationId"]
            isOneToOne: false
            referencedRelation: "ChatConversation"
            referencedColumns: ["id"]
          },
        ]
      }
      ChatMessage: {
        Row: {
          body: string | null
          conversationId: string
          createdAt: string
          fileUrl: string | null
          id: string
          senderId: string
        }
        Insert: {
          body?: string | null
          conversationId: string
          createdAt?: string
          fileUrl?: string | null
          id: string
          senderId: string
        }
        Update: {
          body?: string | null
          conversationId?: string
          createdAt?: string
          fileUrl?: string | null
          id?: string
          senderId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChatMessage_conversationId_fkey"
            columns: ["conversationId"]
            isOneToOne: false
            referencedRelation: "ChatConversation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChatMessage_senderId_fkey"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Course: {
        Row: {
          area: string
          id: string
          institutionId: string
          name: string
        }
        Insert: {
          area: string
          id: string
          institutionId: string
          name: string
        }
        Update: {
          area?: string
          id?: string
          institutionId?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "Course_institutionId_fkey"
            columns: ["institutionId"]
            isOneToOne: false
            referencedRelation: "Institution"
            referencedColumns: ["id"]
          },
        ]
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
      EmailVerification: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          token: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          token: string
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          token?: string
          userId?: string
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
      ForumPost: {
        Row: {
          authorId: string
          body: string
          createdAt: string
          fileUrl: string | null
          id: string
          solved: boolean
          subject: string
          tags: string[] | null
          title: string
          updatedAt: string
          upvotes: number
        }
        Insert: {
          authorId: string
          body: string
          createdAt?: string
          fileUrl?: string | null
          id: string
          solved?: boolean
          subject: string
          tags?: string[] | null
          title: string
          updatedAt: string
          upvotes?: number
        }
        Update: {
          authorId?: string
          body?: string
          createdAt?: string
          fileUrl?: string | null
          id?: string
          solved?: boolean
          subject?: string
          tags?: string[] | null
          title?: string
          updatedAt?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "ForumPost_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ForumPostUpvote: {
        Row: {
          createdAt: string
          id: string
          postId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          postId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          postId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ForumPostUpvote_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "ForumPost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ForumPostUpvote_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ForumReply: {
        Row: {
          authorId: string
          body: string
          createdAt: string
          fileUrl: string | null
          id: string
          isAccepted: boolean
          postId: string
          upvotes: number
        }
        Insert: {
          authorId: string
          body: string
          createdAt?: string
          fileUrl?: string | null
          id: string
          isAccepted?: boolean
          postId: string
          upvotes?: number
        }
        Update: {
          authorId?: string
          body?: string
          createdAt?: string
          fileUrl?: string | null
          id?: string
          isAccepted?: boolean
          postId?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "ForumReply_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ForumReply_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "ForumPost"
            referencedColumns: ["id"]
          },
        ]
      }
      ForumReplyUpvote: {
        Row: {
          createdAt: string
          id: string
          replyId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          replyId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          replyId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ForumReplyUpvote_replyId_fkey"
            columns: ["replyId"]
            isOneToOne: false
            referencedRelation: "ForumReply"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ForumReplyUpvote_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Friendship: {
        Row: {
          createdAt: string
          fromId: string
          id: string
          status: string
          toId: string
        }
        Insert: {
          createdAt?: string
          fromId: string
          id: string
          status: string
          toId: string
        }
        Update: {
          createdAt?: string
          fromId?: string
          id?: string
          status?: string
          toId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Friendship_fromId_fkey"
            columns: ["fromId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Friendship_toId_fkey"
            columns: ["toId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
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
      global_mission_contributions: {
        Row: {
          amount: number
          created_at: string
          global_mission_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          global_mission_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          global_mission_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_mission_contributions_global_mission_id_fkey"
            columns: ["global_mission_id"]
            isOneToOne: false
            referencedRelation: "global_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      global_missions: {
        Row: {
          created_at: string
          current_progress: number
          description: string
          ends_at: string
          id: string
          reward_data: Json
          started_at: string
          status: string
          target: number
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string
          current_progress?: number
          description: string
          ends_at: string
          id?: string
          reward_data?: Json
          started_at?: string
          status?: string
          target: number
          template_id: string
          title: string
        }
        Update: {
          created_at?: string
          current_progress?: number
          description?: string
          ends_at?: string
          id?: string
          reward_data?: Json
          started_at?: string
          status?: string
          target?: number
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_missions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mission_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_missions: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          progress: number
          status: string
          target: number
          template_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          progress?: number
          status?: string
          target: number
          template_id: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          progress?: number
          status?: string
          target?: number
          template_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_missions_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_missions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mission_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string
          description: string | null
          emblem_url: string | null
          guild_power: number
          id: string
          is_recruiting: boolean
          max_members: number
          name: string
          owner_id: string
          tag: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emblem_url?: string | null
          guild_power?: number
          id?: string
          is_recruiting?: boolean
          max_members?: number
          name: string
          owner_id: string
          tag: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emblem_url?: string | null
          guild_power?: number
          id?: string
          is_recruiting?: boolean
          max_members?: number
          name?: string
          owner_id?: string
          tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      Institution: {
        Row: {
          active: boolean
          campus: string
          city: string
          emecCode: string
          id: string
          name: string
          shortName: string | null
          state: string
          type: string
        }
        Insert: {
          active?: boolean
          campus?: string
          city: string
          emecCode: string
          id: string
          name: string
          shortName?: string | null
          state: string
          type: string
        }
        Update: {
          active?: boolean
          campus?: string
          city?: string
          emecCode?: string
          id?: string
          name?: string
          shortName?: string | null
          state?: string
          type?: string
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
          category: string
          created_at: string
          criteria: Json
          description: string
          difficulty: string
          icon_emoji: string
          id: string
          is_active: boolean
          key: string
          mastery_points_reward: number
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          criteria?: Json
          description: string
          difficulty?: string
          icon_emoji: string
          id?: string
          is_active?: boolean
          key: string
          mastery_points_reward?: number
          title: string
          type: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string
          difficulty?: string
          icon_emoji?: string
          id?: string
          is_active?: boolean
          key?: string
          mastery_points_reward?: number
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      ModerationAction: {
        Row: {
          action: string
          contentId: string | null
          contentType: string | null
          createdAt: string
          duration: number | null
          id: string
          moderatorId: string
          notes: string | null
          reason: string
          targetUserId: string
        }
        Insert: {
          action: string
          contentId?: string | null
          contentType?: string | null
          createdAt?: string
          duration?: number | null
          id: string
          moderatorId: string
          notes?: string | null
          reason: string
          targetUserId: string
        }
        Update: {
          action?: string
          contentId?: string | null
          contentType?: string | null
          createdAt?: string
          duration?: number | null
          id?: string
          moderatorId?: string
          notes?: string | null
          reason?: string
          targetUserId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ModerationAction_moderatorId_fkey"
            columns: ["moderatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ModerationAction_targetUserId_fkey"
            columns: ["targetUserId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ModerationReport: {
        Row: {
          action: string | null
          category: string
          contentId: string
          contentType: string
          createdAt: string
          description: string | null
          id: string
          priority: string
          reporterId: string
          resolvedAt: string | null
          resolvedBy: string | null
          status: string
        }
        Insert: {
          action?: string | null
          category: string
          contentId: string
          contentType: string
          createdAt?: string
          description?: string | null
          id: string
          priority: string
          reporterId: string
          resolvedAt?: string | null
          resolvedBy?: string | null
          status?: string
        }
        Update: {
          action?: string | null
          category?: string
          contentId?: string
          contentType?: string
          createdAt?: string
          description?: string | null
          id?: string
          priority?: string
          reporterId?: string
          resolvedAt?: string | null
          resolvedBy?: string | null
          status?: string
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
      party_lobbies: {
        Row: {
          code: string
          created_at: string
          host_id: string
          id: string
          max_members: number
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          host_id: string
          id?: string
          max_members?: number
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          host_id?: string
          id?: string
          max_members?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      party_members: {
        Row: {
          id: string
          joined_at: string
          lobby_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          lobby_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          lobby_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_members_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "party_lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      PasswordReset: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          tokenHash: string
          usedAt: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          tokenHash: string
          usedAt?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          tokenHash?: string
          usedAt?: string | null
          userId?: string
        }
        Relationships: []
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
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          class_name: Database["public"]["Enums"]["rpg_class"]
          created_at: string
          email: string | null
          end_attr: number
          id: string
          last_activity_date: string | null
          level: number
          locale: string
          name: string
          overall_mastery_points: number
          overall_rank: string
          peak_overall_rank: string
          plan: Database["public"]["Enums"]["user_plan"]
          playlist_url: string | null
          preferences: Json
          privacy_settings: Json
          selected_title_id: string | null
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
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          class_name?: Database["public"]["Enums"]["rpg_class"]
          created_at?: string
          email?: string | null
          end_attr?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          locale?: string
          name?: string
          overall_mastery_points?: number
          overall_rank?: string
          peak_overall_rank?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          playlist_url?: string | null
          preferences?: Json
          privacy_settings?: Json
          selected_title_id?: string | null
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
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          class_name?: Database["public"]["Enums"]["rpg_class"]
          created_at?: string
          email?: string | null
          end_attr?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          locale?: string
          name?: string
          overall_mastery_points?: number
          overall_rank?: string
          peak_overall_rank?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          playlist_url?: string | null
          preferences?: Json
          privacy_settings?: Json
          selected_title_id?: string | null
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
            foreignKeyName: "fk_profiles_selected_title"
            columns: ["selected_title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      RankingSnapshot: {
        Row: {
          date: string
          id: string
          period: string
          rank: number
          type: string
          userId: string
          xp: number
        }
        Insert: {
          date?: string
          id: string
          period: string
          rank: number
          type: string
          userId: string
          xp: number
        }
        Update: {
          date?: string
          id?: string
          period?: string
          rank?: number
          type?: string
          userId?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "RankingSnapshot_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      RefreshToken: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          tokenHash: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          tokenHash: string
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          tokenHash?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "RefreshToken_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
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
      StudySession: {
        Row: {
          duration: number
          endedAt: string | null
          id: string
          lastHeartbeat: string | null
          mode: string
          pausedDuration: number
          pomodorosCompleted: number
          startedAt: string
          status: string
          subject: string
          topic: string | null
          userId: string
          xpGained: number
        }
        Insert: {
          duration?: number
          endedAt?: string | null
          id: string
          lastHeartbeat?: string | null
          mode: string
          pausedDuration?: number
          pomodorosCompleted?: number
          startedAt?: string
          status?: string
          subject: string
          topic?: string | null
          userId: string
          xpGained?: number
        }
        Update: {
          duration?: number
          endedAt?: string | null
          id?: string
          lastHeartbeat?: string | null
          mode?: string
          pausedDuration?: number
          pomodorosCompleted?: number
          startedAt?: string
          status?: string
          subject?: string
          topic?: string | null
          userId?: string
          xpGained?: number
        }
        Relationships: [
          {
            foreignKeyName: "StudySession_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          key: string
          name: string
          rarity: string
          requirement: Json
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          key: string
          name: string
          rarity?: string
          requirement?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          key?: string
          name?: string
          rarity?: string
          requirement?: Json
        }
        Relationships: []
      }
      User: {
        Row: {
          avatarUrl: string | null
          bannerUrl: string | null
          courseId: string | null
          createdAt: string
          currentStreak: number
          email: string
          emailVerified: boolean
          id: string
          institutionId: string | null
          level: number
          name: string | null
          passwordHash: string | null
          preferences: Json
          role: string
          semester: number | null
          shift: string | null
          title: string
          unidade: string | null
          updatedAt: string
          username: string
          xp: number
        }
        Insert: {
          avatarUrl?: string | null
          bannerUrl?: string | null
          courseId?: string | null
          createdAt?: string
          currentStreak?: number
          email: string
          emailVerified?: boolean
          id: string
          institutionId?: string | null
          level?: number
          name?: string | null
          passwordHash?: string | null
          preferences?: Json
          role?: string
          semester?: number | null
          shift?: string | null
          title?: string
          unidade?: string | null
          updatedAt: string
          username: string
          xp?: number
        }
        Update: {
          avatarUrl?: string | null
          bannerUrl?: string | null
          courseId?: string | null
          createdAt?: string
          currentStreak?: number
          email?: string
          emailVerified?: boolean
          id?: string
          institutionId?: string | null
          level?: number
          name?: string | null
          passwordHash?: string | null
          preferences?: Json
          role?: string
          semester?: number | null
          shift?: string | null
          title?: string
          unidade?: string | null
          updatedAt?: string
          username?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "User_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "User_institutionId_fkey"
            columns: ["institutionId"]
            isOneToOne: false
            referencedRelation: "Institution"
            referencedColumns: ["id"]
          },
        ]
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
      user_feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      user_titles: {
        Row: {
          id: string
          title_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_titles_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      UserAchievement: {
        Row: {
          achievementId: string
          id: string
          unlockedAt: string
          userId: string
        }
        Insert: {
          achievementId: string
          id: string
          unlockedAt?: string
          userId: string
        }
        Update: {
          achievementId?: string
          id?: string
          unlockedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserAchievement_achievementId_fkey"
            columns: ["achievementId"]
            isOneToOne: false
            referencedRelation: "Achievement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserAchievement_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserSuspension: {
        Row: {
          createdAt: string
          createdBy: string
          endAt: string | null
          id: string
          reason: string
          startAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          createdBy: string
          endAt?: string | null
          id: string
          reason: string
          startAt?: string
          userId: string
        }
        Update: {
          createdAt?: string
          createdBy?: string
          endAt?: string | null
          id?: string
          reason?: string
          startAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserSuspension_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserWarning: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          reason: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          reason: string
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          reason?: string
          userId?: string
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
          party_lobby_id: string | null
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
          party_lobby_id?: string | null
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
          party_lobby_id?: string | null
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
            foreignKeyName: "workout_sessions_party_lobby_id_fkey"
            columns: ["party_lobby_id"]
            isOneToOne: false
            referencedRelation: "party_lobbies"
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
      XPTransaction: {
        Row: {
          amount: number
          createdAt: string
          id: string
          refId: string | null
          source: string
          userId: string
        }
        Insert: {
          amount: number
          createdAt?: string
          id: string
          refId?: string | null
          source: string
          userId: string
        }
        Update: {
          amount?: number
          createdAt?: string
          id?: string
          refId?: string | null
          source?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "XPTransaction_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
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
        | "LendÃ¡rio"
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
        "LendÃ¡rio",
        "Imortal",
      ],
      set_type: ["warmup", "working", "backoff"],
      specialization: ["hercules", "hermes", "apollo", "athena"],
      user_plan: ["free", "vip", "vip_plus", "pro"],
      workout_status: ["active", "completed", "abandoned"],
    },
  },
} as const
