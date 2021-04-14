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
  'component.plugin.tip1': 'NOTE: After customizing the plugin, you need to update schema.json.',
  'component.plugin.tip2': 'How to update?',
  'component.select.pluginTemplate': 'Select a  plugin template',
  'component.step.select.pluginTemplate.select.option': 'Custom',
  'component.plugin.pluginTemplate.tip1': '1. When a route already have plugins field configured, the plugins in the plugin template will be merged into it.',
  'component.plugin.pluginTemplate.tip2': '2. The same plugin in the plugin template will override one in the plugins',
  // cors
  'component.pluginForm.cors.allow_origins.tooltip': 'Which Origins is allowed to enable CORS, format as：scheme://host:port, for example: https://somehost.com:8081. Multiple origin use , to split. When allow_credential is false, you can use * to indicate allow any origin. you also can allow all any origins forcefully using ** even already enable allow_credential, but it will bring some security risks.',
  'component.pluginForm.cors.allow_origins.extra': 'For example: https://somehost.com:8081',
  'component.pluginForm.cors.allow_methods.tooltip': 'Which Method is allowed to enable CORS, such as: GET, POST etc. Multiple method use , to split. When allow_credential is false, you can use * to indicate allow all any method. You also can allow any method forcefully using ** even already enable allow_credential, but it will bring some security risks.',
  'component.pluginForm.cors.allow_headers.tooltip': 'Which headers are allowed to set in request when access cross-origin resource. Multiple value use , to split. When allow_credential is false, you can use * to indicate allow all request headers. You also can allow any header forcefully using ** even already enable allow_credential, but it will bring some security risks.',
  'component.pluginForm.cors.expose_headers.tooltip': '	Which headers are allowed to set in response when access cross-origin resource. Multiple value use , to split.',
  'component.pluginForm.cors.max_age.tooltip': 'Maximum number of seconds the results can be cached.. Within this time range, the browser will reuse the last check result. -1 means no cache. Please note that the maximum value is depended on browser, please refer to MDN for details.',
  'component.pluginForm.cors.allow_credential.tooltip': 'If you set this option to true, you can not use \'*\' for other options.',
  'component.pluginForm.cors.allow_origins_by_regex.tooltip': 'Use regex expressions to match which origin is allowed to enable CORS, for example, [".*.test.com"] can use to match all subdomain of test.com.',

  // proxy-mirror
  'component.pluginForm.proxy-mirror.host.tooltip': 'Specify a mirror service address, e.g. http://127.0.0.1:9797 (address needs to contain schema: http or https, not URI part)',
  'component.pluginForm.proxy-mirror.host.extra': 'e.g. http://127.0.0.1:9797 (address needs to contain schema: http or https, not URI part)',
  'component.pluginForm.proxy-mirror.host.ruletip': 'address needs to contain schema: http or https, not URI part',

  // limit-conn
  'component.pluginForm.limit-conn.conn.tooltip': 'the maximum number of concurrent requests allowed. Requests exceeding this ratio (and below conn + burst) will get delayed(the latency seconds is configured by default_conn_delay) to conform to this threshold.',
  'component.pluginForm.limit-conn.burst.tooltip': 'the number of excessive concurrent requests (or connections) allowed to be delayed.',
  'component.pluginForm.limit-conn.default_conn_delay.tooltip': 'the latency seconds of request when concurrent requests exceeding conn but below (conn + burst).',
  'component.pluginForm.limit-conn.key.tooltip': 'to limit the concurrency level.For example, one can use the host name (or server zone) as the key so that we limit concurrency per host name. Otherwise, we can also use the client address as the key so that we can avoid a single client from flooding our service with too many parallel connections or requests.Now accept those as key: "remote_addr"(client\'s IP), "server_addr"(server\'s IP), "X-Forwarded-For/X-Real-IP" in request header, "consumer_name"(consumer\'s username).',
  'component.pluginForm.limit-conn.rejected_code.tooltip': 'returned when the request exceeds conn + burst will be rejected.',

  'component.plugin.form': 'Form',
  'component.plugin.format-codes.disable': 'Format JSON or YAML data',
  'component.plugin.editor': 'Plugin Editor',
  'component.plugin.noConfigurationRequired': 'Doesn\'t need configuration',
};
