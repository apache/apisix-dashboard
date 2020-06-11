export default {
  'PluginForm.plugin.basic-auth.desc':
    'basic-auth is an authentication plugin that need to work with consumer.',
  'PluginForm.plugin.batch-requests.desc':
    'batch-requests can accept mutiple request and send them from apisix via http pipeline,and return a aggregated response to client,this can significantly improve performance when the client needs to access multiple APIs.',
  'PluginForm.plugin.cors.desc': 'cors plugin can help you enable CORS easily.',
  'PluginForm.plugin.fault-injection.desc':
    'Fault injection plugin, this plugin can be used with other plugins and will be executed before other plugins.',
  'PluginForm.plugin.grpc-transcoding.desc': 'HTTP(s) -> APISIX -> gRPC server',
  'PluginForm.plugin.http-logger.desc':
    'http-logger is a plugin which push Log data requests to HTTP/HTTPS servers.',
  'PluginForm.plugin.ip-restriction.desc':
    'The ip-restriction can restrict access to a Service or a Route by either whitelisting or blacklisting IP addresses. Single IPs, multiple IPs or ranges in CIDR notation like 10.10.10.0/24 can be used(will support IPv6 soon).',
  'PluginForm.plugin.jwt-auth.desc':
    'jwt-auth is an authentication plugin that need to work with consumer.',
  'PluginForm.plugin.kafka-logger.desc':
    'kafka-logger is a plugin which works as a Kafka client driver for the ngx_lua nginx module.',
  'PluginForm.plugin.key-auth.desc':
    'key-auth is an authentication plugin, it should work with consumer together.',
  'PluginForm.plugin.limit-conn.desc':
    'Limiting request concurrency (or concurrent connections) plugin for Apisix.',
  'PluginForm.plugin.limit-count.desc':
    'Limit request rate by a fixed number of requests in a given time window.',
  'PluginForm.plugin.limit-req.desc': 'limit request rate using the "leaky bucket" method.',
  'PluginForm.plugin.mqtt-proxy.desc':
    'The plugin mqtt-proxy only works in stream model, it help you to dynamic load balance by client_id of MQTT.',
  'PluginForm.plugin.oauth.desc':
    'The OAuth 2 / Open ID Connect(OIDC) plugin provides authentication and introspection capability to APISIX.',
  'PluginForm.plugin.prometheus.desc':
    'This plugin exposes metrics in Prometheus Exposition format.',
  'PluginForm.plugin.proxy-cache.desc':
    'The proxy-cache plugin, which provides the ability to cache upstream response data and can be used with other plugins. ',
  'PluginForm.plugin.proxy-mirror.desc':
    'The proxy-mirror plugin, which provides the ability to mirror client requests.',
  'PluginForm.plugin.proxy-rewrite.desc': 'upstream proxy info rewrite plugin.',
  'PluginForm.plugin.redirect.desc': 'URI redirect.',
  'PluginForm.plugin.response-rewrite.desc':
    'response rewrite plugin, rewrite the content from upstream.',
  'PluginForm.plugin.serverless.desc':
    'There are two plug-ins for serverless, namely serverless-pre-function and serverless-post-function.',
  'PluginForm.plugin.syslog.desc': 'sys is a plugin which push Log data requests to Syslog.',
  'PluginForm.plugin.tcp-logger.desc':
    'tcp-logger is a plugin which push Log data requests to TCP servers.',
  'PluginForm.plugin.udp-logger.desc':
    'udp-logger is a plugin which push Log data requests to UDP servers.',
  'PluginForm.plugin.wolf-rbac.desc':
    'wolf-rbac is an authentication and authorization (rbac) plugin',
  'PluginForm.plugin.zipkin.desc': 'Zipkin is a OpenTracing plugin.',
  'PluginForm.plugin.node-status.desc': 'No description currently.',
  'PluginForm.plugin.serverless-pre-function.desc':
    'It belongs to serverless, and will execute first',
  'PluginForm.plugin.serverless-post-function.desc':
    'It belongs to serverless and will execute in the end',
  'PluginForm.plugin.openid-connect.desc': 'No description currently.',
  'PluginForm.plugin.heartbeat.desc': 'No description currently.',
};
