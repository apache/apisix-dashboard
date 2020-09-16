package entity

type Route struct {
  ID string `json:"id"`
  Uri string `json:"uri,omitempty" validate:"uri"`
  Uris []string `json:"uris,omitempty"`
  Name string `json:"name,omitempty" validate:"max=50"`
  Desc string `json:"desc,omitempty" validate:"max=256"`
  Priority int `json:"priority,omitempty"`
  Methods []string `json:"methods,omitempty"`
  Host string `json:"host,omitempty"`
  Hosts        []string `json:"hosts,omitempty"`
  RemoteAddr   string `json:"remote_addr,omitempty"`
  RemoteAddrs string `json:"remote_addrs,omitempty"`
  Vars string `json:"vars,omitempty"`
  FilterFunc string `json:"filter_func,omitempty"`
  Script string `json:"script,omitempty"`
  Plugins interface{} `json:"plugins,omitempty"`
  Upstream Upstream `json:"upstream,omitempty"`
  ServiceId string `json:"service_id,omitempty"`
  UpstreamId string `json:"upstream_id,omitempty"`
  ServiceProtocol string `json:"service_protocol,omitempty"`
}

type Upstream struct {

}
