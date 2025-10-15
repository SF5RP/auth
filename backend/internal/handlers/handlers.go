package handlers

import (
	"auth-service/internal/config"
	"auth-service/internal/services"
	"bytes"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type AuthHandler struct {
	authService *services.AuthService
    cfg         *config.Config
	logger      *logrus.Logger
}

func NewAuthHandler(authService *services.AuthService, logger *logrus.Logger, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		authService: authService,
        cfg:         cfg,
		logger:      logger,
	}
}

type UserHandler struct {
	authService *services.AuthService
	logger      *logrus.Logger
}

func NewUserHandler(authService *services.AuthService, logger *logrus.Logger) *UserHandler {
	return &UserHandler{
		authService: authService,
		logger:      logger,
	}
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "auth-service",
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
    q := url.Values{}
    q.Set("client_id", h.cfg.DiscordClientID)
    q.Set("redirect_uri", h.cfg.DiscordRedirectURI)
    q.Set("response_type", "code")
    q.Set("scope", "identify")
    q.Set("prompt", "consent")

    authURL := url.URL{
        Scheme:   "https",
        Host:     "discord.com",
        Path:     "/api/oauth2/authorize",
        RawQuery: q.Encode(),
    }

    c.Redirect(http.StatusFound, authURL.String())
}

func (h *AuthHandler) Callback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code is required"})
		return
	}

    // Обмен code -> access_token
    tokenReq := url.Values{}
    tokenReq.Set("client_id", h.cfg.DiscordClientID)
    tokenReq.Set("client_secret", h.cfg.DiscordClientSecret)
    tokenReq.Set("grant_type", "authorization_code")
    tokenReq.Set("code", code)
    tokenReq.Set("redirect_uri", h.cfg.DiscordRedirectURI)

    tokenResp, err := http.Post(
        "https://discord.com/api/oauth2/token",
        "application/x-www-form-urlencoded",
        bytes.NewBufferString(tokenReq.Encode()),
    )
    if err != nil {
        h.logger.WithError(err).Error("Discord token request failed")
        c.JSON(http.StatusBadGateway, gin.H{"error": "discord token request failed"})
        return
    }
    defer tokenResp.Body.Close()

    if tokenResp.StatusCode != http.StatusOK {
        c.JSON(http.StatusBadGateway, gin.H{"error": "discord token request error", "status": tokenResp.Status})
        return
    }

    var tokenBody struct {
        AccessToken string `json:"access_token"`
        TokenType   string `json:"token_type"`
        Scope       string `json:"scope"`
        ExpiresIn   int    `json:"expires_in"`
        RefreshToken string `json:"refresh_token"`
    }
    if err := json.NewDecoder(tokenResp.Body).Decode(&tokenBody); err != nil {
        h.logger.WithError(err).Error("Failed to decode discord token response")
        c.JSON(http.StatusBadGateway, gin.H{"error": "invalid token response"})
        return
    }

    // Запрос пользователя
    req, _ := http.NewRequest("GET", "https://discord.com/api/users/@me", nil)
    req.Header.Set("Authorization", tokenBody.TokenType+" "+tokenBody.AccessToken)
    userResp, err := http.DefaultClient.Do(req)
    if err != nil {
        h.logger.WithError(err).Error("Discord user request failed")
        c.JSON(http.StatusBadGateway, gin.H{"error": "discord user request failed"})
        return
    }
    defer userResp.Body.Close()
    if userResp.StatusCode != http.StatusOK {
        c.JSON(http.StatusBadGateway, gin.H{"error": "discord user request error", "status": userResp.Status})
        return
    }

    var discordUser struct {
        ID            string `json:"id"`
        Username      string `json:"username"`
        Discriminator string `json:"discriminator"`
        GlobalName    string `json:"global_name"`
        Avatar        string `json:"avatar"`
    }
    if err := json.NewDecoder(userResp.Body).Decode(&discordUser); err != nil {
        h.logger.WithError(err).Error("Failed to decode discord user response")
        c.JSON(http.StatusBadGateway, gin.H{"error": "invalid user response"})
        return
    }

    // Сборка URL аватара
    avatarURL := ""
    if discordUser.Avatar != "" {
        avatarURL = "https://cdn.discordapp.com/avatars/" + discordUser.ID + "/" + discordUser.Avatar + ".png"
    }
    displayName := discordUser.GlobalName
    if displayName == "" {
        displayName = discordUser.Username
    }

    user, err := h.authService.CreateOrUpdateUser(discordUser.ID, displayName, discordUser.Discriminator, avatarURL)
    if err != nil {
        h.logger.WithError(err).Error("Failed to create/update user")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process user"})
        return
    }

    accessToken, refreshToken, err := h.authService.GenerateTokens(user)
    if err != nil {
        h.logger.WithError(err).Error("Failed to generate tokens")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate tokens"})
        return
    }

    // Перенаправляем на фронтенд с токенами
    callbackURL := h.cfg.FrontendURL + "/callback?access_token=" + accessToken + "&refresh_token=" + refreshToken
    c.Redirect(http.StatusFound, callbackURL)
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, err := h.authService.RefreshAccessToken(req.RefreshToken)
	if err != nil {
		h.logger.WithError(err).Error("Failed to refresh token")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
	})
}

func (h *UserHandler) GetMe(c *gin.Context) {
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

	user, err := h.authService.GetUserByID(uint(userIDUint))
	if err != nil {
		h.logger.WithError(err).Error("Failed to get user")
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetUsers(c *gin.Context) {
	// Получаем всех пользователей из AuthService
	users := h.authService.GetAllUsers()
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) UpdateUserRole(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.authService.UpdateUserRole(uint(userID), req.Role); err != nil {
		h.logger.WithError(err).Error("Failed to update user role")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}
