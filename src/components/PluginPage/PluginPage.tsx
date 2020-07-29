import React, { useState, useEffect } from 'react';
import { LinkOutlined, SettingOutlined } from '@ant-design/icons';
import { omit } from 'lodash';
import { JSONSchema7 } from 'json-schema';

import PanelSection from '@/components/PanelSection';

import PluginCard from './PluginCard';
import PluginDrawer from './PluginDrawer';
import { getList, fetchPluginSchema } from './service';
import { PLUGIN_MAPPER_SOURCE } from './data';
import { useIntl } from 'umi';

type Props = {
  disabled?: boolean;
  data: PluginPage.PluginData;
  onChange?(data: PluginPage.PluginData): void;
};

const PluginPage: React.FC<Props> = ({ data = {}, disabled, onChange }) => {
  const [pluginName, setPluginName] = useState<string | undefined>();
  const [activeList, setActiveList] = useState<PluginPage.PluginProps[]>([]);
  const [inactiveList, setInactiveList] = useState<PluginPage.PluginProps[]>([]);
  const [schema, setSchema] = useState<JSONSchema7>();
  const { formatMessage } = useIntl();

  const pluginList = [
    {
      title: formatMessage({ id: 'PluginPage.drawer.is.enabled' }),
      list: activeList,
    },
    {
      title: formatMessage({ id: 'PluginPage.drawer.not.enabled' }),
      list: inactiveList,
    },
  ];

  useEffect(() => {
    getList(data).then((props) => {
      setActiveList(props.activeList);
      setInactiveList(props.inactiveList);
    });
  }, []);

  return (
    <>
      {pluginList.map(({ list, title }) => {
        if (disabled && title === '未启用') {
          return null;
        }
        return (
          <PanelSection
            title={title}
            key={title}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 33.333%)',
              gridRowGap: 10,
              gridColumnGap: 10,
            }}
          >
            {list.map(({ name }) => (
              <PluginCard
                name={name}
                actions={[
                  <SettingOutlined
                    onClick={() => {
                      fetchPluginSchema(name).then((schemaData) => {
                        setSchema(schemaData);
                        setTimeout(() => {
                          setPluginName(name);
                        }, 300);
                      });
                    }}
                  />,
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
        );
      })}

      <PluginDrawer
        name={pluginName}
        initialData={pluginName ? data[pluginName] : {}}
        active={Boolean(activeList.find((item) => item.name === pluginName))}
        schema={schema!}
        disabled={disabled}
        onActive={(name) => {
          // TODO: 需测试诸如 普罗米修斯 此类只需通过 {} 即可启用的插件
          setActiveList(activeList.concat({ name, ...PLUGIN_MAPPER_SOURCE[name] }));
          setInactiveList(inactiveList.filter((item) => item.name !== name));
        }}
        onInactive={(name) => {
          if (!onChange) {
            throw new Error('请提供 onChange 方法');
          }
          onChange(omit(Object.assign({}, data), name));
          setInactiveList(inactiveList.concat({ name, ...PLUGIN_MAPPER_SOURCE[name] }));
          setActiveList(activeList.filter((item) => item.name !== name));
          setPluginName(undefined);
        }}
        onClose={() => setPluginName(undefined)}
        onFinish={(value) => {
          if (!pluginName) {
            return;
          }
          if (!onChange) {
            throw new Error('请提供 onChange 方法');
          }
          onChange(Object.assign({}, data, { [pluginName]: value }));
          setPluginName(undefined);
        }}
      />
    </>
  );
};

export default PluginPage;
