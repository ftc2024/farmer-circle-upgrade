import type { BiasDirection, TradeDirection, UserRole } from "@/types/domain";

type RowTable<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: RowTable<
        {
          id: string; full_name: string | null; role: UserRole; phone: string | null;
          first_name: string | null; last_name: string | null; bio: string | null;
          address: string | null; city: string | null; country: string | null;
          avatar_url: string | null; avatar_path: string | null;
          created_at: string; updated_at: string;
        },
        {
          id: string; full_name?: string | null; role?: UserRole; phone?: string | null;
          first_name?: string | null; last_name?: string | null; bio?: string | null;
          address?: string | null; city?: string | null; country?: string | null;
          avatar_url?: string | null; avatar_path?: string | null;
        }
      >;
      trade_journals: RowTable<
        {
          id: string; user_id: string; trade_date: string; pair: string; setup: string;
          direction: TradeDirection; entry_price: number | null; stop_loss: number | null;
          take_profit: number | null; risk_percent: number | null; result_r: number | null;
          notes: string | null; created_at: string;
        },
        {
          id?: string; user_id: string; trade_date: string; pair: string; setup: string;
          direction: TradeDirection; entry_price?: number | null; stop_loss?: number | null;
          take_profit?: number | null; risk_percent?: number | null; result_r?: number | null;
          notes?: string | null; created_at?: string;
        }
      >;
      daily_biases: RowTable<
        {
          id: string; author_id: string; title: string; market: string;
          direction: BiasDirection; content: string; created_at: string;
        },
        {
          id?: string; author_id: string; title: string; market: string;
          direction: BiasDirection; content: string; created_at?: string;
        }
      >;
      learning_attendance: RowTable<
        {
          id: string; user_id: string; email: string; full_name: string | null;
          topic: string; session_time: string; note: string | null; proof_url: string | null;
          proof_path: string | null; created_at: string;
        },
        {
          id?: string; user_id: string; email: string; full_name?: string | null;
          topic: string; session_time: string; note?: string | null; proof_url?: string | null;
          proof_path?: string | null; created_at?: string;
        }
      >;
      drive_files: RowTable<
        {
          id: string; owner_user_id: string | null; uploaded_by: string | null;
          folder_type: string; related_table: string | null; related_id: string | null;
          title: string | null; original_filename: string | null; mime_type: string | null;
          file_size_bytes: number | null; drive_file_id: string; drive_folder_id: string | null;
          web_view_link: string | null; web_content_link: string | null; thumbnail_link: string | null;
          visibility: "private" | "member" | "public"; metadata: Record<string, unknown>;
          created_at: string | null; updated_at: string | null;
        },
        {
          id?: string; owner_user_id?: string | null; uploaded_by?: string | null;
          folder_type: string; related_table?: string | null; related_id?: string | null;
          title?: string | null; original_filename?: string | null; mime_type?: string | null;
          file_size_bytes?: number | null; drive_file_id: string; drive_folder_id?: string | null;
          web_view_link?: string | null; web_content_link?: string | null; thumbnail_link?: string | null;
          visibility?: "private" | "member" | "public"; metadata?: Record<string, unknown>;
          created_at?: string; updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
