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
import { PanelType } from '.';

export const transformer = (chart: any) => {
  const rule: any = {};
  const conf: any = {};

  const { links } = chart;

  const findStartNode = () => {
    const nodeIdFormArr: string[] = [];
    const nodeIdToArr: string[] = [];
    Object.keys(links).forEach((key) => {
      const item = links[key];
      nodeIdFormArr.push(item.from.nodeId);
      nodeIdToArr.push(item.to.nodeId);
    });
    return nodeIdFormArr.filter((item) => !nodeIdToArr.includes(item))[0];
  };

  const findLinkId = (type: string, nodeId: string, port?: string) => {
    let returnId;

    Object.keys(links).forEach((key) => {
      const item = links[key];
      // condition
      if (port) {
        if (port === item[type].portId && item[type].nodeId === nodeId) {
          returnId = key;
        }
        return;
      }
      // plugin
      if (nodeId === item[type].nodeId) {
        returnId = key;
      }
    });

    return returnId;
  };

  const processRule = (id: string) => {
    if (!chart.nodes[id]) return;

    const link = findLinkId('from', id);
    if (!link) return;

    const nextNodeId = links[link].to.nodeId;

    const nextNodeType = chart.nodes[nextNodeId].properties.customData.type;

    if (nextNodeType === PanelType.Plugin) {
      rule[id] = [['', nextNodeId]];
      processRule(nextNodeId);
    }

    if (nextNodeType === PanelType.Condition) {
      let truePortId;
      let falsePortId;
      const { ports } = chart.nodes[nextNodeId];
      Object.keys(ports).forEach((key) => {
        const item = ports[key];
        if (item.properties) {
          if (item.properties.value === 'yes') {
            truePortId = item.id;
          }
          if (item.properties.value === 'no') {
            falsePortId = item.id;
          }
        }
      });
      const trueLinkId = findLinkId('from', nextNodeId, truePortId);
      const falseLinkId = findLinkId('from', nextNodeId, falsePortId);
      const nextTrueNode = trueLinkId ? links[trueLinkId].to.nodeId : undefined;
      const nextFalseNode = falseLinkId ? links[falseLinkId].to.nodeId : undefined;

      rule[id] = [];
      if (nextTrueNode) {
        rule[id][0] = [chart.nodes[nextNodeId].properties.customData.name, nextTrueNode];
        processRule(nextTrueNode);
      }

      if (nextFalseNode) {
        rule[id][1] = ['', nextFalseNode];
        processRule(nextFalseNode);
      }
    }
  };

  const startId = findStartNode();
  rule.root = startId;

  processRule(startId);

  // handle conf
  Object.keys(chart.nodes).forEach((key) => {
    const item = chart.nodes[key];
    if (item.properties.customData && item.properties.customData.type === 0) {
      conf[key] = {
        name: item.properties.customData.name,
        conf: item.properties.customData.data,
      };
    }
  });

  return { rule, conf };
};
