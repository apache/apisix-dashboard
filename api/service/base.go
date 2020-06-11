package service

import (
	"github.com/jinzhu/gorm"
	"github.com/satori/go.uuid"
	"time"
)

// Base contains common columns for all tables.
type Base struct {
	ID         uuid.UUID `json:"id",sql:"type:uuid;primary_key;"`
	CreateTime int64     `json:"create_time"`
	UpdateTime int64     `json:"update_time"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (base *Base) BeforeCreate(scope *gorm.Scope) error {
	timestamp := time.Now().Unix()
	err := scope.SetColumn("UpdateTime", timestamp)
	err = scope.SetColumn("CreateTime", timestamp)
	if len(base.ID) == 0 {
		uuid := uuid.NewV4()
		err = scope.SetColumn("ID", uuid)
		return err
	}
	return err
}

func (base *Base) BeforeSave(scope *gorm.Scope) error {
	err := scope.SetColumn("UpdateTime", time.Now().Unix())
	return err
}
