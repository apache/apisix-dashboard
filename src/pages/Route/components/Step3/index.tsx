import React, { useState } from 'react';
import { Radio, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isChrome } from 'react-device-detect';
import { PluginPage, PluginPageType } from '@api7-dashboard/plugin';
import PluginChart from '@api7-dashboard/pluginchart';

type Props = {
  data: PluginPageType.PluginData;
  onChange(data: PluginPageType.PluginData): void;
};

type Mode = 'NORMAL' | 'DRAW';

const Page: React.FC<Props> = ({ data, onChange }) => {
  const { plugins = {}, script = {} } = data;

  // NOTE: Currently only compatible with chrome
  const type = Object.keys(script).length === 0 || !isChrome ? 'NORMAL' : 'DRAW';
  const [mode, setMode] = useState<Mode>(type);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
          }}
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
        <PluginPage data={plugins} onChange={(item) => onChange({ mode, data: item })} />
      )}
      {Boolean(mode === 'DRAW') && (
        <PluginChart data={script.chart} onChange={(item) => onChange({ mode, data: item })} />
      )}
    </>
  );
};

export default Page;
