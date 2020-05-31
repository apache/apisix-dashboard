import React, { useState } from 'react';
import { Card } from 'antd';
import { SettingOutlined, LinkOutlined } from '@ant-design/icons';

import { pluginList } from '@/components/PluginForm';
import PanelSection from '../PanelSection';
import PluginDrawer from './PluginDrawer';
import PluginCard from './PluginCard';

interface Props extends RouteModule.Data {}

const sectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 33.333%)',
  gridRowGap: 10,
  gridColumnGap: 10,
};

const CreateStep3: React.FC<Props> = () => {
  const [currentPlugin, setCurrentPlugin] = useState<string | undefined>();

  // NOTE: Plugin in blacklist WILL NOT be shown on Step3.
  const pluginBlackList = ['redirect'];
  const list = pluginList.filter(({ name }) => !pluginBlackList.includes(name));

  // TODO: 获取 Route 已启用插件
  // TODO: 拆分已启用、未启用插件

  return (
    <>
      <PanelSection title="已启用" style={sectionStyle}>
        <Card
          style={{ width: 300 }}
          actions={[<SettingOutlined onClick={() => setCurrentPlugin('')} />]}
        >
          <Card.Meta title="插件名称" description="插件描述" />
        </Card>
      </PanelSection>
      <PanelSection title="未启用" style={sectionStyle}>
        {list.map(({ name }) => (
          <PluginCard
            name={name}
            actions={[
              <SettingOutlined onClick={() => setCurrentPlugin(name)} />,
              <LinkOutlined
                onClick={() =>
                  window.open(
                    `https://github.com/apache/incubator-apisix/blob/master/doc/plugins/${name}.md`,
                  )
                }
              />,
            ]}
            key={name}
          />
        ))}
      </PanelSection>
      <PluginDrawer name={currentPlugin} onFinish={() => {}} />
    </>
  );
};

export default CreateStep3;
