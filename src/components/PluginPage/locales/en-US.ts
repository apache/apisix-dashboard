export default {
  'PluginForm.plugin.limit-conn.desc': 'Limit the number of concurrent connections',
  'PluginForm.plugin.limit-conn.property.conn': 'conn',
  'PluginForm.plugin.limit-conn.property.conn.extra': 'Maximum number of concurrent connections',
  'PluginForm.plugin.limit-conn.property.burst': 'burst',
  'PluginForm.plugin.limit-conn.property.burst.extra':
    'When the number of concurrent connections more than conn but less than burst, the request will be delayed',
  'PluginForm.plugin.limit-conn.property.default_conn_delay': 'delay time',
  'PluginForm.plugin.limit-conn.property.default_conn_delay.extra':
    'Waiting time(seconds) for requests being delayed',
  'PluginForm.plugin.limit-conn.property.key': 'key',
  'PluginForm.plugin.limit-conn.property.key.extra': 'Basis of restriction',
  'PluginForm.plugin.limit-conn.property.rejected_code': 'Reject status code',
  'PluginForm.plugin.limit-conn.property.rejected_code.extra':
    'When the number of concurrent connections more than conn + burst, HTTP status code will be returned to the terminal',

  'PluginForm.plugin.limit-count.desc': 'Limit the total requests within the specified time range',
  'PluginForm.plugin.limit-count.property.count': 'Total requests',
  'PluginForm.plugin.limit-count.property.count.extra': 'Threshold for the number of requests within a specified time window',
  'PluginForm.plugin.limit-count.property.time_window': 'Time window',
  'PluginForm.plugin.limit-count.property.time_window.extra':
    'When the size of time window(seconds) is exceeded, the total number of requests will be reset',
  'PluginForm.plugin.limit-count.property.key': 'key',
  'PluginForm.plugin.limit-count.property.key.extra': 'Basis of request count',
  'PluginForm.plugin.limit-count.property.rejected_code': 'Reject status code',
  'PluginForm.plugin.limit-count.property.rejected_code.extra':
    'When the requests exceed threshold, HTTP status code will be returned to the terminal',
  'PluginForm.plugin.limit-count.property.policy': 'policy',
  'PluginForm.plugin.limit-count.property.redis_host': 'host address',
  'PluginForm.plugin.limit-count.property.redis_host.extra': 'Redis node address for cluster flow limited',
  'PluginForm.plugin.limit-count.property.redis_port': 'port',
  'PluginForm.plugin.limit-count.property.redis_password': 'password',
  'PluginForm.plugin.limit-count.property.redis_timeout': 'timeout(millisecond)',

  'PluginForm.plugin.limit-req.desc': 'A plugin which is base leaky bucket algorithm to limit the speed of requests',
  'PluginForm.plugin.limit-req.property.rate': 'rate',
  'PluginForm.plugin.limit-req.property.rate.extra': 'Request rate per second',
  'PluginForm.plugin.limit-req.property.burst': 'burst',
  'PluginForm.plugin.limit-req.property.burst.extra':
    'When request rate per second exceed date but blow rate + burst, the request will be delayed',
  'PluginForm.plugin.limit-req.property.key': 'key',
  'PluginForm.plugin.limit-req.property.key.extra': 'Basis of request count',
  'PluginForm.plugin.limit-req.property.rejected_code': 'Reject status code',
  'PluginForm.plugin.limit-req.property.rejected_code.extra':
    'When the rate exceed rate + burst, HTTP status code will be returned to the terminal',

  'PluginForm.plugin.cors.desc': 'The CORS plugin can enable the return header of CORS for the server',
  'PluginForm.plugin.cors.property.allow_origins': 'The origin which allow cross-domain access',
  'PluginForm.plugin.cors.property.allow_origins.extra': 'For example: https://somehost.com:8081',
  'PluginForm.plugin.cors.property.allow_methods': 'The method which allow cross-domain access',

  'PluginForm.plugin.fault-injection.desc': 'Fault injection plugin used to simulate various backend failures and high latency',
  'PluginForm.plugin.fault-injection.property.http_status': 'HTTP status code',
  'PluginForm.plugin.fault-injection.property.body': 'response body',
  'PluginForm.plugin.fault-injection.property.duration': 'delay time(seconds)',

  'PluginForm.plugin.http-logger.desc': 'http-logger can push log data requests to the HTTP/HTTPS server',
  'PluginForm.plugin.http-logger.property.uri': 'log server address',
  'PluginForm.plugin.http-logger.property.uri.extra': 'For example: 127.0.0.1:80/postendpoint?param=1',

  'PluginForm.plugin.ip-restriction.desc':
    'ip-restriction can add a batch of IP addresses in whitelist or blacklist(either), time complexity is O(1), and can use CIDR to represent IP range',
  'PluginForm.plugin.ip-restriction.property.whitelist': 'whitelist',
  'PluginForm.plugin.ip-restriction.property.blacklist': 'blacklist',

  'PluginForm.plugin.kafka-logger.desc': '把接口请求日志以 JSON 的形式推送给外部 Kafka 集群',
  'PluginForm.plugin.kafka-logger.property.broker_list': 'broker',
  'PluginForm.plugin.kafka-logger.property.kafka_topic': 'topic',

  'PluginForm.plugin.prometheus.desc': 'provide metrics data which is accord with prometheus data formate',

  'PluginForm.plugin.proxy-cache.desc': 'Proxy cache plugin, which can cache the response data of the backend service',
  'PluginForm.plugin.proxy-cache.property.cache_zone': 'cache area name',
  'PluginForm.plugin.proxy-cache.property.cache_zone.extra':
    'The local directory is /TMP/{area name}, when modify the default area name, config.yaml must be modified too',
  'PluginForm.plugin.proxy-cache.property.cache_key': 'cache key',
  'PluginForm.plugin.proxy-cache.property.cache_key.extra':
    'can use Nginx variables, for example: $host, $uri',
  'PluginForm.plugin.proxy-cache.property.cache_bypass': 'skip cache retrieval',
  'PluginForm.plugin.proxy-cache.property.cache_bypass.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will skip cache retrieval',
  'PluginForm.plugin.proxy-cache.property.cache_method': 'cache Method',
  'PluginForm.plugin.proxy-cache.property.cache_http_status': 'cache the response status code',
  'PluginForm.plugin.proxy-cache.property.hide_cache_headers': 'hidden cache header',
  'PluginForm.plugin.proxy-cache.property.hide_cache_headers.extra':
    'Whether to return Expires and Cache-Control response headers to the client',
  'PluginForm.plugin.proxy-cache.property.no_cache': 'uncached data',
  'PluginForm.plugin.proxy-cache.property.no_cache.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will not be cached',

  'PluginForm.plugin.proxy-mirror.desc': 'proxy mirror plugin provides the ability to mirror client',
  'PluginForm.plugin.proxy-mirror.property.host': 'mirror service address',
  'PluginForm.plugin.proxy-mirror.property.host.extra':
    'For example: http://127.0.0.1:9797. Address need to include HTTP or HTTPS but not include the URI part',

  'PluginForm.plugin.response-rewrite.desc': 'The plugin supports modifying the body and header information returned by the upstream service',
  'PluginForm.plugin.response-rewrite.property.status_code': 'status code',
  'PluginForm.plugin.response-rewrite.property.body': 'response body',
  'PluginForm.plugin.response-rewrite.property.body_base64': 'Whether the response body requires base64 decoding',
  'PluginForm.plugin.response-rewrite.property.headers': 'HTTP header',

  'PluginForm.plugin.syslog.desc': 'relate to the syslog log server',
  'PluginForm.plugin.syslog.property.host': 'log server address',
  'PluginForm.plugin.syslog.property.port': 'log server port',
  'PluginForm.plugin.syslog.property.timeout': 'timeout',
  'PluginForm.plugin.syslog.property.tls': 'open SSL',
  'PluginForm.plugin.syslog.property.flush_limit': 'cache size',
  'PluginForm.plugin.syslog.property.sock_type': 'protocol type',
  'PluginForm.plugin.syslog.property.max_retry_times': 'number of retries',
  'PluginForm.plugin.syslog.property.retry_interval': 'retry interval(milliseconds)',
  'PluginForm.plugin.syslog.property.pool_size': 'connection pool size',

  'PluginForm.plugin.tcp-logger.desc': 'relate to the TCP log server',
  'PluginForm.plugin.tcp-logger.property.host': 'log server address',
  'PluginForm.plugin.tcp-logger.property.port': 'log server port',
  'PluginForm.plugin.tcp-logger.property.timeout': 'timeout',
  'PluginForm.plugin.tcp-logger.property.tls': 'open SSL',
  'PluginForm.plugin.tcp-logger.property.tls_options': 'TLS selection',

  'PluginForm.plugin.udp-logger.desc': 'relate to the UDP log server',
  'PluginForm.plugin.udp-logger.property.host': 'log server address',
  'PluginForm.plugin.udp-logger.property.port': 'log server port',
  'PluginForm.plugin.udp-logger.property.timeout': 'timeout',

  'PluginForm.plugin.zipkin.desc': 'relate to zipkin',
  'PluginForm.plugin.zipkin.property.endpoint': 'endpoint',
  'PluginForm.plugin.zipkin.property.endpoint.extra': 'For example: http://127.0.0.1:9411/api/v2/spans',
  'PluginForm.plugin.zipkin.property.sample_ratio': 'sampling rate',
  'PluginForm.plugin.zipkin.property.service_name': 'service name',
  'PluginForm.plugin.zipkin.property.server_addr': 'gateway instance IP',
  'PluginForm.plugin.zipkin.property.server_addr.extra': 'default value is Nginx variable server_addr',

  'PluginForm.plugin.skywalking.desc': 'relate to Apache Skywalking',
  'PluginForm.plugin.skywalking.property.endpoint': 'endpoint',
  'PluginForm.plugin.skywalking.property.endpoint.extra': 'For example: http://127.0.0.1:12800',
  'PluginForm.plugin.skywalking.property.sample_ratio': 'sampling rate',
  'PluginForm.plugin.skywalking.property.service_name': 'service name',

  'PluginForm.plugin.serverless-pre-function.desc': 'Runs the specified Lua function at the beginning of the specified phase',
  'PluginForm.plugin.serverless-pre-function.property.phase': 'run phase',
  'PluginForm.plugin.serverless-pre-function.property.functions': 'the set of functions to run',

  'PluginForm.plugin.serverless-post-function.desc': 'Runs the specified Lua function at the ending of the specified phase',
  'PluginForm.plugin.serverless-post-function.property.phase': 'run phase',
  'PluginForm.plugin.serverless-post-function.property.functions': 'the set of functions to run',

  'PluginForm.plugin.basic-auth.desc': 'basic auth plugin',
  'PluginForm.plugin.jwt-auth.desc': 'JWT authentication plugin',
  'PluginForm.plugin.key-auth.desc': 'key auth plugin',
  'PluginForm.plugin.wolf-rbac.desc': 'relate to wolf RBAC service',
  'PluginForm.plugin.openid-connect.desc': 'Open ID Connect(OIDC) plugin provide the ability to deal with external certification services插件提供对接外部认证服务的能力',

  'PluginForm.plugin.redirect.desc': 'redirect plugin',
  'PluginForm.plugin.proxy-rewrite.desc': 'proxy rewrite plugin, which can rewrite client request',
  'PluginForm.plugin.mqtt-proxy.desc':
    'mqtt-proxy plugin can achieve load balancing based on client_id of MQTT',
  'PluginForm.plugin.grpc-transcoding.desc':
    'gRPC transform plugin can achieve HTTP(s) -> APISIX -> gRPC server',
  'PluginForm.plugin.batch-requests.desc':
    'batch-requests plugin can accept multiple requests at one time and initiate mutiple HTTP requests in the way of HTTP pipeline, merge the resules and return to client, which can significantly improve the request performance when the client needs to access multiple interfaces',

  'PluginForm.plugin.node-status.desc': 'node-status',
};