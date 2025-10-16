package services

import (
	"fmt"
	"sync"

	"user-service/internal/models"

	"github.com/sirupsen/logrus"
)

type UserService struct {
    logger  *logrus.Logger
    userRepo UserRepository
    mutex   *sync.RWMutex
}

func NewUserService(logger *logrus.Logger, userRepo UserRepository) *UserService {
    return &UserService{
        logger:  logger,
        userRepo: userRepo,
        mutex:   &sync.RWMutex{},
    }
}

func (s *UserService) GetUserByID(id uint) (*models.User, error) {
    return s.userRepo.FindByID(id)
}

func (s *UserService) GetAllUsers() ([]models.User, error) {
    return s.userRepo.FindAll()
}

func (s *UserService) UpdateUserRole(id uint, role string) error {
    validRoles := map[string]bool{
        "user":      true,
        "moderator": true,
        "admin":     true,
    }
    if !validRoles[role] {
        return fmt.Errorf("invalid role")
    }
    return s.userRepo.UpdateRole(id, role)
}

