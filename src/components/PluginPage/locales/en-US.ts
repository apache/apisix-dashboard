export default {
  'PluginPage.card.limit-conn.desc': 'Limit the number of concurrent connections',
  'PluginPage.card.limit-conn.property.conn': 'conn',
  'PluginPage.card.limit-conn.property.conn.extra': 'Maximum number of concurrent connections',
  'PluginPage.card.limit-conn.property.burst': 'burst',
  'PluginPage.card.limit-conn.property.burst.extra':
    'When the number of concurrent connections more than conn but less than burst, the request will be delayed',
  'PluginPage.card.limit-conn.property.default_conn_delay': 'delay time',
  'PluginPage.card.limit-conn.property.default_conn_delay.extra':
    'Waiting time(seconds) for requests being delayed',
  'PluginPage.card.limit-conn.property.key': 'key',
  'PluginPage.card.limit-conn.property.key.extra': 'Basis of restriction',
  'PluginPage.card.limit-conn.property.rejected_code': 'Reject status code',
  'PluginPage.card.limit-conn.property.rejected_code.extra':
    'When the number of concurrent connections more than conn + burst, HTTP status code will be returned to the terminal',

  'PluginPage.card.limit-count.desc': 'Limit the total requests within the specified time range',
  'PluginPage.card.limit-count.property.count': 'Total requests',
  'PluginPage.card.limit-count.property.count.extra': 'Threshold for the number of requests within a specified time window',
  'PluginPage.card.limit-count.property.time_window': 'Time window',
  'PluginPage.card.limit-count.property.time_window.extra':
    'When the size of time window(seconds) is exceeded, the total number of requests will be reset',
  'PluginPage.card.limit-count.property.key': 'key',
  'PluginPage.card.limit-count.property.key.extra': 'Basis of request count',
  'PluginPage.card.limit-count.property.rejected_code': 'Reject status code',
  'PluginPage.card.limit-count.property.rejected_code.extra':
    'When the requests exceed threshold, HTTP status code will be returned to the terminal',
  'PluginPage.card.limit-count.property.policy': 'policy',
  'PluginPage.card.limit-count.property.redis_host': 'host address',
  'PluginPage.card.limit-count.property.redis_host.extra': 'Redis node address for cluster flow limited',
  'PluginPage.card.limit-count.property.redis_port': 'port',
  'PluginPage.card.limit-count.property.redis_password': 'password',
  'PluginPage.card.limit-count.property.redis_timeout': 'timeout(millisecond)',

  'PluginPage.card.limit-req.desc': 'A plugin which is base leaky bucket algorithm to limit the speed of requests',
  'PluginPage.card.limit-req.property.rate': 'rate',
  'PluginPage.card.limit-req.property.rate.extra': 'Request rate per second',
  'PluginPage.card.limit-req.property.burst': 'burst',
  'PluginPage.card.limit-req.property.burst.extra':
    'When request rate per second exceed date but blow rate + burst, the request will be delayed',
  'PluginPage.card.limit-req.property.key': 'key',
  'PluginPage.card.limit-req.property.key.extra': 'Basis of request count',
  'PluginPage.card.limit-req.property.rejected_code': 'Reject status code',
  'PluginPage.card.limit-req.property.rejected_code.extra':
    'When the rate exceed rate + burst, HTTP status code will be returned to the terminal',

  'PluginPage.card.cors.desc': 'The CORS plugin can enable the return header of CORS for the server',
  'PluginPage.card.cors.property.allow_origins': 'The origin which allow cross-domain access',
  'PluginPage.card.cors.property.allow_origins.extra': 'For example: https://somehost.com:8081',
  'PluginPage.card.cors.property.allow_methods': 'The method which allow cross-domain access',

  'PluginPage.card.fault-injection.desc': 'Fault-injection plugin used to simulate various backend failures and high latency',
  'PluginPage.card.fault-injection.property.http_status': 'HTTP status code',
  'PluginPage.card.fault-injection.property.body': 'response body',
  'PluginPage.card.fault-injection.property.duration': 'delay time(seconds)',

  'PluginPage.card.http-logger.desc': 'http-logger can push log data requests to the HTTP/HTTPS server',
  'PluginPage.card.http-logger.property.uri': 'log server address',
  'PluginPage.card.http-logger.property.uri.extra': 'For example: 127.0.0.1:80/postendpoint?param=1',

  'PluginPage.card.ip-restriction.desc':
    'IP-restriction can add a batch of IP addresses in whitelist or blacklist(either), time complexity is O(1), and can use CIDR to represent IP range',
  'PluginPage.card.ip-restriction.property.whitelist': 'whitelist',
  'PluginPage.card.ip-restriction.property.blacklist': 'blacklist',

  'PluginPage.card.kafka-logger.desc': 'Push the interface request logs as JSON to the external Kafka clusters',
  'PluginPage.card.kafka-logger.property.broker_list': 'broker',
  'PluginPage.card.kafka-logger.property.kafka_topic': 'topic',

  'PluginPage.card.prometheus.desc': 'Provide metrics data which is accord with prometheus data formate',

  'PluginPage.card.proxy-cache.desc': 'Proxy-cache plugin can cache the response data of the backend service',
  'PluginPage.card.proxy-cache.property.cache_zone': 'cache area name',
  'PluginPage.card.proxy-cache.property.cache_zone.extra':
    'The local directory is /TMP/{area name}, when modify the default area name, config.yaml must be modified too',
  'PluginPage.card.proxy-cache.property.cache_key': 'cache key',
  'PluginPage.card.proxy-cache.property.cache_key.extra':
    'can use Nginx variables, for example: $host, $uri',
  'PluginPage.card.proxy-cache.property.cache_bypass': 'skip cache retrieval',
  'PluginPage.card.proxy-cache.property.cache_bypass.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will skip cache retrieval',
  'PluginPage.card.proxy-cache.property.cache_method': 'cache Method',
  'PluginPage.card.proxy-cache.property.cache_http_status': 'cache the response status code',
  'PluginPage.card.proxy-cache.property.hide_cache_headers': 'hidden cache header',
  'PluginPage.card.proxy-cache.property.hide_cache_headers.extra':
    'Whether to return Expires and Cache-Control response headers to the client',
  'PluginPage.card.proxy-cache.property.no_cache': 'uncached data',
  'PluginPage.card.proxy-cache.property.no_cache.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will not be cached',

  'PluginPage.card.proxy-mirror.desc': 'Proxy-mirror plugin provides the ability to mirror client',
  'PluginPage.card.proxy-mirror.property.host': 'mirror service address',
  'PluginPage.card.proxy-mirror.property.host.extra':
    'For example: http://127.0.0.1:9797. Address need to include HTTP or HTTPS but not include the URI part',

  'PluginPage.card.response-rewrite.desc': 'The plugin supports modifying the body and header information returned by the upstream service',
  'PluginPage.card.response-rewrite.property.status_code': 'status code',
  'PluginPage.card.response-rewrite.property.body': 'response body',
  'PluginPage.card.response-rewrite.property.body_base64': 'Whether the response body requires base64 decoding',
  'PluginPage.card.response-rewrite.property.headers': 'HTTP header',

  'PluginPage.card.syslog.desc': 'Relate to the syslog log server',
  'PluginPage.card.syslog.property.host': 'log server address',
  'PluginPage.card.syslog.property.port': 'log server port',
  'PluginPage.card.syslog.property.timeout': 'timeout',
  'PluginPage.card.syslog.property.tls': 'open SSL',
  'PluginPage.card.syslog.property.flush_limit': 'cache size',
  'PluginPage.card.syslog.property.sock_type': 'protocol type',
  'PluginPage.card.syslog.property.max_retry_times': 'number of retries',
  'PluginPage.card.syslog.property.retry_interval': 'retry interval(milliseconds)',
  'PluginPage.card.syslog.property.pool_size': 'connection pool size',

  'PluginPage.card.tcp-logger.desc': 'Relate to the TCP log server',
  'PluginPage.card.tcp-logger.property.host': 'log server address',
  'PluginPage.card.tcp-logger.property.port': 'log server port',
  'PluginPage.card.tcp-logger.property.timeout': 'timeout',
  'PluginPage.card.tcp-logger.property.tls': 'open SSL',
  'PluginPage.card.tcp-logger.property.tls_options': 'TLS selection',

  'PluginPage.card.udp-logger.desc': 'Relate to the UDP log server',
  'PluginPage.card.udp-logger.property.host': 'log server address',
  'PluginPage.card.udp-logger.property.port': 'log server port',
  'PluginPage.card.udp-logger.property.timeout': 'timeout',

  'PluginPage.card.zipkin.desc': 'Relate to zipkin',
  'PluginPage.card.zipkin.property.endpoint': 'endpoint',
  'PluginPage.card.zipkin.property.endpoint.extra': 'For example: http://127.0.0.1:9411/api/v2/spans',
  'PluginPage.card.zipkin.property.sample_ratio': 'sampling rate',
  'PluginPage.card.zipkin.property.service_name': 'service name',
  'PluginPage.card.zipkin.property.server_addr': 'gateway instance IP',
  'PluginPage.card.zipkin.property.server_addr.extra': 'default value is Nginx variable server_addr',

  'PluginPage.card.skywalking.desc': 'Relate to Apache Skywalking',
  'PluginPage.card.skywalking.property.endpoint': 'endpoint',
  'PluginPage.card.skywalking.property.endpoint.extra': 'For example: http://127.0.0.1:12800',
  'PluginPage.card.skywalking.property.sample_ratio': 'sampling rate',
  'PluginPage.card.skywalking.property.service_name': 'service name',

  'PluginPage.card.serverless-pre-function.desc': 'Runs the specified Lua function at the beginning of the specified phase',
  'PluginPage.card.serverless-pre-function.property.phase': 'run phase',
  'PluginPage.card.serverless-pre-function.property.functions': 'the set of functions to run',

  'PluginPage.card.serverless-post-function.desc': 'Runs the specified Lua function at the ending of the specified phase',
  'PluginPage.card.serverless-post-function.property.phase': 'run phase',
  'PluginPage.card.serverless-post-function.property.functions': 'the set of functions to run',

  'PluginPage.card.basic-auth.desc': 'basic auth plugin',
  'PluginPage.card.jwt-auth.desc': 'JWT authentication plugin',
  'PluginPage.card.key-auth.desc': 'key auth plugin',
  'PluginPage.card.wolf-rbac.desc': 'Relate to wolf RBAC service',
  'PluginPage.card.openid-connect.desc': 'Open ID Connect(OIDC) plugin provide the ability to deal with external certification services',

  'PluginPage.card.redirect.desc': 'redirect plugin',
  'PluginPage.card.proxy-rewrite.desc': 'proxy rewrite plugin, which can rewrite client request',
  'PluginPage.card.mqtt-proxy.desc':
    'mqtt-proxy plugin can achieve load balancing based on client_id of MQTT',
  'PluginPage.card.grpc-transcoding.desc':
    'gRPC transform plugin can achieve HTTP(s) -> APISIX -> gRPC server',
  'PluginPage.card.batch-requests.desc':
    'batch-requests plugin can accept multiple requests at one time and initiate mutiple HTTP requests in the way of HTTP pipeline, merge the resules and return to client, which can significantly improve the request performance when the client needs to access multiple interfaces',

  'PluginPage.card.node-status.desc': 'node-status',
  'PluginPage.card.refer.documents':'Please refer to the official documents',
  
  'PluginPage.drawer.configure.plugin':'Configure plugin',
  'PluginPage.drawer.disabled':'Disabled',
  'PluginPage.drawer.enable':'Enable',
  'PluginPage.drawer.cancel':'Cancel',
  'PluginPage.drawer.confirm':'Confirm',
  'PluginPage.drawer.is.enabled':'Is Enabled',
  'PluginPage.drawer.not.enabled':'Not Enabled',
};