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
import React, { useEffect, useState } from 'react';
import { Anchor, Layout, Switch, Card, Tooltip, Button, notification, Avatar } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import { PanelSection } from '@api7-dashboard/ui';
import { validate } from 'json-schema';

import { fetchSchema, getList } from './service';
import CodeMirrorDrawer from './CodeMirrorDrawer';

type Props = {
  readonly?: boolean;
  initialData?: PluginComponent.Data;
  schemaType?: PluginComponent.Schema;
  onChange?: (data: PluginComponent.Data) => void;
};

const PanelSectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 33.333333%)',
  gridRowGap: 15,
  gridColumnGap: 10,
  width: 'calc(100% - 20px)',
};

const { Sider, Content } = Layout;

// NOTE: use this flag as plugin's name to hide drawer
const NEVER_EXIST_PLUGIN_FLAG = 'NEVER_EXIST_PLUGIN_FLAG';

const PluginPage: React.FC<Props> = ({
  readonly = false,
  initialData = {},
  schemaType = '',
  onChange = () => {},
}) => {
  const [pluginList, setPlugin] = useState<PluginComponent.Meta[][]>([]);
  const [name, setName] = useState<string>(NEVER_EXIST_PLUGIN_FLAG);

  useEffect(() => {
    getList().then(setPlugin);
  }, []);

  const validateData = (pluginName: string, value: PluginComponent.Data) => {
    fetchSchema(pluginName, schemaType).then((schema) => {
      // NOTE: The frontend will inject the disable property into schema just like the manager-api does
      if (!schema.properties) {
        // eslint-disable-next-line
        schema.properties = {}
      }
      // eslint-disable-next-line
      ;(schema.properties as any).disable = {
        type: "boolean"
      }

      const { valid, errors } = validate(value, schema);
      if (valid) {
        setName(NEVER_EXIST_PLUGIN_FLAG);
        onChange({ ...initialData, [pluginName]: value });
        return;
      }
      errors?.forEach((item) => {
        notification.error({
          message: 'Invalid plugin data',
          description: item.message,
        });
      });
      setName(pluginName);
    });
  };

  return (
    <>
      <style>{`
        .ant-avatar > img {
          object-fit: contain;
        }
        .ant-avatar {
          background-color: transparent;
        }
        .ant-avatar.ant-avatar-icon {
          font-size: 32px;
        }
      `}</style>
      <Layout>
        <Sider theme="light">
          <Anchor offsetTop={150}>
            {pluginList.map((plugins) => {
              const { category } = plugins[0];
              return (
                <Anchor.Link
                  href={`#plugin-category-${category}`}
                  title={category}
                  key={category}
                />
              );
            })}
          </Anchor>
        </Sider>
        <Content style={{ padding: '0 10px', backgroundColor: '#fff', minHeight: 1400 }}>
          {pluginList.map((plugins) => {
            const { category } = plugins[0];
            return (
              <PanelSection
                title={category}
                key={category}
                style={PanelSectionStyle}
                id={`plugin-category-${category}`}
              >
                {plugins.map((item) => (
                  <Card
                    key={item.name}
                    title={[
                      item.avatar && (
                        <Avatar
                          key={1}
                          icon={item.avatar}
                          className="plugin-avatar"
                          style={{
                            marginRight: 5,
                          }}
                        />
                      ),
                      <span key={2}>{item.name}</span>,
                    ]}
                    style={{ height: 66 }}
                    extra={[
                      <Tooltip title="Setting" key={`plugin-card-${item.name}-extra-tooltip-2`}>
                        <Button
                          shape="circle"
                          icon={<SettingFilled />}
                          style={{ marginRight: 10, marginLeft: 10 }}
                          size="middle"
                          onClick={() => {
                            setName(item.name);
                          }}
                        />
                      </Tooltip>,
                      <Switch
                        defaultChecked={initialData[item.name] && !initialData[item.name].disable}
                        disabled={readonly}
                        onChange={(isChecked) => {
                          if (isChecked) {
                            validateData(item.name, {
                              ...initialData[item.name],
                              disable: false
                            });
                          } else {
                            onChange({
                              ...initialData,
                              [item.name]: { ...initialData[item.name], disable: true },
                            });
                          }
                        }}
                        key={Math.random().toString(36).substring(7)}
                      />,
                    ]}
                  />
                ))}
              </PanelSection>
            );
          })}
        </Content>
      </Layout>
      <CodeMirrorDrawer
        name={name}
        visible={name !== NEVER_EXIST_PLUGIN_FLAG}
        data={initialData[name]}
        readonly={readonly}
        onClose={() => {
          setName(NEVER_EXIST_PLUGIN_FLAG);
        }}
        onSubmit={(value) => {
          validateData(name, value);
        }}
      />
    </>
  );
};

export default PluginPage;
