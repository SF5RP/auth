export interface Character {
  id: string;
  name: string;
  level: number;
  cash: number;
  bank: number;
  server_id: number; // link to Server.serverId
  user_id: number;
  created_at: string;
  updated_at: string;

  // Status flags and expiration dates
  apartment?: {
    has_apartment: boolean;
    expires_at?: string; // ISO date string
  };
  house?: {
    has_house: boolean;
    expires_at?: string; // ISO date string
  };
  pet?: {
    has_pet: boolean;
    expires_at?: string; // ISO date string
  };
  laboratory?: {
    has_laboratory: boolean;
    expires_at?: string; // ISO date string
  };
  medical_card?: {
    has_medical_card: boolean;
    expires_at?: string; // ISO date string
  };
  vip_status?: {
    has_vip_status: boolean;
    expires_at?: string; // ISO date string
  };
}
