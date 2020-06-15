export default {
  'PluginForm.plugin.basic-auth.desc':
    'basic auth plugin.',
  'PluginForm.plugin.batch-requests.desc':
    'batch-requests can accept mutiple request and send them from apisix via http pipeline,and return a aggregated response to client,this can significantly improve performance when the client needs to access multiple APIs.',
  'PluginForm.plugin.cors.desc': 'cors plugin can help you enable CORS easily.',
  'PluginForm.plugin.fault-injection.desc':
    'Fault injection plugin, used to simulate various back-end failures and high latency.',
  'PluginForm.plugin.grpc-transcoding.desc': 'gRPC transcoding plugin, implement HTTP(s) -> APISIX -> gRPC server',
  'PluginForm.plugin.http-logger.desc':
    'http-logger is a plugin which push Log data requests to HTTP/HTTPS servers.',
  'PluginForm.plugin.ip-restriction.desc':
    'The ip-restriction plugin can add a batch of IP addresses to the white list or black list (choose one of two), the time complexity is O(1), and supports CIDR to represent the IP range.',
  'PluginForm.plugin.jwt-auth.desc':
    'JWT auth plugin.',
  'PluginForm.plugin.kafka-logger.desc':
    'Push the interface request log to the external Kafka cluster in the form of JSON.',
  'PluginForm.plugin.key-auth.desc':
    'key auth plugin.',

  // TODO:
  'PluginForm.plugin.limit-conn.desc':
    'Limiting request concurrency (or concurrent connections) plugin for Apisix.',
  'PluginForm.plugin.limit-conn.property.burst': '',
  'PluginForm.plugin.limit-conn.property.burst.extra': '',
  'PluginForm.plugin.limit-conn.property.conn': '',
  'PluginForm.plugin.limit-conn.property.conn.extra': '',
  'PluginForm.plugin.limit-conn.property.default_conn_delay': '',
  'PluginForm.plugin.limit-conn.property.default_conn_delay.extra': '',
  'PluginForm.plugin.limit-conn.property.key': '',
  'PluginForm.plugin.limit-conn.property.key.extra': '',
  'PluginForm.plugin.limit-conn.property.rejected_code': '',
  'PluginForm.plugin.limit-conn.property.rejected_code.extra': '',

  // FIXME
  'PluginForm.plugin.limit-count.desc':
    'Limit request rate by a fixed number of requests in a given time window.',
  'PluginForm.plugin.limit-count.property.count': '单位窗口内请求数量',
  'PluginForm.plugin.limit-count.property.count.extra': '指定时间窗口内的请求数量阈值',
  'PluginForm.plugin.limit-count.property.time_window': '时间窗口大小',
  'PluginForm.plugin.limit-count.property.time_window.extra':
    '时间窗口的大小（以秒为单位），超过这个时间就会重置',
  'PluginForm.plugin.limit-count.property.key': 'Key',
  'PluginForm.plugin.limit-count.property.key.extra': '用来做请求计数的依据',
  'PluginForm.plugin.limit-count.property.rejected_code': '错误 HTTP 状态码',
  'PluginForm.plugin.limit-count.property.rejected_code.extra':
    '当请求超过阈值时返回的 HTTP 状态码， 默认值是503。',
  'PluginForm.plugin.limit-count.property.policy': '策略',
  'PluginForm.plugin.limit-count.property.policy.extra': '用于检索和增加限制的速率限制策略',
  'PluginForm.plugin.limit-count.property.redis_host': ' Redis 地址',
  'PluginForm.plugin.limit-count.property.redis_host.extra': ' Redis 服务节点的地址',
  'PluginForm.plugin.limit-count.property.redis_port': 'Redis 端口',
  'PluginForm.plugin.limit-count.property.redis_port.extra': 'Redis 服务节点的端口',
  'PluginForm.plugin.limit-count.property.redis_password': 'Redis 密码',
  'PluginForm.plugin.limit-count.property.redis_password.extra': 'Redis 服务节点的密码',
  'PluginForm.plugin.limit-count.property.redis_timeout': 'Redis 超时时间',
  'PluginForm.plugin.limit-count.property.redis_timeout.extra':
    'Redis 服务节点以毫秒为单位的超时时间',

  // FIXME
  'PluginForm.plugin.limit-req.desc': 'limit request rate using the "leaky bucket" method.',
  'PluginForm.plugin.limit-req.property.rate': 'Rate',
  'PluginForm.plugin.limit-req.property.rate.extra':
    '指定的请求速率（以秒为单位），请求速率超过 rate 但没有超过 （rate + brust）的请求会被加上延时。',
  'PluginForm.plugin.limit-req.property.burst': 'Burst',
  'PluginForm.plugin.limit-req.property.burst.extra':
    '请求速率超过 （rate + brust）的请求会被直接拒绝。',
  'PluginForm.plugin.limit-req.property.key': 'Key',
  'PluginForm.plugin.limit-req.property.key.extra': '用来做请求计数的依据',
  'PluginForm.plugin.limit-req.property.rejected_code': '错误 HTTP 状态码',
  'PluginForm.plugin.limit-req.property.rejected_code.extra':
    '当请求超过阈值时返回的 HTTP 状态码， 默认值是503。',

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
