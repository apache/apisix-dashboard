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
import { Anchor, Layout, Card, Button } from 'antd';
import { PanelSection } from '@api7-dashboard/ui';

import { getList } from './service';
import PluginDetail from './PluginDetail';

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

const PluginPage: React.FC<Props> = ({
  readonly = false,
  initialData = {},
  onChange = () => { },
}) => {
  const [pluginList, setPlugin] = useState<PluginComponent.Meta[][]>([]);
  const [name, setName] = useState<string>(NEVER_EXIST_PLUGIN_FLAG);

  useEffect(() => {
    getList().then(setPlugin);
  }, []);

  const PluginList = () => (<>
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
    </Content></>)

  const Plugin = () => <Content style={{ padding: '0 10px', backgroundColor: '#fff', minHeight: 1400 }}>
    <PluginDetail
      name={name}
      readonly={readonly}
      initialData={initialData}
      onClose={() => {
        setName(NEVER_EXIST_PLUGIN_FLAG);
      }}
      onChange={(data) => {
        if (!data.formData.disable) {
          onChange({
            ...initialData,
            [name]: { disable: !data.formData.disable },
          });
          return;
        }
        onChange({
          ...initialData,
          [name]: { ...initialData[name], disable: !data.formData.disable },
        });
      }}
    />
  </Content>

  return (
    <>
      <style>{`
        .ant-avatar {
          background-color: transparent;
        }
      `}</style>
      <Layout>
        {name === NEVER_EXIST_PLUGIN_FLAG && <PluginList />}
        {name !== NEVER_EXIST_PLUGIN_FLAG && <Plugin />}
      </Layout>

    </>
  );
};

export default PluginPage;
