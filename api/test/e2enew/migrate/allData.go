package migrate

type AllData struct {
	Counsumers    []interface{}
	Routes        []interface{}
	Services      []interface{}
	SSLs          []interface{}
	Upstreams     []interface{}
	Scripts       []interface{}
	GlobalPlugins []interface{}
	PluginConfigs []interface{}
}
