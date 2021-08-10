/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export default {
  'component.upstream.fields.tls.client_key': 'Client Key',
  'component.upstream.fields.tls.client_key.required': 'Please enter the client key',
  'component.upstream.fields.tls.client_cert': 'Client Cert',
  'component.upstream.fields.tls.client_cert.required': 'Please enter the client cert',

  'component.upstream.fields.discovery_type': 'Discovery Type',
  'component.upstream.fields.discovery_type.tooltip': 'Discovery Type',
  'component.upstream.fields.discovery_type.placeholder': 'Please enter the discovery type',

  'component.upstream.fields.service_name': 'Service Name',
  'component.upstream.fields.service_name.tooltip': 'Service Name',
  'component.upstream.fields.service_name.placeholder': 'Please enter the service name',

  'component.upstream.fields.tls': 'TLS',
  'component.upstream.fields.tls.tooltip': 'TLS Certificate',

  'component.upstream.fields.hash_on': 'Hash on',
  'component.upstream.fields.hash_on.tooltip': 'What to use as hashing input',

  'component.upstream.fields.key': 'Key',
  'component.upstream.fields.key.tooltip': 'Key as hashing input',

  'component.upstream.fields.retries': 'Retries',
  'component.upstream.fields.retries.tooltip':
    'The retry mechanism sends the request to the next upstream node. A value of 0 disables the retry mechanism and leaves the table empty to use the number of available backend nodes.',

  'component.upstream.fields.checks.active.type': 'Type',
  'component.upstream.fields.checks.active.type.tooltip':
    'Whether to perform active health checks using HTTP or HTTPS, or just attempt a TCP connection.',

  'component.upstream.fields.checks.active.concurrency': 'Concurrency',
  'component.upstream.fields.checks.active.concurrency.tooltip':
    'Number of targets to check concurrently in active health checks.',

  'component.upstream.fields.checks.active.host': 'Host',
  'component.upstream.fields.checks.active.host.required': 'Please enter the hostname',
  'component.upstream.fields.checks.active.host.tooltip':
    'The hostname of the HTTP request used to perform the active health check',
  'component.upstream.fields.checks.active.host.scope': 'Only letters, numbers and . are supported',

  'component.upstream.fields.checks.active.port': 'Port',

  'component.upstream.fields.checks.active.http_path': 'HTTP Path',
  'component.upstream.fields.checks.active.http_path.tooltip':
    'The path that should be used when issuing the HTTP GET request to the target. The default value is /.',
  'component.upstream.fields.checks.active.http_path.placeholder':
    'Please enter the HTTP request path',

  'component.upstream.fields.checks.active.https_verify_certificate': 'Verify HTTPs Certificate',
  'component.upstream.fields.checks.active.https_verify_certificate.tooltip':
    'Whether to check the validity of the SSL certificate of the remote host when performing active health checks using HTTPS.',

  'component.upstream.fields.checks.active.req_headers': 'Request Headers',
  'component.upstream.fields.checks.active.req_headers.tooltip':
    'Additional request headers, example: User-Agent: curl/7.29.0',

  'component.upstream.fields.checks.active.healthy.interval': 'Interval',
  'component.upstream.fields.checks.active.healthy.interval.tooltip':
    'Interval between checks for healthy targets (in seconds)',

  'component.upstream.fields.checks.active.healthy.successes': 'Successes',
  'component.upstream.fields.checks.active.healthy.successes.tooltip':
    'Number of successes to consider a target healthy',
  'component.upstream.fields.checks.active.healthy.successes.required':
    'Please enter successes number',

  'component.upstream.fields.checks.active.healthy.http_statuses': 'HTTP Statuses',
  'component.upstream.fields.checks.active.healthy.http_statuses.tooltip':
    'An array of HTTP statuses to consider a success, indicating healthiness, when returned by a probe in active health checks.',

  'component.upstream.fields.checks.active.unhealthy.timeouts': 'Timeouts',
  'component.upstream.fields.checks.active.unhealthy.timeouts.tooltip':
    'Number of timeouts in active probes to consider a target unhealthy.',

  'component.upstream.fields.checks.active.unhealthy.http_failures': 'HTTP Failures',
  'component.upstream.fields.checks.active.unhealthy.http_failures.tooltip':
    'Number of HTTP failures to consider a target unhealthy',
  'component.upstream.fields.checks.active.unhealthy.http_failures.required':
    'Please enter the HTTP failures',

  'component.upstream.fields.checks.active.unhealthy.tcp_failures': 'TCP Failures',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.tooltip':
    'Number of TCP failures to consider a target unhealthy',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.required':
    'Please enter the TCP Failures',

  'component.upstream.fields.checks.active.unhealthy.interval': 'Interval',
  'component.upstream.fields.checks.active.unhealthy.interval.tooltip':
    'Interval between active health checks for unhealthy targets (in seconds). A value of zero indicates that active probes for healthy targets should not be performed.',
  'component.upstream.fields.checks.active.unhealthy.required':
    'Please enter the unhelthy interval',

  'component.upstream.fields.checks.passive.healthy.successes': 'Successes',
  'component.upstream.fields.checks.passive.healthy.successes.tooltip':
    'Number of successes to consider a target healthy',
  'component.upstream.fields.checks.passive.healthy.successes.required':
    'Please enter the successes number',

  'component.upstream.fields.checks.passive.unhealthy.timeouts': 'Timeouts',
  'component.upstream.fields.checks.passive.unhealthy.timeouts.tooltip':
    'Number of timeouts in proxied traffic to consider a target unhealthy, as observed by passive health checks.',

  'component.upstream.other.none': 'None',
  'component.upstream.other.pass_host-with-multiple-nodes.title':
    'Please check the target node configuration',
  'component.upstream.other.pass_host-with-multiple-nodes':
    'When using a host name or IP in the target node list, make sure there is only one target node',
  'component.upstream.other.health-check.passive-only':
    'When passive health check is enabled, active health check needs to be enabled at the same time.',
  'component.upstream.other.health-check.invalid': 'Please check the health check configuration',
};
