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
import { omit, pick, cloneDeep } from 'lodash';

export const transformStepData = ({
  form1Data,
  form2Data,
  advancedMatchingRules,
  step3Data,
}: RouteModule.RequestData) => {
  let redirect: RouteModule.Redirect = {};
  const step3DataCloned = cloneDeep(step3Data);
  if (form1Data.redirectOption === 'disabled') {
    step3DataCloned.plugins = omit(step3Data.plugins, ['redirect']);
  } else if (form1Data.redirectOption === 'forceHttps') {
    redirect = { http_to_https: true };
  } else if (form1Data.redirectURI !== '') {
    redirect = {
      ret_code: form1Data.ret_code,
      uri: form1Data.redirectURI,
    };
  }

  const { service_id = '' } = form1Data;

  const data: Partial<RouteModule.Body> = {
    ...form1Data,
    ...step3DataCloned,
    vars: advancedMatchingRules.map((rule) => {
      const { operator, position, name, value } = rule;
      let key = '';
      switch (position) {
        case 'cookie':
          key = `cookie_${name}`;
          break;
        case 'http':
          key = `http_${name}`;
          break;
        default:
          key = `arg_${name}`;
      }
      return [key, operator, value];
    }),
    // @ts-ignore
    methods: form1Data.methods.includes("ALL") ? [] : form1Data.methods
  };

  if (Object.keys(redirect).length === 0 || redirect.http_to_https) {
    if (form2Data.upstream_id) {
      data.upstream_id = form2Data.upstream_id;
    } else {
      data.upstream = form2Data;
    }

    if (redirect.http_to_https) {
      if (Object.keys(data.plugins!).length === 0) {
        data.plugins = {};
      }
      data.plugins!.redirect = redirect;
    }
    if (data.status !== undefined) {
      data.status = Number(data.status);
    }

    // Remove some of the frontend custom variables
    return omit(data, [
      'advancedMatchingRules',
      'upstreamHostList',
      'upstreamPath',
      'timeout',
      'redirectURI',
      'ret_code',
      'redirectOption',
      service_id.length === 0 ? 'service_id' : '',
      !Object.keys(step3DataCloned.plugins || {}).length ? 'plugins' : '',
      !Object.keys(step3DataCloned.script || {}).length ? 'script' : '',
      form1Data.hosts.filter(Boolean).length === 0 ? 'hosts' : '',
      form1Data.redirectOption === 'disabled' ? 'redirect' : '',
      data.remote_addrs?.filter(Boolean).length === 0 ? 'remote_addrs' : '',
    ]);
  }

  if (Object.keys(redirect).length) {
    data.plugins = { redirect };
  }

  return pick(data, [
    'name',
    'desc',
    'uris',
    'methods',
    'redirect',
    'vars',
    'plugins',
    service_id.length !== 0 ? 'service_id' : '',
    form1Data.hosts.filter(Boolean).length !== 0 ? 'hosts' : '',
    data.remote_addrs?.filter(Boolean).length !== 0 ? 'remote_addrs' : '',
  ]);
};

const transformVarsToRules = (
  data: [string, RouteModule.Operator, string][] = [],
): RouteModule.MatchingRule[] =>
  data.map(([key, operator, value]) => {
    const [, position, name] = key.split(/^(cookie|http|arg)_/);
    return {
      position: position as RouteModule.VarPosition,
      name,
      value,
      operator,
      key: Math.random().toString(36).slice(2),
    };
  });

export const transformUpstreamNodes = (
  nodes: { [key: string]: number } = {},
): RouteModule.UpstreamHost[] => {
  const data: RouteModule.UpstreamHost[] = [];
  Object.entries(nodes).forEach(([k, v]) => {
    const [host, port] = k.split(':');
    data.push({ host, port: Number(port), weight: Number(v) });
  });
  if (data.length === 0) {
    data.push({} as RouteModule.UpstreamHost);
  }
  return data;
};

export const transformRouteData = (data: RouteModule.Body) => {
  const {
    name,
    desc,
    methods = [],
    uris,
    uri,
    hosts,
    host,
    remote_addrs,
    vars,
    status,
    upstream,
    upstream_id,
    service_id = '',
    priority = 0,
    enable_websocket
  } = data;
  const form1Data: Partial<RouteModule.Form1Data> = {
    name,
    desc,
    status,
    hosts: hosts || (host && [host]) || [''],
    uris: uris || (uri && [uri]) || [],
    remote_addrs: remote_addrs || [''],
    // @ts-ignore
    methods: methods.length ? methods : ["ALL"],
    priority,
    enable_websocket,
    service_id
  };

  const redirect = data.plugins?.redirect || {};
  if (redirect?.http_to_https) {
    form1Data.redirectOption = 'forceHttps';
  } else if (redirect?.uri) {
    form1Data.redirectOption = 'customRedirect';
    form1Data.ret_code = redirect?.ret_code;
    form1Data.redirectURI = redirect?.uri;
  } else {
    form1Data.redirectOption = 'disabled';
  }

  const advancedMatchingRules: RouteModule.MatchingRule[] = transformVarsToRules(vars);

  const form2Data: RouteModule.Form2Data = upstream || { upstream_id };

  const { plugins, script } = data;

  const step3Data: RouteModule.Step3Data = {
    plugins,
    script,
  };

  return {
    form1Data,
    form2Data,
    step3Data,
    advancedMatchingRules,
  };
};
