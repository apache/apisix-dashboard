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
import { orderBy } from 'lodash';

import PluginDetail from './PluginDetail';
import { fetchList } from './service';
import { PLUGIN_ICON_LIST } from './data'
import defaultPluginImg from '../../../public/static/default-plugin.png';

type Props = {
  readonly?: boolean;
  type?: 'global' | 'scoped';
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
  schemaType = 'route',
  type = 'scoped',
  onChange = () => { },
}) => {
  const [pluginList, setPluginList] = useState<PluginComponent.Meta[]>([]);
  const [name, setName] = useState<string>(NEVER_EXIST_PLUGIN_FLAG);
  const [typeList, setTypeList] = useState<string[]>([]);

  const firstUpperCase = ([first, ...rest]: string) => first.toUpperCase() + rest.join('');
  useEffect(() => {
    fetchList().then((data) => {
      setPluginList(data);

      const categoryList: string[] = [];
      data.forEach((item) => {
        if (!categoryList.includes(firstUpperCase(item.type))) {
          categoryList.push(firstUpperCase(item.type));
        }
      });
      setTypeList(categoryList.sort());
    });
  }, []);

  const PluginList = () => (
    <><style>
      {`
      .ant-card-body .icon {
          width: 5em;
          height: 5em;
          margin-right: 0;
          overflow: hidden;
          vertical-align: -0.15em;
          fill: currentColor;
        }`
      }
    </style>
      <Sider theme="light">
        <Anchor offsetTop={150}>
          {/* eslint-disable-next-line no-shadow */}
          {typeList.map((type) => {
            return <Anchor.Link href={`#plugin-category-${type}`} title={type} key={type} />;
          })}
        </Anchor>
      </Sider>
      <Content style={{ padding: '0 10px', backgroundColor: '#fff', minHeight: 1400 }}>
        {/* eslint-disable-next-line no-shadow */}
        {typeList.map((type) => {
          return (
            <PanelSection
              title={type}
              key={type}
              style={PanelSectionStyle}
              id={`plugin-category-${type}`}
            >
              {orderBy(
                pluginList.filter((item) => item.type === type.toLowerCase()),
                'name',
                'asc',
              ).map((item) => (
                <Card
                  key={item.name}
                  actions={[
                    <Button
                      type={
                        initialData[item.name] && !initialData[item.name].disable
                          ? 'primary'
                          : 'default'
                      }
                      onClick={() => {
                        setName(item.name);
                      }}
                    >
                      Enable
                    </Button>,
                  ]}
                  title={[
                    <div style={{ width: '100%', textAlign: 'center' }} key={1}>
                      <span key={2} data-cy-plugin-name={item.name}>
                        {item.name}
                      </span>
                    </div>,
                  ]}
                  bodyStyle={{
                    minHeight: 151,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  style={{ width: 200 }}
                >
                  {Boolean(PLUGIN_ICON_LIST[item.name]) && PLUGIN_ICON_LIST[item.name]}
                  {Boolean(!PLUGIN_ICON_LIST[item.name]) && <img
                    alt="pluginImg"
                    src={defaultPluginImg}
                    style={{ width: 50, height: 50, opacity: 0.2 }}
                  />}
                </Card>
              ))}
            </PanelSection>
          );
        })}
      </Content>
    </>
  );

  const Plugin = () => (
    <Content style={{ padding: '0 10px', backgroundColor: '#fff', minHeight: 1400 }}>
      <PluginDetail
        name={name}
        readonly={readonly}
        type={type}
        visible={name !== NEVER_EXIST_PLUGIN_FLAG}
        schemaType={schemaType}
        initialData={initialData}
        pluginList={pluginList}
        onClose={() => {
          setName(NEVER_EXIST_PLUGIN_FLAG);
        }}
        onChange={({ codemirrorData, formData }) => {
          onChange({
            ...initialData,
            [name]: { ...codemirrorData, disable: !formData.disable },
          });
          setName(NEVER_EXIST_PLUGIN_FLAG);
        }}
      />
    </Content>
  );
  return (
    <>
      <style>{`
        .ant-avatar {
          background-color: transparent;
        }
      `}</style>
      <Layout>
        <PluginList />
        <Plugin />
      </Layout>
    </>
  );
};

export default PluginPage;
