package entity

// Base contains common columns for all tables.
type Base struct {
	ID         string `json:"id"`
	CreateTime int64  `json:"create_time"`
	UpdateTime int64  `json:"update_time"`
}

type Route struct {
	Base
	Name            string `json:"name"`
	Description     string `json:"description,omitempty"`
	Hosts           string `json:"hosts"`
	Uris            string `json:"uris"`
	UpstreamNodes   string `json:"upstream_nodes"`
	UpstreamId      string `json:"upstream_id"`
	Priority        int64  `json:"priority"`
	Content         string `json:"content"`
	ContentAdminApi string `json:"content_admin_api"`
}
