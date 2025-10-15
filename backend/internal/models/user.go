package models

import "time"

type User struct {
	ID            uint      `json:"id"`
	DiscordID     string    `json:"discord_id"`
	Username      string    `json:"username"`
	Discriminator string    `json:"discriminator"`
	Avatar        string    `json:"avatar"`
	Role          string    `json:"role"`
	CreatedAt     time.Time `json:"created_at"`
}

type RefreshToken struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type Character struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Level     int       `json:"level" db:"level"`
	Cash      int       `json:"cash" db:"cash"`
	Bank      int       `json:"bank" db:"bank"`
	ServerID  int       `json:"server_id" db:"server_id"`
	UserID    uint      `json:"user_id" db:"user_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// Status flags and expiration dates
	Apartment     *ApartmentStatus     `json:"apartment,omitempty" db:"-"`
	House         *HouseStatus         `json:"house,omitempty" db:"-"`
	Pet           *PetStatus           `json:"pet,omitempty" db:"-"`
	Laboratory    *LaboratoryStatus    `json:"laboratory,omitempty" db:"-"`
	MedicalCard   *MedicalCardStatus   `json:"medical_card,omitempty" db:"-"`
	VipStatus     *VipStatus           `json:"vip_status,omitempty" db:"-"`
}

type ApartmentStatus struct {
	HasApartment bool      `json:"has_apartment" db:"has_apartment"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}

type HouseStatus struct {
	HasHouse  bool      `json:"has_house" db:"has_house"`
	ExpiresAt *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}

type PetStatus struct {
	HasPet    bool      `json:"has_pet" db:"has_pet"`
	ExpiresAt *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}

type LaboratoryStatus struct {
	HasLaboratory bool      `json:"has_laboratory" db:"has_laboratory"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}

type MedicalCardStatus struct {
	HasMedicalCard bool      `json:"has_medical_card" db:"has_medical_card"`
	ExpiresAt      *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}

type VipStatus struct {
	HasVipStatus bool      `json:"has_vip_status" db:"has_vip_status"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty" db:"expires_at"`
}
