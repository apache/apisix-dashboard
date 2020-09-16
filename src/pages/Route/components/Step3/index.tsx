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
import React, { useState } from 'react';
import { Radio, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isChrome } from 'react-device-detect';

import { PluginPage, PluginPageType } from '@api7-dashboard/plugin';
import PluginOrchestration from '@api7-dashboard/pluginchart';

type Props = {
  data: {
    plugins: PluginPageType.FinalData;
    script: Record<string, any>;
  };
  onChange(data: { plugins: PluginPageType.FinalData; script: any }): void;
  readonly?: boolean;
};

type Mode = 'NORMAL' | 'DRAW';

const Page: React.FC<Props> = ({ data, onChange, readonly = false }) => {
  const { plugins = {}, script = {} } = data;

  // NOTE: Currently only compatible with chrome
  const type = Object.keys(script || {}).length === 0 || !isChrome ? 'NORMAL' : 'DRAW';
  const [mode, setMode] = useState<Mode>(type);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
          }}
          style={{ marginBottom: 10 }}
        >
          <Radio.Button value="NORMAL">普通模式</Radio.Button>
          <Radio.Button value="DRAW" disabled={!isChrome}>
            插件编排
          </Radio.Button>
        </Radio.Group>
        {Boolean(!isChrome) && (
          <div style={{ marginLeft: '10px' }}>
            <Tooltip placement="right" title="插件编排仅支持 Chorme 浏览器">
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
        )}
      </div>
      {Boolean(mode === 'NORMAL') && (
        <PluginPage
          initialData={plugins}
          onChange={(pluginsData) => onChange({ plugins: pluginsData, script: {} })}
        />
      )}
      {Boolean(mode === 'DRAW') && (
        <PluginOrchestration
          data={script?.chart}
          onChange={(scriptData) => onChange({ plugins: {}, script: scriptData })}
          readonly={readonly}
        />
      )}
    </>
  );
};

export default Page;
