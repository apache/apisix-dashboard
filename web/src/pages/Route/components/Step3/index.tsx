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
import { isChrome, isChromium, isEdgeChromium } from 'react-device-detect';
import { useIntl } from 'umi';

import PluginPage from '@/components/Plugin';
import PluginFlow from '@/components/PluginFlow';
import { DEFAULT_PLUGIN_FLOW_DATA } from '@/components/PluginFlow/constants';
import FlowGraph from '@/components/PluginFlow/components/FlowGraph';

type Props = {
  data: {
    plugins: PluginComponent.Data;
    script: {
      chart: Record<string, any>;
      rule: Record<string, any>;
      conf: Record<string, any>;
    };
    plugin_config_id?: string;
  };
  onChange: (data: { plugins: PluginComponent.Data; script: any, plugin_config_id?: string; }) => void;
  readonly?: boolean;
  isForceHttps?: boolean;
  isProxyEnable?: boolean;
};

type Mode = 'NORMAL' | 'DRAW';

const Page: React.FC<Props> = ({ data, onChange, readonly = false, isForceHttps = false, isProxyEnable = false }) => {
  const { formatMessage } = useIntl();
  const { plugins = {}, script = DEFAULT_PLUGIN_FLOW_DATA, plugin_config_id = '' } = data;

  // NOTE: Currently only compatible with chrome
  const useSupportBrowser = isChrome || isEdgeChromium || isChromium;
  const disableDraw = !useSupportBrowser || isForceHttps || isProxyEnable;

  const [mode, setMode] = useState<Mode>(Object.keys(script.chart?.cells || {}).length === 0 || disableDraw ? 'NORMAL' : 'DRAW');

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            if (e.target.value === 'NORMAL') {
              // NOTE: current is DRAW
              onChange({ ...data, script: { chart: FlowGraph.graph.toJSON() } })
            }

            setMode(e.target.value);
          }}
          style={{ marginBottom: 10 }}
        >
          <Radio.Button value="NORMAL">
            {formatMessage({ id: 'page.route.tabs.normalMode' })}
          </Radio.Button>
          <Radio.Button value="DRAW" disabled={disableDraw}>
            {formatMessage({ id: 'page.route.tabs.orchestration' })}
          </Radio.Button>
        </Radio.Group>
        {Boolean(disableDraw) && (
          <div style={{ marginLeft: '10px' }}>
            <Tooltip
              placement="right"
              title={() => {
                // NOTE: forceHttps do not support DRAW mode
                const titleArr: string[] = [];
                if (!useSupportBrowser) {
                  titleArr.push(formatMessage({ id: 'page.route.tooltip.pluginOrchOnlySupportChrome' }));
                }
                if (isForceHttps) {
                  titleArr.push(formatMessage({ id: 'page.route.tooltip.pluginOrchWithoutRedirect' }));
                }
                if (isProxyEnable) {
                  titleArr.push(formatMessage({ id: 'page.route.tooltip.pluginOrchWithoutProxyRewrite' }));
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
          readonly={readonly}
          initialData={plugins}
          plugin_config_id={plugin_config_id}
          schemaType="route"
          referPage="route"
          showSelector
          onChange={(pluginsData, id) => {
            onChange({ ...data, plugins: pluginsData, plugin_config_id: id })
          }}
        />
      )}
      {Boolean(mode === 'DRAW') && (<PluginFlow chart={script.chart as any} />)}
    </>
  );
};

export default Page;
