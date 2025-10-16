package handlers

import (
	"net/http"
	"strconv"

	"user-service/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type CharacterHandler struct {
	characterService *services.CharacterService
	logger           *logrus.Logger
}

func NewCharacterHandler(characterService *services.CharacterService, logger *logrus.Logger) *CharacterHandler {
	return &CharacterHandler{
		characterService: characterService,
		logger:           logger,
	}
}

// CreateCharacter создает нового персонажа
func (h *CharacterHandler) CreateCharacter(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	userIDUint, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	var req services.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	character, err := h.characterService.CreateCharacter(&req, uint(userIDUint))
	if err != nil {
		h.logger.WithError(err).Error("Failed to create character")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create character"})
		return
	}

	c.JSON(http.StatusCreated, character)
}

// GetCharacter получает персонажа по ID
func (h *CharacterHandler) GetCharacter(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	userIDUint, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	characterID := c.Param("id")
	character, err := h.characterService.GetCharacterByID(characterID, uint(userIDUint))
	if err != nil {
		h.logger.WithError(err).WithField("character_id", characterID).Error("Failed to get character")
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	c.JSON(http.StatusOK, character)
}

// GetCharactersByServer получает персонажей по server ID
func (h *CharacterHandler) GetCharactersByServer(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	userIDUint, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	serverIDStr := c.Param("serverId")
	serverID, err := strconv.Atoi(serverIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid server ID"})
		return
	}

	characters, err := h.characterService.GetCharactersByServerID(serverID, uint(userIDUint))
	if err != nil {
		h.logger.WithError(err).WithField("server_id", serverID).Error("Failed to get characters by server")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get characters"})
		return
	}

	c.JSON(http.StatusOK, characters)
}

// GetUserCharacters получает всех персонажей пользователя
func (h *CharacterHandler) GetUserCharacters(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	userIDUint, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	characters, err := h.characterService.GetUserCharacters(uint(userIDUint))
	if err != nil {
		h.logger.WithError(err).WithField("user_id", userIDUint).Error("Failed to get user characters")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user characters"})
		return
	}

	c.JSON(http.StatusOK, characters)
}

// UpdateCharacter обновляет персонажа
func (h *CharacterHandler) UpdateCharacter(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	userIDUint, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	characterID := c.Param("id")
	var req services.UpdateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	character, err := h.characterService.UpdateCharacter(characterID, &req, uint(userIDUint))
	if err != nil {
		h.logger.WithError(err).WithField("character_id", characterID).Error("Failed to update character")
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	c.JSON(http.StatusOK, character)
}

// DeleteCharacter удаляет персонажа
func (h *CharacterHandler) DeleteCharacter(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	userIDUint, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	characterID := c.Param("id")
	if err := h.characterService.DeleteCharacter(characterID, uint(userIDUint)); err != nil {
		h.logger.WithError(err).WithField("character_id", characterID).Error("Failed to delete character")
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Character deleted successfully"})
}