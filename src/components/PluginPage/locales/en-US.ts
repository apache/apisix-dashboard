export default {
  'pluginpage.plugin.limit-conn.desc': 'Limit the number of concurrent connections',
  'pluginpage.plugin.limit-conn.property.conn': 'conn',
  'pluginpage.plugin.limit-conn.property.conn.extra': 'Maximum number of concurrent connections',
  'pluginpage.plugin.limit-conn.property.burst': 'burst',
  'pluginpage.plugin.limit-conn.property.burst.extra':
    'When the number of concurrent connections more than conn but less than burst, the request will be delayed',
  'pluginpage.plugin.limit-conn.property.default_conn_delay': 'delay time',
  'pluginpage.plugin.limit-conn.property.default_conn_delay.extra':
    'Waiting time(seconds) for requests being delayed',
  'pluginpage.plugin.limit-conn.property.key': 'key',
  'pluginpage.plugin.limit-conn.property.key.extra': 'Basis of restriction',
  'pluginpage.plugin.limit-conn.property.rejected_code': 'Reject status code',
  'pluginpage.plugin.limit-conn.property.rejected_code.extra':
    'When the number of concurrent connections more than conn + burst, HTTP status code will be returned to the terminal',

  'pluginpage.plugin.limit-count.desc': 'Limit the total requests within the specified time range',
  'pluginpage.plugin.limit-count.property.count': 'Total requests',
  'pluginpage.plugin.limit-count.property.count.extra': 'Threshold for the number of requests within a specified time window',
  'pluginpage.plugin.limit-count.property.time_window': 'Time window',
  'pluginpage.plugin.limit-count.property.time_window.extra':
    'When the size of time window(seconds) is exceeded, the total number of requests will be reset',
  'pluginpage.plugin.limit-count.property.key': 'key',
  'pluginpage.plugin.limit-count.property.key.extra': 'Basis of request count',
  'pluginpage.plugin.limit-count.property.rejected_code': 'Reject status code',
  'pluginpage.plugin.limit-count.property.rejected_code.extra':
    'When the requests exceed threshold, HTTP status code will be returned to the terminal',
  'pluginpage.plugin.limit-count.property.policy': 'policy',
  'pluginpage.plugin.limit-count.property.redis_host': 'host address',
  'pluginpage.plugin.limit-count.property.redis_host.extra': 'Redis node address for cluster flow limited',
  'pluginpage.plugin.limit-count.property.redis_port': 'port',
  'pluginpage.plugin.limit-count.property.redis_password': 'password',
  'pluginpage.plugin.limit-count.property.redis_timeout': 'timeout(millisecond)',

  'pluginpage.plugin.limit-req.desc': 'A plugin which is base leaky bucket algorithm to limit the speed of requests',
  'pluginpage.plugin.limit-req.property.rate': 'rate',
  'pluginpage.plugin.limit-req.property.rate.extra': 'Request rate per second',
  'pluginpage.plugin.limit-req.property.burst': 'burst',
  'pluginpage.plugin.limit-req.property.burst.extra':
    'When request rate per second exceed date but blow rate + burst, the request will be delayed',
  'pluginpage.plugin.limit-req.property.key': 'key',
  'pluginpage.plugin.limit-req.property.key.extra': 'Basis of request count',
  'pluginpage.plugin.limit-req.property.rejected_code': 'Reject status code',
  'pluginpage.plugin.limit-req.property.rejected_code.extra':
    'When the rate exceed rate + burst, HTTP status code will be returned to the terminal',

  'pluginpage.plugin.cors.desc': 'The CORS plugin can enable the return header of CORS for the server',
  'pluginpage.plugin.cors.property.allow_origins': 'The origin which allow cross-domain access',
  'pluginpage.plugin.cors.property.allow_origins.extra': 'For example: https://somehost.com:8081',
  'pluginpage.plugin.cors.property.allow_methods': 'The method which allow cross-domain access',

  'pluginpage.plugin.fault-injection.desc': 'Fault-injection plugin used to simulate various backend failures and high latency',
  'pluginpage.plugin.fault-injection.property.http_status': 'HTTP status code',
  'pluginpage.plugin.fault-injection.property.body': 'response body',
  'pluginpage.plugin.fault-injection.property.duration': 'delay time(seconds)',

  'pluginpage.plugin.http-logger.desc': 'http-logger can push log data requests to the HTTP/HTTPS server',
  'pluginpage.plugin.http-logger.property.uri': 'log server address',
  'pluginpage.plugin.http-logger.property.uri.extra': 'For example: 127.0.0.1:80/postendpoint?param=1',

  'pluginpage.plugin.ip-restriction.desc':
    'IP-restriction can add a batch of IP addresses in whitelist or blacklist(either), time complexity is O(1), and can use CIDR to represent IP range',
  'pluginpage.plugin.ip-restriction.property.whitelist': 'whitelist',
  'pluginpage.plugin.ip-restriction.property.blacklist': 'blacklist',

  'pluginpage.plugin.kafka-logger.desc': 'Push the interface request logs as JSON to the external Kafka clusters',
  'pluginpage.plugin.kafka-logger.property.broker_list': 'broker',
  'pluginpage.plugin.kafka-logger.property.kafka_topic': 'topic',

  'pluginpage.plugin.prometheus.desc': 'Provide metrics data which is accord with prometheus data formate',

  'pluginpage.plugin.proxy-cache.desc': 'Proxy-cache plugin can cache the response data of the backend service',
  'pluginpage.plugin.proxy-cache.property.cache_zone': 'cache area name',
  'pluginpage.plugin.proxy-cache.property.cache_zone.extra':
    'The local directory is /TMP/{area name}, when modify the default area name, config.yaml must be modified too',
  'pluginpage.plugin.proxy-cache.property.cache_key': 'cache key',
  'pluginpage.plugin.proxy-cache.property.cache_key.extra':
    'can use Nginx variables, for example: $host, $uri',
  'pluginpage.plugin.proxy-cache.property.cache_bypass': 'skip cache retrieval',
  'pluginpage.plugin.proxy-cache.property.cache_bypass.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will skip cache retrieval',
  'pluginpage.plugin.proxy-cache.property.cache_method': 'cache Method',
  'pluginpage.plugin.proxy-cache.property.cache_http_status': 'cache the response status code',
  'pluginpage.plugin.proxy-cache.property.hide_cache_headers': 'hidden cache header',
  'pluginpage.plugin.proxy-cache.property.hide_cache_headers.extra':
    'Whether to return Expires and Cache-Control response headers to the client',
  'pluginpage.plugin.proxy-cache.property.no_cache': 'uncached data',
  'pluginpage.plugin.proxy-cache.property.no_cache.extra':
    'You can use the Nginx variables here, when the value of this parameter is not null or non-zero, it will not be cached',

  'pluginpage.plugin.proxy-mirror.desc': 'Proxy-mirror plugin provides the ability to mirror client',
  'pluginpage.plugin.proxy-mirror.property.host': 'mirror service address',
  'pluginpage.plugin.proxy-mirror.property.host.extra':
    'For example: http://127.0.0.1:9797. Address need to include HTTP or HTTPS but not include the URI part',

  'pluginpage.plugin.response-rewrite.desc': 'The plugin supports modifying the body and header information returned by the upstream service',
  'pluginpage.plugin.response-rewrite.property.status_code': 'status code',
  'pluginpage.plugin.response-rewrite.property.body': 'response body',
  'pluginpage.plugin.response-rewrite.property.body_base64': 'Whether the response body requires base64 decoding',
  'pluginpage.plugin.response-rewrite.property.headers': 'HTTP header',

  'pluginpage.plugin.syslog.desc': 'Relate to the syslog log server',
  'pluginpage.plugin.syslog.property.host': 'log server address',
  'pluginpage.plugin.syslog.property.port': 'log server port',
  'pluginpage.plugin.syslog.property.timeout': 'timeout',
  'pluginpage.plugin.syslog.property.tls': 'open SSL',
  'pluginpage.plugin.syslog.property.flush_limit': 'cache size',
  'pluginpage.plugin.syslog.property.sock_type': 'protocol type',
  'pluginpage.plugin.syslog.property.max_retry_times': 'number of retries',
  'pluginpage.plugin.syslog.property.retry_interval': 'retry interval(milliseconds)',
  'pluginpage.plugin.syslog.property.pool_size': 'connection pool size',

  'pluginpage.plugin.tcp-logger.desc': 'Relate to the TCP log server',
  'pluginpage.plugin.tcp-logger.property.host': 'log server address',
  'pluginpage.plugin.tcp-logger.property.port': 'log server port',
  'pluginpage.plugin.tcp-logger.property.timeout': 'timeout',
  'pluginpage.plugin.tcp-logger.property.tls': 'open SSL',
  'pluginpage.plugin.tcp-logger.property.tls_options': 'TLS selection',

  'pluginpage.plugin.udp-logger.desc': 'Relate to the UDP log server',
  'pluginpage.plugin.udp-logger.property.host': 'log server address',
  'pluginpage.plugin.udp-logger.property.port': 'log server port',
  'pluginpage.plugin.udp-logger.property.timeout': 'timeout',

  'pluginpage.plugin.zipkin.desc': 'Relate to zipkin',
  'pluginpage.plugin.zipkin.property.endpoint': 'endpoint',
  'pluginpage.plugin.zipkin.property.endpoint.extra': 'For example: http://127.0.0.1:9411/api/v2/spans',
  'pluginpage.plugin.zipkin.property.sample_ratio': 'sampling rate',
  'pluginpage.plugin.zipkin.property.service_name': 'service name',
  'pluginpage.plugin.zipkin.property.server_addr': 'gateway instance IP',
  'pluginpage.plugin.zipkin.property.server_addr.extra': 'default value is Nginx variable server_addr',

  'pluginpage.plugin.skywalking.desc': 'Relate to Apache Skywalking',
  'pluginpage.plugin.skywalking.property.endpoint': 'endpoint',
  'pluginpage.plugin.skywalking.property.endpoint.extra': 'For example: http://127.0.0.1:12800',
  'pluginpage.plugin.skywalking.property.sample_ratio': 'sampling rate',
  'pluginpage.plugin.skywalking.property.service_name': 'service name',

  'pluginpage.plugin.serverless-pre-function.desc': 'Runs the specified Lua function at the beginning of the specified phase',
  'pluginpage.plugin.serverless-pre-function.property.phase': 'run phase',
  'pluginpage.plugin.serverless-pre-function.property.functions': 'the set of functions to run',

  'pluginpage.plugin.serverless-post-function.desc': 'Runs the specified Lua function at the ending of the specified phase',
  'pluginpage.plugin.serverless-post-function.property.phase': 'run phase',
  'pluginpage.plugin.serverless-post-function.property.functions': 'the set of functions to run',

  'pluginpage.plugin.basic-auth.desc': 'basic auth plugin',
  'pluginpage.plugin.jwt-auth.desc': 'JWT authentication plugin',
  'pluginpage.plugin.key-auth.desc': 'key auth plugin',
  'pluginpage.plugin.wolf-rbac.desc': 'Relate to wolf RBAC service',
  'pluginpage.plugin.openid-connect.desc': 'Open ID Connect(OIDC) plugin provide the ability to deal with external certification services',

  'pluginpage.plugin.redirect.desc': 'redirect plugin',
  'pluginpage.plugin.proxy-rewrite.desc': 'proxy rewrite plugin, which can rewrite client request',
  'pluginpage.plugin.mqtt-proxy.desc':
    'mqtt-proxy plugin can achieve load balancing based on client_id of MQTT',
  'pluginpage.plugin.grpc-transcoding.desc':
    'gRPC transform plugin can achieve HTTP(s) -> APISIX -> gRPC server',
  'pluginpage.plugin.batch-requests.desc':
    'batch-requests plugin can accept multiple requests at one time and initiate mutiple HTTP requests in the way of HTTP pipeline, merge the resules and return to client, which can significantly improve the request performance when the client needs to access multiple interfaces',

  'pluginpage.plugin.node-status.desc': 'node-status',

  'pluginpage.refer.documents':'Please refer to the official documents',
  
  'pluginpage.drawer.configure.plugin':'Configure plugin',
  'pluginpage.drawer.disabled':'Disabled',
  'pluginpage.drawer.enable':'Enable',
  'pluginpage.drawer.confirm':'Confirm',
  'pluginpage.drawer.is.enabled':'Is Enabled',
  'pluginpage.drawer.not.enabled':'Not Enabled',
};