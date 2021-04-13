export default {
  'component.upstream.fields.tls.client_key': 'Client Key',
  'component.upstream.fields.tls.client_cert': 'Client Cert',

  'component.upstream.fields.checks.active.type': 'Type',
  'component.upstream.fields.checks.active.type.tooltip': 'Whether to perform active health checks using HTTP or HTTPS, or just attempt a TCP connection.',

  'component.upstream.fields.checks.active.concurrency': 'Concurrency',
  'component.upstream.fields.checks.active.concurrency.tooltip': 'Number of targets to check concurrently in active health checks.',

  'component.upstream.fields.checks.active.host': 'Host',
  'component.upstream.fields.checks.active.host.required': 'Please enter the hostname',
  'component.upstream.fields.checks.active.host.tooltip': 'The hostname of the HTTP request used to perform the active health check',
  'component.upstream.fields.checks.active.host.scope': 'Only letters, numbers and . are supported',

  'component.upstream.fields.checks.active.port': 'Port',

  'component.upstream.fields.checks.active.http_path': 'HTTP Path',
  'component.upstream.fields.checks.active.http_path.tooltip': 'The path that should be used when issuing the HTTP GET request to the target. The default value is /.',

  'component.upstream.text.others': 'Others'
}