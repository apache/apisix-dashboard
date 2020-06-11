package conf

import (
	"fmt"
	//_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"time"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

// InitializeMysql creates mysql's *sqlDB instance
func InitializeMysql() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8&parseTime=True&loc=Local", MysqlConfig.User,
		MysqlConfig.Password, MysqlConfig.Address, "api7")
	if tmp, err := gorm.Open("mysql", dsn); err != nil {
		panic(fmt.Sprintf("fail to connect to DB: %s for %s", err.Error(), dsn))
	} else {
		db = tmp
		db.LogMode(true)
		db.DB().SetMaxOpenConns(MysqlConfig.MaxConns)
		db.DB().SetMaxIdleConns(MysqlConfig.MaxIdleConns)
		db.DB().SetConnMaxLifetime(time.Duration(MysqlConfig.MaxLifeTime) * time.Minute)
	}

}
