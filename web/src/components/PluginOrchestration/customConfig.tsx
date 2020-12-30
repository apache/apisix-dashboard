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
import React from 'react';
import { useIntl } from 'umi';
import { INodeInnerDefaultProps, IPortDefaultProps } from '@mrblenny/react-flow-chart';

import { SOuter, SPortDefaultOuter } from './DrawPluginStyle';
import { PanelType } from './index';

export const NodeInnerCustom = ({ node }: INodeInnerDefaultProps) => {
  const { formatMessage } = useIntl();
  const { customData } = node.properties;
  if (customData.type === PanelType.Condition) {
    return (
      <SOuter>
        <p>
          {formatMessage({ id: 'page.panel.condition.name' })}：
          {customData.name || `(${formatMessage({ id: 'page.panel.condition.tips' })})`}
        </p>
      </SOuter>
    );
  }

  if (customData.type === PanelType.Plugin) {
    return (
      <SOuter>
        <p>
          {formatMessage({ id: 'page.panel.plugin.name' })}:{' '}
          {customData.name || `(${formatMessage({ id: 'page.panel.plugin.tips' })})`}
        </p>
      </SOuter>
    );
  }

  return (
    <SOuter>
      <br />
    </SOuter>
  );
};

export const PortCustom = (props: IPortDefaultProps) => (
  <SPortDefaultOuter>
    {props.port.properties && props.port.properties.value === 'yes' && (
      <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
        <path fill="white" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
      </svg>
    )}
    {props.port.properties && props.port.properties.value === 'no' && (
      <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
        <path
          fill="white"
          d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
        />
      </svg>
    )}
    {!props.port.properties && (
      <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
        <path fill="white" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
    )}
  </SPortDefaultOuter>
);
