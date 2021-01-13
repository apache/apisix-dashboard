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

import PluginOrchestration from '@/components/PluginOrchestration';
import PluginPage from '@/components/Plugin';

type Props = {
  data: {
    plugins: PluginComponent.Data;
    script: Record<string, any>;
  };
  onChange: (data: { plugins: PluginComponent.Data; script: any }) => void;
  readonly?: boolean;
  isForceHttps: boolean;
};

type Mode = 'NORMAL' | 'DRAW';

const Page: React.FC<Props> = ({ data, onChange, readonly = false, isForceHttps }) => {
  const { plugins = {}, script = {} } = data;

  // NOTE: Currently only compatible with chrome
  const disableDraw = !isChrome || isForceHttps;

  const type = Object.keys(script || {}).length === 0 || disableDraw ? 'NORMAL' : 'DRAW';

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
          <Radio.Button value="DRAW" disabled={disableDraw}>
            插件编排
          </Radio.Button>
        </Radio.Group>
        {Boolean(disableDraw) && (
          <div style={{ marginLeft: '10px' }}>
            <Tooltip
              placement="right"
              title={() => {
                // NOTE: forceHttps do not support DRAW mode
                // TODO: i18n
                const titleArr: string[] = [];
                if (!isChrome) {
                  titleArr.push('插件编排仅支持 Chrome 浏览器。');
                }
                if (isForceHttps) {
                  titleArr.push('当步骤一中 重定向 选择为 启用 HTTPS 时，不可使用插件编排模式。');
                }
                return titleArr.map((item, index) => `${index + 1}.${item}`).join('');
              }}
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
        )}
      </div>
      {Boolean(mode === 'NORMAL') && (
        <PluginPage
          initialData={plugins}
          schemaType="route"
          referPage='route'
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
