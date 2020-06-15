export default {
  'PluginForm.plugin.basic-auth.desc':
    'basic auth 插件',
  'PluginForm.plugin.batch-requests.desc':
    'batch-requests 插件可以一次接受多个请求并以 http pipeline 的方式在网关发起多个 http 请求，合并结果后再返回客户端，这在客户端需要访问多个接口时可以显著地提升请求性能。',
  'PluginForm.plugin.cors.desc': 'CORS 插件可以为服务端启用 CORS 的返回头。',
  'PluginForm.plugin.fault-injection.desc':
    '故障注入插件，用来模拟各种后端故障和高延迟。',
  'PluginForm.plugin.grpc-transcoding.desc': 'gRPC 转换插件，实现 HTTP(s) -> APISIX -> gRPC server 的转换',
  'PluginForm.plugin.http-logger.desc':
    'http-logger 可以将日志数据请求推送到 HTTP/HTTPS 服务器。',
  'PluginForm.plugin.ip-restriction.desc':
    'ip-restriction 可以把一批 IP 地址列入白名单或黑名单（二选一），时间复杂度是O(1)，并支持用 CIDR 来表示 IP 范围。',
  'PluginForm.plugin.jwt-auth.desc':
    'JWT 认证插件',
  'PluginForm.plugin.kafka-logger.desc':
    '把接口请求日志以 JSON 的形式推送给外部 Kafka 集群',
  'PluginForm.plugin.key-auth.desc':
    'key auth 插件',

  'PluginForm.plugin.limit-conn.desc': '限制并发连接数',
  'PluginForm.plugin.limit-conn.property.conn': 'conn',
  'PluginForm.plugin.limit-conn.property.conn.extra': '最大并发连接数',
  'PluginForm.plugin.limit-conn.property.burst': 'burst',
  'PluginForm.plugin.limit-conn.property.burst.extra': '并发连接数超过 conn，但是低于 conn + burst 时，请求将被延迟处理',
  'PluginForm.plugin.limit-conn.property.default_conn_delay': '延迟时间',
  'PluginForm.plugin.limit-conn.property.default_conn_delay.extra': '被延迟处理的请求，需要等待多少秒',
  'PluginForm.plugin.limit-conn.property.key': 'key',
  'PluginForm.plugin.limit-conn.property.key.extra': '用来做限制的依据',
  'PluginForm.plugin.limit-conn.property.rejected_code': '拒绝状态码',
  'PluginForm.plugin.limit-conn.property.rejected_code.extra': '当并发连接数超过 conn + burst 的限制时，返回给终端的 HTTP 状态码',

  'PluginForm.plugin.limit-count.desc':
    '在指定的时间范围内，限制总的请求次数。',
  'PluginForm.plugin.limit-count.property.count': '总请求次数',
  'PluginForm.plugin.limit-count.property.count.extra': '指定时间窗口内的请求数量阈值',
  'PluginForm.plugin.limit-count.property.time_window': '时间窗口',
  'PluginForm.plugin.limit-count.property.time_window.extra':
    '时间窗口的大小（以秒为单位），超过这个时间，总请求次数就会重置',
  'PluginForm.plugin.limit-count.property.key': 'key',
  'PluginForm.plugin.limit-count.property.key.extra': '用来做请求计数的依据',
  'PluginForm.plugin.limit-count.property.rejected_code': '拒绝状态码',
  'PluginForm.plugin.limit-count.property.rejected_code.extra':
    '当请求超过阈值时，返回给终端的 HTTP 状态码。',
  'PluginForm.plugin.limit-count.property.policy': '策略',
  'PluginForm.plugin.limit-count.property.redis_host': '地址',
  'PluginForm.plugin.limit-count.property.redis_host.extra': '用于集群限流的 Redis 节点地址',
  'PluginForm.plugin.limit-count.property.redis_port': '端口',
  'PluginForm.plugin.limit-count.property.redis_password': '密码',
  'PluginForm.plugin.limit-count.property.redis_timeout': '超时时间（毫秒）',

  'PluginForm.plugin.limit-req.desc': '限制请求速度的插件，基于漏桶算法。',
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
    'mqtt-proxy 只工作在流模式，它可以帮助你根据 MQTT 的 client_id 实现动态负载均衡。',
  'PluginForm.plugin.oauth.desc':
    'The OAuth 2 / Open ID Connect(OIDC) plugin provides authentication and introspection capability to APISIX.',
  'PluginForm.plugin.prometheus.desc': '此插件是提供符合prometheus数据格式的监控指标数据。',
  'PluginForm.plugin.proxy-cache.desc':
    '代理缓存插件，该插件提供缓存后端响应数据的能力，它可以和其他插件一起使用。',
  'PluginForm.plugin.proxy-mirror.desc': '代理镜像插件，该插件提供了镜像客户端请求的能力。',
  'PluginForm.plugin.proxy-rewrite.desc': '上游代理信息重写插件。',
  'PluginForm.plugin.redirect.desc': 'URI 重定向插件。',
  'PluginForm.plugin.response-rewrite.desc': '该插件支持修改上游服务返回的 body 和 header 信息。',
  'PluginForm.plugin.serverless.desc':
    'serverless 的插件有两个，分别是 serverless-pre-function 和 serverless-post-function， 前者会在指定阶段的最开始运行，后者是在指定阶段的最后运行。',
  'PluginForm.plugin.syslog.desc': 'sys 是一个将Log data请求推送到Syslog的插件。',
  'PluginForm.plugin.tcp-logger.desc': 'tcp-logger 是用于将日志数据发送到TCP服务的插件。',
  'PluginForm.plugin.udp-logger.desc': 'udp-logger 是用于将日志数据发送到UDP服务的插件。',
  'PluginForm.plugin.wolf-rbac.desc':
    'wolf-rbac 是一个认证及授权(rbac)插件，它需要与 consumer 一起配合才能工作。',
  'PluginForm.plugin.zipkin.desc': 'zipkin 是一个开源的服务跟踪插件。',
  'PluginForm.plugin.node-status.desc': '暂无描述',
  'PluginForm.plugin.serverless-pre-function.desc': '属于 serverless，会在指定阶段最开始运行。',
  'PluginForm.plugin.serverless-post-function.desc': '属于 serverless，会在指定阶段最后运行。',
  'PluginForm.plugin.openid-connect.desc': '暂无描述。',
  'PluginForm.plugin.heartbeat.desc': '暂无描述',
};
