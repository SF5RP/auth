package services

import (
	"auth-service/internal/database"
	"auth-service/internal/models"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type CharacterService struct {
	characterRepo *database.CharacterRepo
	logger        *logrus.Logger
}

func NewCharacterService(characterRepo *database.CharacterRepo, logger *logrus.Logger) *CharacterService {
	return &CharacterService{
		characterRepo: characterRepo,
		logger:        logger,
	}
}

type CreateCharacterRequest struct {
	Name      string `json:"name" binding:"required"`
	Level     int    `json:"level" binding:"required,min=1"`
	Cash      int    `json:"cash" binding:"min=0"`
	Bank      int    `json:"bank" binding:"min=0"`
	ServerID  int    `json:"server_id" binding:"required"`
	Apartment *struct {
		HasApartment bool       `json:"has_apartment"`
		ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	} `json:"apartment,omitempty"`
	House *struct {
		HasHouse  bool       `json:"has_house"`
		ExpiresAt *time.Time `json:"expires_at,omitempty"`
	} `json:"house,omitempty"`
	Pet *struct {
		HasPet    bool       `json:"has_pet"`
		ExpiresAt *time.Time `json:"expires_at,omitempty"`
	} `json:"pet,omitempty"`
	Laboratory *struct {
		HasLaboratory bool       `json:"has_laboratory"`
		ExpiresAt     *time.Time `json:"expires_at,omitempty"`
	} `json:"laboratory,omitempty"`
	MedicalCard *struct {
		HasMedicalCard bool       `json:"has_medical_card"`
		ExpiresAt      *time.Time `json:"expires_at,omitempty"`
	} `json:"medical_card,omitempty"`
	VipStatus *struct {
		HasVipStatus bool       `json:"has_vip_status"`
		ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	} `json:"vip_status,omitempty"`
}

type UpdateCharacterRequest struct {
	Name      *string `json:"name,omitempty"`
	Level     *int    `json:"level,omitempty" binding:"omitempty,min=1"`
	Cash      *int    `json:"cash,omitempty" binding:"omitempty,min=0"`
	Bank      *int    `json:"bank,omitempty" binding:"omitempty,min=0"`
	ServerID  *int    `json:"server_id,omitempty"`
	Apartment *struct {
		HasApartment bool       `json:"has_apartment"`
		ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	} `json:"apartment,omitempty"`
	House *struct {
		HasHouse  bool       `json:"has_house"`
		ExpiresAt *time.Time `json:"expires_at,omitempty"`
	} `json:"house,omitempty"`
	Pet *struct {
		HasPet    bool       `json:"has_pet"`
		ExpiresAt *time.Time `json:"expires_at,omitempty"`
	} `json:"pet,omitempty"`
	Laboratory *struct {
		HasLaboratory bool       `json:"has_laboratory"`
		ExpiresAt     *time.Time `json:"expires_at,omitempty"`
	} `json:"laboratory,omitempty"`
	MedicalCard *struct {
		HasMedicalCard bool       `json:"has_medical_card"`
		ExpiresAt      *time.Time `json:"expires_at,omitempty"`
	} `json:"medical_card,omitempty"`
	VipStatus *struct {
		HasVipStatus bool       `json:"has_vip_status"`
		ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	} `json:"vip_status,omitempty"`
}

func (s *CharacterService) CreateCharacter(req *CreateCharacterRequest, userID uint) (*models.Character, error) {
	// Generate unique character ID
	characterID := uuid.New().String()

	character := &models.Character{
		ID:        characterID,
		Name:      req.Name,
		Level:     req.Level,
		Cash:      req.Cash,
		Bank:      req.Bank,
		ServerID:  req.ServerID,
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Map status data
	if req.Apartment != nil {
		character.Apartment = &models.ApartmentStatus{
			HasApartment: req.Apartment.HasApartment,
			ExpiresAt:    req.Apartment.ExpiresAt,
		}
	}

	if req.House != nil {
		character.House = &models.HouseStatus{
			HasHouse:  req.House.HasHouse,
			ExpiresAt: req.House.ExpiresAt,
		}
	}

	if req.Pet != nil {
		character.Pet = &models.PetStatus{
			HasPet:    req.Pet.HasPet,
			ExpiresAt: req.Pet.ExpiresAt,
		}
	}

	if req.Laboratory != nil {
		character.Laboratory = &models.LaboratoryStatus{
			HasLaboratory: req.Laboratory.HasLaboratory,
			ExpiresAt:     req.Laboratory.ExpiresAt,
		}
	}

	if req.MedicalCard != nil {
		character.MedicalCard = &models.MedicalCardStatus{
			HasMedicalCard: req.MedicalCard.HasMedicalCard,
			ExpiresAt:      req.MedicalCard.ExpiresAt,
		}
	}

	if req.VipStatus != nil {
		character.VipStatus = &models.VipStatus{
			HasVipStatus: req.VipStatus.HasVipStatus,
			ExpiresAt:    req.VipStatus.ExpiresAt,
		}
	}

	if err := s.characterRepo.Create(character); err != nil {
		s.logger.WithError(err).Error("Failed to create character")
		return nil, fmt.Errorf("failed to create character: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"character_id": character.ID,
		"user_id":      userID,
		"server_id":    req.ServerID,
	}).Info("Character created successfully")

	return character, nil
}

func (s *CharacterService) GetCharacterByID(id string, userID uint) (*models.Character, error) {
	character, err := s.characterRepo.FindByID(id)
	if err != nil {
		s.logger.WithError(err).WithField("character_id", id).Error("Failed to get character")
		return nil, fmt.Errorf("failed to get character: %w", err)
	}

	// Check if user owns this character
	if character.UserID != userID {
		return nil, fmt.Errorf("character not found")
	}

	return character, nil
}

func (s *CharacterService) GetCharactersByServerID(serverID int, userID uint) ([]models.Character, error) {
	characters, err := s.characterRepo.FindByServerID(serverID)
	if err != nil {
		s.logger.WithError(err).WithField("server_id", serverID).Error("Failed to get characters by server ID")
		return nil, fmt.Errorf("failed to get characters: %w", err)
	}

	// Filter by user ID
	var userCharacters []models.Character
	for _, character := range characters {
		if character.UserID == userID {
			userCharacters = append(userCharacters, character)
		}
	}

	return userCharacters, nil
}

func (s *CharacterService) GetUserCharacters(userID uint) ([]models.Character, error) {
	characters, err := s.characterRepo.FindByUserID(userID)
	if err != nil {
		s.logger.WithError(err).WithField("user_id", userID).Error("Failed to get user characters")
		return nil, fmt.Errorf("failed to get user characters: %w", err)
	}

	return characters, nil
}

func (s *CharacterService) UpdateCharacter(id string, req *UpdateCharacterRequest, userID uint) (*models.Character, error) {
	// Get existing character
	character, err := s.characterRepo.FindByID(id)
	if err != nil {
		s.logger.WithError(err).WithField("character_id", id).Error("Failed to get character for update")
		return nil, fmt.Errorf("character not found: %w", err)
	}

	// Check if user owns this character
	if character.UserID != userID {
		return nil, fmt.Errorf("character not found")
	}

	// Update fields if provided
	if req.Name != nil {
		character.Name = *req.Name
	}
	if req.Level != nil {
		character.Level = *req.Level
	}
	if req.Cash != nil {
		character.Cash = *req.Cash
	}
	if req.Bank != nil {
		character.Bank = *req.Bank
	}
	if req.ServerID != nil {
		character.ServerID = *req.ServerID
	}

	character.UpdatedAt = time.Now()

	// Update status fields if provided
	if req.Apartment != nil {
		character.Apartment = &models.ApartmentStatus{
			HasApartment: req.Apartment.HasApartment,
			ExpiresAt:    req.Apartment.ExpiresAt,
		}
	}

	if req.House != nil {
		character.House = &models.HouseStatus{
			HasHouse:  req.House.HasHouse,
			ExpiresAt: req.House.ExpiresAt,
		}
	}

	if req.Pet != nil {
		character.Pet = &models.PetStatus{
			HasPet:    req.Pet.HasPet,
			ExpiresAt: req.Pet.ExpiresAt,
		}
	}

	if req.Laboratory != nil {
		character.Laboratory = &models.LaboratoryStatus{
			HasLaboratory: req.Laboratory.HasLaboratory,
			ExpiresAt:     req.Laboratory.ExpiresAt,
		}
	}

	if req.MedicalCard != nil {
		character.MedicalCard = &models.MedicalCardStatus{
			HasMedicalCard: req.MedicalCard.HasMedicalCard,
			ExpiresAt:      req.MedicalCard.ExpiresAt,
		}
	}

	if req.VipStatus != nil {
		character.VipStatus = &models.VipStatus{
			HasVipStatus: req.VipStatus.HasVipStatus,
			ExpiresAt:    req.VipStatus.ExpiresAt,
		}
	}

	if err := s.characterRepo.Update(character); err != nil {
		s.logger.WithError(err).WithField("character_id", id).Error("Failed to update character")
		return nil, fmt.Errorf("failed to update character: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"character_id": character.ID,
		"user_id":      userID,
	}).Info("Character updated successfully")

	return character, nil
}

func (s *CharacterService) DeleteCharacter(id string, userID uint) error {
	// Check if character exists and user owns it
	character, err := s.characterRepo.FindByID(id)
	if err != nil {
		s.logger.WithError(err).WithField("character_id", id).Error("Failed to get character for deletion")
		return fmt.Errorf("character not found: %w", err)
	}

	if character.UserID != userID {
		return fmt.Errorf("character not found")
	}

	if err := s.characterRepo.Delete(id); err != nil {
		s.logger.WithError(err).WithField("character_id", id).Error("Failed to delete character")
		return fmt.Errorf("failed to delete character: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"character_id": id,
		"user_id":      userID,
	}).Info("Character deleted successfully")

	return nil
}
