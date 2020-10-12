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
/* eslint-disable @typescript-eslint/naming-convention */
import { omit, pick } from 'lodash';

export const transformStepData = ({
  form1Data,
  form2Data,
  advancedMatchingRules,
  upstreamHeaderList,
  step3Data,
}: RouteModule.RequestData) => {
  const upstream_header = {};
  (upstreamHeaderList || []).forEach((header) => {
    upstream_header[header.header_name] = header.header_value || '';
  });

  let redirect: RouteModule.Redirect = {};
  if (form1Data.redirectOption === 'disabled') {
    redirect = {};
  } else if (form1Data.redirectOption === 'forceHttps') {
    redirect = { http_to_https: true };
  } else if (form1Data.redirectURI !== '') {
    redirect = {
      ret_code: form1Data.ret_code,
      uri: form1Data.redirectURI,
    };
  }

  const data: Partial<RouteModule.Body> = {
    ...form1Data,
    ...step3Data,
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
    upstream_header,
  };

  // 未启用 redirect
  if (!redirect.uri) {
    if (step3Data.plugins.prometheus) {
      // eslint-disable-next-line no-param-reassign
      step3Data.plugins.prometheus = {};
    }

    if (form2Data.upstream_id) {
      data.upstream_id = form2Data.upstream_id;
    } else {
      data.upstream = form2Data;
    }

    // 移除前端部分自定义变量
    return omit(data, [
      'advancedMatchingRules',
      'upstreamHostList',
      'upstreamPath',
      'upstreamHeaderList',
      'timeout',
      'redirectURI',
      'ret_code',
      'redirectOption',
      form1Data.hosts.filter(Boolean).length === 0 ? 'hosts' : '',
      form1Data.redirectOption === 'disabled' ? 'redirect' : '',
    ]);
  }

  data.plugins = { redirect };
  return pick(data, [
    'name',
    'desc',
    'protocols',
    'uris',
    'methods',
    'redirect',
    'vars',
    'route_group_id',
    'route_group_name',
    'plugins',
    form1Data.hosts.filter(Boolean).length !== 0 ? 'hosts' : '',
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
  const { name, desc, methods, uris, hosts, vars, status, upstream, upstream_id } = data;
  const form1Data: Partial<RouteModule.Form1Data> = {
    name,
    desc,
    status,
    hosts: (hosts || []).filter(Boolean).length === 0 ? [''] : hosts,
    uris,
    methods,
  };

  const { redirect } = data.plugins;
  if (redirect?.http_to_https) {
    form1Data.redirectOption = 'forceHttps';
  } else if (redirect?.uri) {
    form1Data.redirectOption = 'customRedirect';
    form1Data.ret_code = redirect?.code;
    form1Data.redirectURI = redirect?.uri;
  } else {
    form1Data.redirectOption = 'disabled';
  }

  const advancedMatchingRules: RouteModule.MatchingRule[] = transformVarsToRules(vars);

  const upstreamHeaderList = Object.entries(data.upstream_header || {}).map(([k, v]) => {
    return {
      header_name: k,
      header_value: v,
      key: Math.random().toString(36).slice(2),
      header_action: v ? 'override' : 'remove',
    };
  });

  const form2Data: RouteModule.Form2Data = upstream || { upstream_id };

  const { plugins, script } = data;

  if (plugins && plugins.prometheus) {
    plugins.prometheus = { enabled: true };
  }

  const step3Data: RouteModule.Step3Data = {
    plugins,
    script,
  };

  return {
    form1Data,
    form2Data,
    step3Data,
    upstreamHeaderList,
    advancedMatchingRules,
  };
};

// TODO: neet to check transformRouteDebugData
export const transformRouteDebugData = (data: RouteModule.Body) => {
  const {
    name,
    desc,
    methods,
    uris,
    protocols,
    // hosts,
    vars,
    // redirect,
    url,
  } = data;

  const paths = {};
  const tags: RouteModule.TagSchema[] = [
    {
      name: `Route-${name}`,
      description: desc,
    },
  ];
  let servers: RouteModule.Server[] = [];
  const responses: RouteModule.ResponseSchema = {
    // default response code
    '200': {
      description: 'OK',
      content: {},
    },
    '400': {
      description: 'Invalid parameter',
      content: {},
    },
    '500': {
      description: 'Internal Server Error',
      content: {},
    },
  };
  const params = transformVarsToRules(vars);
  const formatParams = params.map((param) => {
    const { position, operator } = param;
    let paramPostion;

    switch (position) {
      case 'cookie':
        paramPostion = 'cookie';
        break;
      case 'http':
        paramPostion = 'header';
        break;
      case 'arg':
        paramPostion = 'query';
        break;
      default:
        break;
    }
    return {
      name: param.name,
      in: paramPostion,
      description: `default value should ${operator} ${param.value}`,
      required: true,
      type: 'string',
    };
  });
  const pathParams = {
    name: 'pathParam',
    in: 'path',
    description: `enter your path param`,
    required: true,
    type: 'string',
  };
  const requestBodyMethod = ['POST', 'PUT', 'PATCH'];

  protocols.forEach((protocol) => {
    if (protocol !== 'websocket') {
      servers = [
        ...servers,
        {
          url: `${protocol}://${url}`,
        },
      ];
    }
  });

  uris.forEach((uri) => {
    if (uri.indexOf('*') > -1) {
      paths[`${uri.split('*')[0]}{pathParam}`] = {};
      return;
    }
    paths[uri] = {};
  });

  methods.forEach((method) => {
    Object.keys(paths).forEach((path) => {
      paths[path] = {
        ...paths[path],
        [method.toLocaleLowerCase()]: {
          tags: [tags[0].name],
          operationId: `${method.toLocaleLowerCase()}${path.split('/')[1]}`,
          parameters: [...formatParams],
          responses,
        },
      };
      // route contains *
      if (path.match(/{pathParam}/)) {
        paths[path][method.toLocaleLowerCase()].parameters.push(pathParams);
      }
      // post, put, patch add requestBody
      if (requestBodyMethod.indexOf(method) > -1) {
        paths[path][method.toLocaleLowerCase()] = {
          ...paths[path][method.toLocaleLowerCase()],
          requestBody: {
            description: 'body parameters',
            content: {},
          },
        };
      }
    });
  });
  return {
    tags,
    servers,
    paths,
  };
};
