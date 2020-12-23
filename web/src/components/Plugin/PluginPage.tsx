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
import { Anchor, Layout, Card, Button, notification } from 'antd';
import { PanelSection } from '@api7-dashboard/ui';
import Ajv, { DefinedError } from 'ajv';

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
  gridTemplateColumns: 'repeat(5, 20%)',
  gridRowGap: 15,
  gridColumnGap: 10,
  width: 'calc(100% - 20px)',
};

const { Sider, Content } = Layout;

// NOTE: use this flag as plugin's name to hide drawer
const NEVER_EXIST_PLUGIN_FLAG = 'NEVER_EXIST_PLUGIN_FLAG';

const ajv = new Ajv();

const PluginPage: React.FC<Props> = ({
  readonly = false,
  initialData = {},
  schemaType = '',
  onChange = () => { },
}) => {
  const [pluginList, setPlugin] = useState<PluginComponent.Meta[][]>([]);
  const [name, setName] = useState<string>(NEVER_EXIST_PLUGIN_FLAG);

  useEffect(() => {
    getList().then(setPlugin);
  }, []);

  // NOTE: This function has side effect because it mutates the original schema data
  const injectDisableProperty = (schema: Record<string, any>) => {
    // NOTE: The frontend will inject the disable property into schema just like the manager-api does
    if (!schema.properties) {
      // eslint-disable-next-line
      schema.properties = {};
    }
    // eslint-disable-next-line
    (schema.properties as any).disable = {
      type: 'boolean',
    };
    return schema;
  };

  const validateData = (pluginName: string, value: PluginComponent.Data) => {
    fetchSchema(pluginName, schemaType).then((schema) => {
      if (schema.oneOf) {
        (schema.oneOf || []).forEach((item: any) => {
          injectDisableProperty(item);
        });
      } else {
        injectDisableProperty(schema);
      }

      const validate = ajv.compile(schema);

      if (validate(value)) {
        setName(NEVER_EXIST_PLUGIN_FLAG);
        onChange({ ...initialData, [pluginName]: value });
        return;
      }

      // eslint-disable-next-line
      for (const err of validate.errors as DefinedError[]) {
        let description = '';
        switch (err.keyword) {
          case 'enum':
            description = `${err.dataPath} ${err.message}: ${err.params.allowedValues.join(
              ', ',
            )}`;
            break;
          case 'minItems':
          case 'type':
            description = `${err.dataPath} ${err.message}`;
            break;
          case 'oneOf':
          case 'required':
            description = err.message || '';
            break;
          default:
            description = `${err.schemaPath} ${err.message}`;
        }
        notification.error({
          message: 'Invalid plugin data',
          description,
        });
      }
      setName(pluginName);
    });
  };

  return (
    <>
      <style>{`
        .ant-avatar {
          background-color: transparent;
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
                    actions={[
                      <Button type={(initialData[item.name] && !initialData[item.name].disable) ? 'primary' : 'default'} onClick={() => {
                        setName(item.name);
                      }}>Enable</Button>

                    ]}
                    bodyStyle={{ height: 151, display: 'flex', justifyContent: 'center', textAlign: 'center' }}
                    title={[
                      <div style={{ width: '100%', textAlign: 'center' }}><span key={2}>{item.name}</span></div>
                    ]}
                    style={{ height: 258, width: 200 }}
                  >
                    {/* {item.avatar && (
                      <Avatar
                        key={1}
                        icon={item.avatar}
                        size={150}
                        shape='square'
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      />
                    )} */}
                  </Card>
                ))}
              </PanelSection>
            );
          })}
        </Content>
      </Layout>
      <CodeMirrorDrawer
        name={name}
        visible={name !== NEVER_EXIST_PLUGIN_FLAG}
        initialData={initialData}
        onChange={onChange}
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
