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
import { notification } from 'antd';
import { cloneDeep, isNil, omit, omitBy } from 'lodash';
import { formatMessage, request } from 'umi';

/**
 * Because we have some `custom` field in Upstream Form, like custom.tls/custom.checks.active etc,
 * we need to transform data that doesn't have `custom` field to data contains `custom` field
 */
export const convertToFormData = (originData: UpstreamComponent.ResponseData) => {
  if (originData === undefined) {
    // NOTE: When binding Service without Upstream configuration (None), originData === undefined
    return undefined;
  }

  const data = cloneDeep(originData);
  data.custom = {};
  data.upstream_id = 'Custom';

  if (data.checks) {
    data.custom.checks = {};

    if (data.checks.active) {
      data.custom.checks.active = true;
    }

    if (data.checks.passive) {
      data.custom.checks.passive = true;
    }
  }

  if (data.tls) {
    data.custom.tls = 'enable';
  }

  if (data.id) {
    data.upstream_id = data.id;
  }

  if (data.nodes) {
    data.upstream_type = 'node';
  }
  // nodes have two types
  // https://github.com/apache/apisix-dashboard/issues/2080
  if (data.nodes instanceof Array) {
    data.submitNodes = data.nodes;
  } else if (data.nodes) {
    data.submitNodes = Object.keys(data.nodes as Object).map((key) => ({
      host: key.split(':')[0],
      port: key.split(':')[1],
      weight: (data.nodes as Object)[key],
    }));
  }

  if (data.discovery_type && data.service_name) {
    data.upstream_type = 'service_discovery';
  }

  return data;
};

/**
 * Transform Upstream Form data from custom data to API needed data
 */
export const convertToRequestData = (
  formData: UpstreamModule.RequestBody,
): UpstreamModule.RequestBody | undefined | { upstream_id: string } => {
  let data = omitBy(formData, isNil) as UpstreamModule.RequestBody;
  data = omit(data, 'custom');

  const {
    type,
    hash_on,
    key,
    upstream_type,
    submitNodes,
    discovery_type,
    discovery_args,
    service_name,
    pass_host,
    upstream_host,
    upstream_id = 'Custom',
    checks,
  } = data;

  if (!['Custom', 'None'].includes(upstream_id)) {
    return { upstream_id };
  }

  data = omit(data, 'upstream_id') as any;

  if (type === 'chash') {
    if (!hash_on) {
      return undefined;
    }

    if (hash_on !== 'consumer' && !key) {
      return undefined;
    }
  }

  if (pass_host === 'rewrite' && !upstream_host) {
    return undefined;
  }

  if (checks?.passive && !checks.active) {
    notification.error({
      message: formatMessage({ id: 'component.upstream.other.health-check.invalid' }),
      description: formatMessage({ id: 'component.upstream.other.health-check.passive-only' }),
    });
    return undefined;
  }

  if (upstream_type === 'node' && submitNodes) {
    /**
     * submitNodes will be [] or node list
     * when upstream_id === none, None === undefined
     */
    // NOTE: https://github.com/ant-design/ant-design/issues/27396
    data.nodes = {};
    submitNodes?.forEach((item) => {
      const port = item.port ? `:${item.port}` : '';
      data.nodes = {
        ...data.nodes,
        [`${item.host}${port}`]: item.weight as number,
      };
    });
    return omit(data, ['upstream_type', 'submitNodes']);
  }

  if (upstream_type === 'service_discovery' && discovery_type && service_name) {
    if (!discovery_args) data.discovery_args = {};
    return omit(data, 'upstream_type');
  }

  return undefined;
};

export const fetchUpstreamList = () => {
  return request<Res<ResListData<UpstreamComponent.ResponseData>>>('/upstreams').then(
    ({ data }) => ({
      data: data.rows.map((row) => convertToFormData(row)),
      total: data.total_size,
    }),
  );
};
