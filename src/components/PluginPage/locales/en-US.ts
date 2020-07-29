export default {
  'PluginPage.plugin.limit-conn.desc': 'Limit the number of concurrent connections',
  'PluginPage.plugin.limit-conn.property.conn': 'conn',
  'PluginPage.plugin.limit-conn.property.conn.extra': 'Maximum number of concurrent connections',
  'PluginPage.plugin.limit-conn.property.burst': 'burst',
  'PluginPage.plugin.limit-conn.property.burst.extra':
    'When the number of concurrent connections more than conn but less than burst, the request will be delayed',
  'PluginPage.plugin.limit-conn.property.default_conn_delay': 'delay time',
  'PluginPage.plugin.limit-conn.property.default_conn_delay.extra':
    'Waiting time(seconds) for requests being delayed',
  'PluginPage.plugin.limit-conn.property.key': 'key',
  'PluginPage.plugin.limit-conn.property.key.extra': 'Basis of restriction',
  'PluginPage.plugin.limit-conn.property.rejected_code': 'Reject status code',
  'PluginPage.plugin.limit-conn.property.rejected_code.extra':
    'When the number of concurrent connections more than conn + burst, HTTP status code will be returned to the terminal',

  'PluginPage.plugin.limit-count.desc': 'Limit the total requests within the specified time range',
  'PluginPage.plugin.limit-count.property.count': 'Total requests',
  'PluginPage.plugin.limit-count.property.count.extra': 'Threshold for the number of requests within a specified time window',
  'PluginPage.plugin.limit-count.property.time_window': 'Time window',
  'PluginPage.plugin.limit-count.property.time_window.extra':
    'When the size of time window(seconds) is exceeded, the total number of requests will be reset',
  'PluginPage.plugin.limit-count.property.key': 'key',
  'PluginPage.plugin.limit-count.property.key.extra': 'Basis of request count',
  'PluginPage.plugin.limit-count.property.rejected_code': 'Reject status code',
  'PluginPage.plugin.limit-count.property.rejected_code.extra':
    'When the requests exceed threshold, HTTP status code will be returned to the terminal',
  'PluginPage.plugin.limit-count.property.policy': 'policy',
  'PluginPage.plugin.limit-count.property.redis_host': 'host address',
  'PluginPage.plugin.limit-count.property.redis_host.extra': 'Redis node address for cluster flow limited',
  'PluginPage.plugin.limit-count.property.redis_port': 'port',
  'PluginPage.plugin.limit-count.property.redis_password': 'password',
  'PluginPage.plugin.limit-count.property.redis_timeout': 'timeout(millisecond)',

  'PluginPage.plugin.limit-req.desc': 'A plugin which is base leaky bucket algorithm to limit the speed of requests',
  'PluginPage.plugin.limit-req.property.rate': 'rate',
  'PluginPage.plugin.limit-req.property.rate.extra': 'Request rate per second',
  'PluginPage.plugin.limit-req.property.burst': 'burst',
  'PluginPage.plugin.limit-req.property.burst.extra':
    'When request rate per second exceed date but blow rate + burst, the request will be delayed',
  'PluginPage.plugin.limit-req.property.key': 'key',
  'PluginPage.plugin.limit-req.property.key.extra': 'Basis of request count',
  'PluginPage.plugin.limit-req.property.rejected_code': 'Reject status code',
  'PluginPage.plugin.limit-req.property.rejected_code.extra':
    'When the rate exceed rate + burst, HTTP status code will be returned to the terminal',

  'PluginPage.plugin.cors.desc': 'The CORS plugin can enable the return header of CORS for the server',
  'PluginPage.plugin.cors.property.allow_origins': 'The origin which allow cross-domain access',
  'PluginPage.plugin.cors.property.allow_origins.extra': 'For example: https://somehost.com:8081',
  'PluginPage.plugin.cors.property.allow_methods': 'The method which allow cross-domain access',

  'PluginPage.plugin.fault-injection.desc': 'Fault-injection plugin used to simulate various backend failures and high latency',
  'PluginPage.plugin.fault-injection.property.http_status': 'HTTP status code',
  'PluginPage.plugin.fault-injection.property.body': 'response body',
  'PluginPage.plugin.fault-injection.property.duration': 'delay time(seconds)',

  'PluginPage.plugin.http-logger.desc': 'http-logger can push log data requests to the HTTP/HTTPS server',
  'PluginPage.plugin.http-logger.property.uri': 'log server address',
  'PluginPage.plugin.http-logger.property.uri.extra': 'For example: 127.0.0.1:80/postendpoint?param=1',

  'PluginPage.plugin.ip-restriction.desc':
    'IP-restriction can add a batch of IP addresses in whitelist or blacklist(either), time complexity is O(1), and can use CIDR to represent IP range',
  'PluginPage.plugin.ip-restriction.property.whitelist': 'whitelist',
  'PluginPage.plugin.ip-restriction.property.blacklist': 'blacklist',

  'PluginPage.plugin.kafka-logger.desc': 'Push the interface request logs as JSON to the external Kafka clusters',
  'PluginPage.plugin.kafka-logger.property.broker_list': 'broker',
  'PluginPage.plugin.kafka-logger.property.kafka_topic': 'topic',

  'PluginPage.plugin.prometheus.desc': 'Provide metrics data which is accord with prometheus data formate',

  'PluginPage.plugin.proxy-cache.desc': 'Proxy-cache plugin can cache the response data of the backend service',
  'PluginPage.plugin.proxy-cache.property.cache_zone': 'cache area name',
  'PluginPage.plugin.proxy-cache.property.cache_zone.extra':
    'The local directory is /TMP/{area name}, when modify the default area name, config.yaml must be modified too',
  'PluginPage.plugin.proxy-cache.property.cache_key': 'cache key',
  'PluginPage.plugin.proxy-cache.property.cache_key.extra':
    'can use Nginx variables, for example: $host, $uri',
  'PluginPage.plugin.proxy-cache.property.cache_bypass': 'skip cache retrieval',
  'PluginPage.plugin.proxy-cache.property.cache_bypass.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will skip cache retrieval',
  'PluginPage.plugin.proxy-cache.property.cache_method': 'cache Method',
  'PluginPage.plugin.proxy-cache.property.cache_http_status': 'cache the response status code',
  'PluginPage.plugin.proxy-cache.property.hide_cache_headers': 'hidden cache header',
  'PluginPage.plugin.proxy-cache.property.hide_cache_headers.extra':
    'Whether to return Expires and Cache-Control response headers to the client',
  'PluginPage.plugin.proxy-cache.property.no_cache': 'uncached data',
  'PluginPage.plugin.proxy-cache.property.no_cache.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will not be cached',

  'PluginPage.plugin.proxy-mirror.desc': 'Proxy-mirror plugin provides the ability to mirror client',
  'PluginPage.plugin.proxy-mirror.property.host': 'mirror service address',
  'PluginPage.plugin.proxy-mirror.property.host.extra':
    'For example: http://127.0.0.1:9797. Address need to include HTTP or HTTPS but not include the URI part',

  'PluginPage.plugin.response-rewrite.desc': 'The plugin supports modifying the body and header information returned by the upstream service',
  'PluginPage.plugin.response-rewrite.property.status_code': 'status code',
  'PluginPage.plugin.response-rewrite.property.body': 'response body',
  'PluginPage.plugin.response-rewrite.property.body_base64': 'Whether the response body requires base64 decoding',
  'PluginPage.plugin.response-rewrite.property.headers': 'HTTP header',

  'PluginPage.plugin.syslog.desc': 'Relate to the syslog log server',
  'PluginPage.plugin.syslog.property.host': 'log server address',
  'PluginPage.plugin.syslog.property.port': 'log server port',
  'PluginPage.plugin.syslog.property.timeout': 'timeout',
  'PluginPage.plugin.syslog.property.tls': 'open SSL',
  'PluginPage.plugin.syslog.property.flush_limit': 'cache size',
  'PluginPage.plugin.syslog.property.sock_type': 'protocol type',
  'PluginPage.plugin.syslog.property.max_retry_times': 'number of retries',
  'PluginPage.plugin.syslog.property.retry_interval': 'retry interval(milliseconds)',
  'PluginPage.plugin.syslog.property.pool_size': 'connection pool size',

  'PluginPage.plugin.tcp-logger.desc': 'Relate to the TCP log server',
  'PluginPage.plugin.tcp-logger.property.host': 'log server address',
  'PluginPage.plugin.tcp-logger.property.port': 'log server port',
  'PluginPage.plugin.tcp-logger.property.timeout': 'timeout',
  'PluginPage.plugin.tcp-logger.property.tls': 'open SSL',
  'PluginPage.plugin.tcp-logger.property.tls_options': 'TLS selection',

  'PluginPage.plugin.udp-logger.desc': 'Relate to the UDP log server',
  'PluginPage.plugin.udp-logger.property.host': 'log server address',
  'PluginPage.plugin.udp-logger.property.port': 'log server port',
  'PluginPage.plugin.udp-logger.property.timeout': 'timeout',

  'PluginPage.plugin.zipkin.desc': 'Relate to zipkin',
  'PluginPage.plugin.zipkin.property.endpoint': 'endpoint',
  'PluginPage.plugin.zipkin.property.endpoint.extra': 'For example: http://127.0.0.1:9411/api/v2/spans',
  'PluginPage.plugin.zipkin.property.sample_ratio': 'sampling rate',
  'PluginPage.plugin.zipkin.property.service_name': 'service name',
  'PluginPage.plugin.zipkin.property.server_addr': 'gateway instance IP',
  'PluginPage.plugin.zipkin.property.server_addr.extra': 'default value is Nginx variable server_addr',

  'PluginPage.plugin.skywalking.desc': 'Relate to Apache Skywalking',
  'PluginPage.plugin.skywalking.property.endpoint': 'endpoint',
  'PluginPage.plugin.skywalking.property.endpoint.extra': 'For example: http://127.0.0.1:12800',
  'PluginPage.plugin.skywalking.property.sample_ratio': 'sampling rate',
  'PluginPage.plugin.skywalking.property.service_name': 'service name',

  'PluginPage.plugin.serverless-pre-function.desc': 'Runs the specified Lua function at the beginning of the specified phase',
  'PluginPage.plugin.serverless-pre-function.property.phase': 'run phase',
  'PluginPage.plugin.serverless-pre-function.property.functions': 'the set of functions to run',

  'PluginPage.plugin.serverless-post-function.desc': 'Runs the specified Lua function at the ending of the specified phase',
  'PluginPage.plugin.serverless-post-function.property.phase': 'run phase',
  'PluginPage.plugin.serverless-post-function.property.functions': 'the set of functions to run',

  'PluginPage.plugin.basic-auth.desc': 'basic auth plugin',
  'PluginPage.plugin.jwt-auth.desc': 'JWT authentication plugin',
  'PluginPage.plugin.key-auth.desc': 'key auth plugin',
  'PluginPage.plugin.wolf-rbac.desc': 'Relate to wolf RBAC service',
  'PluginPage.plugin.openid-connect.desc': 'Open ID Connect(OIDC) plugin provide the ability to deal with external certification services',

  'PluginPage.plugin.redirect.desc': 'redirect plugin',
  'PluginPage.plugin.proxy-rewrite.desc': 'proxy rewrite plugin, which can rewrite client request',
  'PluginPage.plugin.mqtt-proxy.desc':
    'mqtt-proxy plugin can achieve load balancing based on client_id of MQTT',
  'PluginPage.plugin.grpc-transcoding.desc':
    'gRPC transform plugin can achieve HTTP(s) -> APISIX -> gRPC server',
  'PluginPage.plugin.batch-requests.desc':
    'batch-requests plugin can accept multiple requests at one time and initiate mutiple HTTP requests in the way of HTTP pipeline, merge the resules and return to client, which can significantly improve the request performance when the client needs to access multiple interfaces',

  'PluginPage.plugin.node-status.desc': 'node-status',

  'PluginPage.refer.documents':'Please refer to the official documents',
  
  'PluginPage.drawer.configure.plugin':'Configure plugin',
  'PluginPage.drawer.disabled':'Disabled',
  'PluginPage.drawer.enable':'Enable',
  'PluginPage.drawer.confirm':'Confirm',
  'PluginPage.drawer.is.enabled':'Is Enabled',
  'PluginPage.drawer.not.enabled':'Not Enabled',
};