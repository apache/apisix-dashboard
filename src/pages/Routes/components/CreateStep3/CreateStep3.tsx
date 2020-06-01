import React, { useState, useEffect } from 'react';
import { SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { omit, merge } from 'lodash';

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

const CreateStep3: React.FC<Props> = ({ data, onChange }) => {
  // NOTE: Plugin in blacklist WILL NOT be shown on Step3.
  const pluginBlackList = ['redirect'];

  const list = pluginList.filter(({ name }) => !pluginBlackList.includes(name));
  const [activeList, setActiveList] = useState<PluginForm.PluginProps[]>([]);
  const [inactiveList, setInactiveList] = useState<PluginForm.PluginProps[]>([]);

  useEffect(() => {
    const pluginKeys = Object.keys(data.step3Data.plugins || []);
    setActiveList(list.filter((item) => pluginKeys.includes(item.name)));
    setInactiveList(list.filter((item) => !pluginKeys.includes(item.name)));
  }, [data.step3Data.plugins]);

  const [currentPlugin, setCurrentPlugin] = useState<string | undefined>();

  return (
    <>
      <PanelSection title="已启用" style={sectionStyle}>
        {activeList.map(({ name }) => (
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
      <PanelSection title="未启用" style={sectionStyle}>
        {inactiveList.map(({ name }) => (
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
      <PluginDrawer
        name={currentPlugin}
        active={Boolean(activeList.find((item) => item.name === currentPlugin))}
        onActive={(name: string) => {
          setInactiveList(inactiveList.filter((item) => item.name !== name));
          setActiveList(activeList.concat({ name }));
        }}
        onInactive={(name: string) => {
          setActiveList(activeList.filter((item) => item.name !== name));
          setInactiveList(inactiveList.concat({ name }));
          onChange(omit({ ...data.step3Data }, `plugins.${currentPlugin}`));
          setCurrentPlugin(undefined);
        }}
        onFinish={(value) => {
          onChange(merge(data.step3Data, { plugins: { [currentPlugin as string]: value } }));
        }}
      />
    </>
  );
};

export default CreateStep3;
