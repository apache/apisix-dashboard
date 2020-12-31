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
import * as React from 'react';
import { INode, REACT_FLOW_CHART } from '@mrblenny/react-flow-chart';
import { Button } from 'antd';

import { SOuter } from '../DrawPluginStyle';

export interface ISidebarItemProps {
  type: string;
  ports: INode['ports'];
  properties?: any;
}

export const SidebarItem: React.FC<ISidebarItemProps> = ({ type, ports, properties }) => {
  return (
    <SOuter
      draggable
      onDragStart={(event: any) => {
        event.dataTransfer.setData(REACT_FLOW_CHART, JSON.stringify({ type, ports, properties }));
      }}
      style={{ padding: '5px' }}
    >
      <Button type="dashed">{type}</Button>
    </SOuter>
  );
};
