export default {
  'PluginForm.plugin.basic-auth.desc':
    'basic-auth 是一个认证插件，它需要与 consumer 一起配合才能工作。',
  'PluginForm.plugin.batch-requests.desc':
    'batch-requests 插件可以一次接受多个请求并以 http pipeline 的方式在网关发起多个http请求，合并结果后再返回客户端，这在客户端需要访问多个接口时可以显著地提升请求性能。',
  'PluginForm.plugin.cors.desc': 'cors 插件可以让你轻易地为服务端启用 CORS 的返回头。',
  'PluginForm.plugin.fault-injection.desc':
    '故障注入插件，该插件可以和其他插件一起使用，并且会在其他插件前被执行，配置 abort 参数将直接返回给客户端指定的响应码并且终止其他插件的执行，配置 delay 参数将延迟某个请求，并且还会执行配置的其他插件。',
  'PluginForm.plugin.grpc-transcoding.desc': 'HTTP(s) -> APISIX -> gRPC server',
  'PluginForm.plugin.http-logger.desc':
    'http-logger 是一个插件，可将Log数据请求推送到HTTP / HTTPS服务器。',
  'PluginForm.plugin.ip-restriction.desc':
    'ip-restriction 可以通过以下方式限制对服务或路线的访问，将 IP 地址列入白名单或黑名单。 单个 IP 地址，多个 IP地址 或 CIDR 范围，可以使用类似 10.10.10.0/24 的 CIDR 表示法(将很快支持 IPv6)。',
  'PluginForm.plugin.jwt-auth.desc':
    'jwt-auth 是一个认证插件，它需要与 consumer 一起配合才能工作。',
  'PluginForm.plugin.kafka-logger.desc':
    'kafka-logger 是一个插件，可用作ngx_lua nginx 模块的 Kafka 客户端驱动程序。',
  'PluginForm.plugin.key-auth.desc':
    'key-auth 是一个认证插件，它需要与 consumer 一起配合才能工作。',

  'PluginForm.plugin.limit-conn.desc': 'APISIX 的限制并发请求（或并发连接）插件。',
  'PluginForm.plugin.limit-conn.property.burst': '最大并发请求数',
  'PluginForm.plugin.limit-conn.property.burst.extra': '允许的最大并发请求数',
  'PluginForm.plugin.limit-conn.property.conn': '可延迟并发请求数',
  'PluginForm.plugin.limit-conn.property.conn.extra': '允许延迟的过多并发请求(或连接)的数量。',
  'PluginForm.plugin.limit-conn.property.default_conn_delay': '默认请求延迟时间',
  'PluginForm.plugin.limit-conn.property.default_conn_delay.extra':
    '默认的典型连接(或请求)的处理延迟时间。',
  'PluginForm.plugin.limit-conn.property.key': '关键字',
  'PluginForm.plugin.limit-conn.property.key.extra':
    '用户指定的限制并发级别的关键字，可以是客户端IP或服务端IP。',
  'PluginForm.plugin.limit-conn.property.rejected_code': '错误 HTTP 状态码',
  'PluginForm.plugin.limit-conn.property.rejected_code.extra':
    '当请求超过阈值时返回的 HTTP 状态码， 默认值是503。',

  'PluginForm.plugin.limit-count.desc':
    '和 GitHub API 的限速类似， 在指定的时间范围内，限制总的请求个数。并且在 HTTP 响应头中返回剩余可以请求的个数。',
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

  'PluginForm.plugin.limit-req.desc': '限制请求速度的插件，使用的是漏桶算法。',
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
