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
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Divider, Tooltip } from 'antd';
import type { CSSProperties } from 'react';
import React from 'react';

const PanelSection: React.FC<{
  title: string;
  style?: CSSProperties;
  id?: string;
  tooltip?: string;
}> = ({ title, style, id, children, tooltip }) => {
  return (
    <div id={id}>
      <Divider orientation="left">
        {title}
        &nbsp;
        {tooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </Divider>
      <div style={style}>{children}</div>
    </div>
  );
};

export default PanelSection;
