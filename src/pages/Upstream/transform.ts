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
import { omit } from 'lodash';

const transformUpstreamNodes = (
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

export const transformCreate = (props: UpstreamModule.Body): UpstreamModule.Entity => {
  const nodes = {};
  props.upstreamHostList.forEach((node) => {
    nodes[`${node.host}:${node.port}`] = node.weight;
  });
  return {
    ...omit(props, 'upstreamHostList', 'active', 'passive'),
    nodes,
  };
};

export const transformFetch = (props: UpstreamModule.Entity) => {
  const upstreamHostList = transformUpstreamNodes(props.nodes);
  let active = false;
  let passive = false;
  if (props.checks) {
    active = true;
    if (props.checks.passive) {
      passive = true;
    }
  }
  return {
    ...omit(props, 'nodes'),
    upstreamHostList,
    active,
    passive,
  };
};
