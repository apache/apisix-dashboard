import React, { useState } from 'react';
import { SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { omit, merge } from 'lodash';

import { PLUGIN_MAPPER_SOURCE } from '@/components/PluginForm/data';
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

const CreateStep3: React.FC<Props> = ({ data, disabled, onChange }) => {
  const [currentPlugin, setCurrentPlugin] = useState<string | undefined>();
  const { _disabledPluginList = [], _enabledPluginList = [] } = data.step3Data;

  return (
    <>
      <PanelSection title="已启用" style={sectionStyle}>
        {_enabledPluginList.map(({ name }) => (
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
      {!disabled && (
        <PanelSection title="未启用" style={sectionStyle}>
          {_disabledPluginList.map(({ name }) => (
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
      )}
      <PluginDrawer
        name={currentPlugin}
        disabled={disabled}
        initialData={currentPlugin ? data.step3Data.plugins[currentPlugin] : {}}
        active={Boolean(_enabledPluginList.find((item) => item.name === currentPlugin))}
        onActive={(name: string) => {
          onChange({
            ...data.step3Data,
            _disabledPluginList: _disabledPluginList.filter((item) => item.name !== name),
            _enabledPluginList: _enabledPluginList.concat({ name, ...PLUGIN_MAPPER_SOURCE[name] }),
          });
        }}
        onInactive={(name: string) => {
          onChange({
            ...omit({ ...data.step3Data }, `plugins.${currentPlugin}`),
            _disabledPluginList: _disabledPluginList.concat({
              name,
              ...PLUGIN_MAPPER_SOURCE[name],
            }),
            _enabledPluginList: _enabledPluginList.filter((item) => item.name !== name),
          });
          setCurrentPlugin(undefined);
        }}
        onClose={() => setCurrentPlugin(undefined)}
        onFinish={(value) => {
          onChange(merge(data.step3Data, { plugins: { [currentPlugin as string]: value } }));
          setCurrentPlugin(undefined);
        }}
      />
    </>
  );
};

export default CreateStep3;
