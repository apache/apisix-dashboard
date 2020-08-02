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
        if (disabled && title === formatMessage({ id: 'PluginPage.drawer.not.enabled' })) {
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
          onChange(omit({ ...data }, name));
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
          onChange({ ...data, [pluginName]: value });
          setPluginName(undefined);
        }}
      />
    </>
  );
};

export default PluginPage;
