package conf

import (
	"strconv"

	"golang.org/x/crypto/bcrypt"

	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/internal/utils/consts"
)

var (
	// UserList is a mapping of user type and users
	// like  local  => [User1, User2] google => [User3, User4] github => [User5, User6]
	UserList = make(map[UserType][]DashboardUser)
)

type Authentication struct {
	Secret     string
	ExpireTime int `yaml:"expire_time"`
	Users      []map[string]string
}

type UserType string

const (
	UserTypeLocal UserType = "local"
)

// DashboardUser is the define of functions required for the dashboard user structure
type DashboardUser interface {
	GetType() UserType
	GetID() string
	Valid(params map[string]interface{}) (bool, error)
}

type DashboardUserBasic struct {
	Type UserType
}

// DashboardUserLocal is local user and login by username and password
type DashboardUserLocal struct {
	DashboardUserBasic
	Username string
	Password string
}

func (DashboardUserLocal) GetType() UserType {
	return UserTypeLocal
}

func (u DashboardUserLocal) GetID() string {
	return u.Username
}

func (u DashboardUserLocal) Valid(params map[string]interface{}) (bool, error) {
	if params["password"] == nil {
		return false, consts.ErrUsernamePassword
	}

	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(params["password"].(string))) != nil {
		return false, consts.ErrUsernamePassword
	}

	return true, nil
}

func initAuthentication(conf Authentication) {
	AuthConf = conf
	if AuthConf.Secret == "secret" {
		AuthConf.Secret = utils.GetFlakeUidStr()
	}

	// parse user list in config file
	userList := conf.Users
	for key, item := range userList {
		userType := item["type"]

		// compatible with old usage
		if userType == "" {
			userType = "local"
		}

		basicInfo := DashboardUserBasic{
			Type: UserType(userType),
		}

		// initialize user list slice
		if UserList[basicInfo.Type] == nil {
			UserList[basicInfo.Type] = make([]DashboardUser, 0)
		}

		// write user to the user list
		switch basicInfo.Type {
		case UserTypeLocal:
			fallthrough
		default:
			if _, ok := item["username"]; !ok {
				panic("user info error: username empty, key: " + strconv.Itoa(key))
			}
			if _, ok := item["password"]; !ok {
				panic("user info error: password empty, key: " + strconv.Itoa(key))
			}
			UserList[basicInfo.Type] = append(UserList[basicInfo.Type], &DashboardUserLocal{
				DashboardUserBasic: basicInfo,
				Username:           item["username"],
				Password:           item["password"],
			})
		}
	}
}
