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
  'PluginForm.plugin.limit-count.desc':
    '和 GitHub API 的限速类似， 在指定的时间范围内，限制总的请求个数。并且在 HTTP 响应头中返回剩余可以请求的个数。',
  'PluginForm.plugin.limit-req.desc': '限制请求速度的插件，使用的是漏桶算法。',
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
};
