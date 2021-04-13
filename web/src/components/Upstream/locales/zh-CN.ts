export default {
  'component.upstream.fields.tls.client_key': '客户端私钥',
  'component.upstream.fields.tls.client_cert': '客户端证书',

  'component.upstream.fields.checks.active.type': '类型',
  'component.upstream.fields.checks.active.type.tooltip': '是使用 HTTP 或 HTTPS 进行主动健康检查，还是只尝试 TCP 连接。',

  'component.upstream.fields.checks.active.concurrency': '并行数量',
  'component.upstream.fields.checks.active.concurrency.tooltip': '在主动健康检查中同时检查的目标数量。',

  'component.upstream.fields.checks.active.host': '主机名',
  'component.upstream.fields.checks.active.host.required': '请输入主机名',
  'component.upstream.fields.checks.active.host.tooltip': '进行主动健康检查时使用的 HTTP 请求主机名',
  'component.upstream.fields.checks.active.host.scope': '仅支持字母、数字和 . ',

  'component.upstream.fields.checks.active.port': '端口号',
  'component.upstream.fields.checks.active.port.required': '请输入端口号',

  'component.upstream.fields.checks.active.http_path': '请求路径',
  'component.upstream.fields.checks.active.http_path.tooltip': '向目标节点发出 HTTP GET 请求时应使用的路径。',
  'component.upstream.fields.checks.active.http_path.placeholder': '请输入 HTTP 请求路径',

  'component.upstream.fields.checks.active.https_verify_certificate': '验证证书',
  'component.upstream.fields.checks.active.https_verify_certificate.tooltip': '在使用 HTTPS 执行主动健康检查时，是否检查远程主机的 SSL 证书的有效性。',

  'component.upstream.text.others': '其它'
}