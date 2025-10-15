package database

import (
	"auth-service/internal/models"
	"database/sql"
)

type CharacterRepo struct {
	db *DB
}

func NewCharacterRepo(db *DB) *CharacterRepo {
	return &CharacterRepo{db: db}
}

func (r *CharacterRepo) Create(character *models.Character) error {
	tx, err := r.db.SQL.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert main character record
	query := `
		INSERT INTO characters (id, name, level, cash, bank, server_id, user_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err = tx.Exec(query, character.ID, character.Name, character.Level, character.Cash, character.Bank, character.ServerID, character.UserID, character.CreatedAt, character.UpdatedAt)
	if err != nil {
		return err
	}

	// Insert status records if they exist
	if character.Apartment != nil {
		_, err = tx.Exec(
			`INSERT INTO character_apartment (character_id, has_apartment, expires_at) VALUES ($1, $2, $3)`,
			character.ID, character.Apartment.HasApartment, character.Apartment.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.House != nil {
		_, err = tx.Exec(
			`INSERT INTO character_house (character_id, has_house, expires_at) VALUES ($1, $2, $3)`,
			character.ID, character.House.HasHouse, character.House.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.Pet != nil {
		_, err = tx.Exec(
			`INSERT INTO character_pet (character_id, has_pet, expires_at) VALUES ($1, $2, $3)`,
			character.ID, character.Pet.HasPet, character.Pet.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.Laboratory != nil {
		_, err = tx.Exec(
			`INSERT INTO character_laboratory (character_id, has_laboratory, expires_at) VALUES ($1, $2, $3)`,
			character.ID, character.Laboratory.HasLaboratory, character.Laboratory.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.MedicalCard != nil {
		_, err = tx.Exec(
			`INSERT INTO character_medical_card (character_id, has_medical_card, expires_at) VALUES ($1, $2, $3)`,
			character.ID, character.MedicalCard.HasMedicalCard, character.MedicalCard.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.VipStatus != nil {
		_, err = tx.Exec(
			`INSERT INTO character_vip_status (character_id, has_vip_status, expires_at) VALUES ($1, $2, $3)`,
			character.ID, character.VipStatus.HasVipStatus, character.VipStatus.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *CharacterRepo) FindByID(id string) (*models.Character, error) {
	character := &models.Character{}
	query := `
		SELECT id, name, level, cash, bank, server_id, user_id, created_at, updated_at
		FROM characters WHERE id = $1
	`
	err := r.db.SQL.QueryRow(query, id).Scan(
		&character.ID, &character.Name, &character.Level, &character.Cash, &character.Bank,
		&character.ServerID, &character.UserID, &character.CreatedAt, &character.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Load status data
	if err := r.loadCharacterStatuses(character); err != nil {
		return nil, err
	}

	return character, nil
}

func (r *CharacterRepo) FindByServerID(serverID int) ([]models.Character, error) {
	query := `
		SELECT id, name, level, cash, bank, server_id, user_id, created_at, updated_at
		FROM characters WHERE server_id = $1 ORDER BY created_at DESC
	`
	rows, err := r.db.SQL.Query(query, serverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var characters []models.Character
	for rows.Next() {
		character := models.Character{}
		err := rows.Scan(
			&character.ID, &character.Name, &character.Level, &character.Cash, &character.Bank,
			&character.ServerID, &character.UserID, &character.CreatedAt, &character.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Load status data
		if err := r.loadCharacterStatuses(&character); err != nil {
			return nil, err
		}

		characters = append(characters, character)
	}

	return characters, rows.Err()
}

func (r *CharacterRepo) FindByUserID(userID uint) ([]models.Character, error) {
	query := `
		SELECT id, name, level, cash, bank, server_id, user_id, created_at, updated_at
		FROM characters WHERE user_id = $1 ORDER BY created_at DESC
	`
	rows, err := r.db.SQL.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var characters []models.Character
	for rows.Next() {
		character := models.Character{}
		err := rows.Scan(
			&character.ID, &character.Name, &character.Level, &character.Cash, &character.Bank,
			&character.ServerID, &character.UserID, &character.CreatedAt, &character.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Load status data
		if err := r.loadCharacterStatuses(&character); err != nil {
			return nil, err
		}

		characters = append(characters, character)
	}

	return characters, rows.Err()
}

func (r *CharacterRepo) Update(character *models.Character) error {
	tx, err := r.db.SQL.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update main character record
	query := `
		UPDATE characters 
		SET name = $2, level = $3, cash = $4, bank = $5, server_id = $6, updated_at = $7
		WHERE id = $1
	`
	_, err = tx.Exec(query, character.ID, character.Name, character.Level, character.Cash, character.Bank, character.ServerID, character.UpdatedAt)
	if err != nil {
		return err
	}

	// Update status records
	if character.Apartment != nil {
		_, err = tx.Exec(
			`INSERT INTO character_apartment (character_id, has_apartment, expires_at) VALUES ($1, $2, $3)
			 ON CONFLICT (character_id) DO UPDATE SET has_apartment = EXCLUDED.has_apartment, expires_at = EXCLUDED.expires_at`,
			character.ID, character.Apartment.HasApartment, character.Apartment.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.House != nil {
		_, err = tx.Exec(
			`INSERT INTO character_house (character_id, has_house, expires_at) VALUES ($1, $2, $3)
			 ON CONFLICT (character_id) DO UPDATE SET has_house = EXCLUDED.has_house, expires_at = EXCLUDED.expires_at`,
			character.ID, character.House.HasHouse, character.House.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.Pet != nil {
		_, err = tx.Exec(
			`INSERT INTO character_pet (character_id, has_pet, expires_at) VALUES ($1, $2, $3)
			 ON CONFLICT (character_id) DO UPDATE SET has_pet = EXCLUDED.has_pet, expires_at = EXCLUDED.expires_at`,
			character.ID, character.Pet.HasPet, character.Pet.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.Laboratory != nil {
		_, err = tx.Exec(
			`INSERT INTO character_laboratory (character_id, has_laboratory, expires_at) VALUES ($1, $2, $3)
			 ON CONFLICT (character_id) DO UPDATE SET has_laboratory = EXCLUDED.has_laboratory, expires_at = EXCLUDED.expires_at`,
			character.ID, character.Laboratory.HasLaboratory, character.Laboratory.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.MedicalCard != nil {
		_, err = tx.Exec(
			`INSERT INTO character_medical_card (character_id, has_medical_card, expires_at) VALUES ($1, $2, $3)
			 ON CONFLICT (character_id) DO UPDATE SET has_medical_card = EXCLUDED.has_medical_card, expires_at = EXCLUDED.expires_at`,
			character.ID, character.MedicalCard.HasMedicalCard, character.MedicalCard.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	if character.VipStatus != nil {
		_, err = tx.Exec(
			`INSERT INTO character_vip_status (character_id, has_vip_status, expires_at) VALUES ($1, $2, $3)
			 ON CONFLICT (character_id) DO UPDATE SET has_vip_status = EXCLUDED.has_vip_status, expires_at = EXCLUDED.expires_at`,
			character.ID, character.VipStatus.HasVipStatus, character.VipStatus.ExpiresAt,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *CharacterRepo) Delete(id string) error {
	_, err := r.db.SQL.Exec("DELETE FROM characters WHERE id = $1", id)
	return err
}

func (r *CharacterRepo) loadCharacterStatuses(character *models.Character) error {
	// Load apartment status
	var hasApartment bool
	var apartmentExpiresAt sql.NullTime
	err := r.db.SQL.QueryRow(
		"SELECT has_apartment, expires_at FROM character_apartment WHERE character_id = $1",
		character.ID,
	).Scan(&hasApartment, &apartmentExpiresAt)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		character.Apartment = &models.ApartmentStatus{
			HasApartment: hasApartment,
			ExpiresAt:    &apartmentExpiresAt.Time,
		}
		if !apartmentExpiresAt.Valid {
			character.Apartment.ExpiresAt = nil
		}
	}

	// Load house status
	var hasHouse bool
	var houseExpiresAt sql.NullTime
	err = r.db.SQL.QueryRow(
		"SELECT has_house, expires_at FROM character_house WHERE character_id = $1",
		character.ID,
	).Scan(&hasHouse, &houseExpiresAt)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		character.House = &models.HouseStatus{
			HasHouse: hasHouse,
			ExpiresAt: &houseExpiresAt.Time,
		}
		if !houseExpiresAt.Valid {
			character.House.ExpiresAt = nil
		}
	}

	// Load pet status
	var hasPet bool
	var petExpiresAt sql.NullTime
	err = r.db.SQL.QueryRow(
		"SELECT has_pet, expires_at FROM character_pet WHERE character_id = $1",
		character.ID,
	).Scan(&hasPet, &petExpiresAt)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		character.Pet = &models.PetStatus{
			HasPet: hasPet,
			ExpiresAt: &petExpiresAt.Time,
		}
		if !petExpiresAt.Valid {
			character.Pet.ExpiresAt = nil
		}
	}

	// Load laboratory status
	var hasLaboratory bool
	var laboratoryExpiresAt sql.NullTime
	err = r.db.SQL.QueryRow(
		"SELECT has_laboratory, expires_at FROM character_laboratory WHERE character_id = $1",
		character.ID,
	).Scan(&hasLaboratory, &laboratoryExpiresAt)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		character.Laboratory = &models.LaboratoryStatus{
			HasLaboratory: hasLaboratory,
			ExpiresAt: &laboratoryExpiresAt.Time,
		}
		if !laboratoryExpiresAt.Valid {
			character.Laboratory.ExpiresAt = nil
		}
	}

	// Load medical card status
	var hasMedicalCard bool
	var medicalCardExpiresAt sql.NullTime
	err = r.db.SQL.QueryRow(
		"SELECT has_medical_card, expires_at FROM character_medical_card WHERE character_id = $1",
		character.ID,
	).Scan(&hasMedicalCard, &medicalCardExpiresAt)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		character.MedicalCard = &models.MedicalCardStatus{
			HasMedicalCard: hasMedicalCard,
			ExpiresAt: &medicalCardExpiresAt.Time,
		}
		if !medicalCardExpiresAt.Valid {
			character.MedicalCard.ExpiresAt = nil
		}
	}

	// Load VIP status
	var hasVipStatus bool
	var vipStatusExpiresAt sql.NullTime
	err = r.db.SQL.QueryRow(
		"SELECT has_vip_status, expires_at FROM character_vip_status WHERE character_id = $1",
		character.ID,
	).Scan(&hasVipStatus, &vipStatusExpiresAt)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		character.VipStatus = &models.VipStatus{
			HasVipStatus: hasVipStatus,
			ExpiresAt: &vipStatusExpiresAt.Time,
		}
		if !vipStatusExpiresAt.Valid {
			character.VipStatus.ExpiresAt = nil
		}
	}

	return nil
}
