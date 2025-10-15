export interface CreateCharacterFormData {
  name: string;
  level: number;
  cash: number;
  bank: number;
  apartment?: {
    has_apartment: boolean;
    expires_at?: string;
  };
  house?: {
    has_house: boolean;
    expires_at?: string;
  };
  pet?: {
    has_pet: boolean;
    expires_at?: string;
  };
  laboratory?: {
    has_laboratory: boolean;
    expires_at?: string;
  };
  medical_card?: {
    has_medical_card: boolean;
    expires_at?: string;
  };
  vip_status?: {
    has_vip_status: boolean;
    expires_at?: string;
  };
}
