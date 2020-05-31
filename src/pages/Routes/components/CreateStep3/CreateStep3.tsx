import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import { fetchPluginList } from '@/components/PluginForm';
import PanelSection from '../PanelSection';
import PluginDrawer from './PluginDrawer';
import PluginCard from './PluginCard';

const sectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 33.333%)',
  gridRowGap: 10,
};

const CreateStep3: React.FC = () => {
  const [pluginList, setPluginList] = useState<string[]>([]);
  const [currentPlugin, setCurrentPlugin] = useState<string | undefined>();

  useEffect(() => {
    fetchPluginList().then((data) => setPluginList(data));
  }, []);

  // TODO: 设置插件黑名单（不展示的插件）
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
        {pluginList.map((name) => (
          <PluginCard
            name={name}
            actions={[<SettingOutlined onClick={() => setCurrentPlugin(name)} />]}
          />
        ))}
      </PanelSection>
      <PluginDrawer name={currentPlugin} onFinish={() => {}} />
    </>
  );
};

export default CreateStep3;
