package conf

import (
	"strconv"

	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/internal/utils/consts"
)

var (
	// UserList is a mapping of user type and users
	// like  local  => [User1, User2] google => [User3, User4] github => [User5, User6]
	UserList   = make([]DashboardUserLocal, 0)
	DataSource DataSourceType
)

type UserType string
type DataSourceType string

const (
	DataSourceTypeLocal DataSourceType = "local"
	DataSourceTypeEtcd  DataSourceType = "etcd"
)

type Authentication struct {
	Secret     string
	ExpireTime int            `yaml:"expire_time"`
	DataSource DataSourceType `yaml:"data_source"`
	Users      []DashboardUserLocal
}

// DashboardUserLocal is local user and login by username and password
type DashboardUserLocal struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (u DashboardUserLocal) Valid(password string) (bool, error) {
	if password == "" || u.Password != password {
		return false, consts.ErrUsernamePassword
	}

	return true, nil
}

func initAuthentication(conf Authentication) {
	AuthConf = conf
	if AuthConf.Secret == "secret" {
		AuthConf.Secret = utils.GetFlakeUidStr()
	}

	// user store data source
	DataSource = conf.DataSource

	if DataSource == DataSourceTypeLocal {
		// parse user list in config file
		userList := conf.Users
		for key, item := range userList {
			if item.Username == "" {
				panic("user info error: username empty, index: " + strconv.Itoa(key))
			}
			if item.Password == "" {
				panic("user info error: password empty, index: " + strconv.Itoa(key))
			}

			UserList = append(UserList, item)
		}
	}
}
