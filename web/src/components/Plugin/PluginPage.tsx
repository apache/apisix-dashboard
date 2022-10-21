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
import { Alert, Anchor, Button, Card, Form, Layout, Select, Tabs } from 'antd';
import { omit, orderBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';

import PanelSection from '@/components/PanelSection';

import defaultPluginImg from '../../../public/static/default-plugin.png';
import { PLUGIN_FILTER_LIST, PLUGIN_ICON_LIST } from './data';
import PluginDetail from './PluginDetail';
import { fetchList, fetchPluginTemplateList } from './service';

type Props = {
  readonly?: boolean;
  type?: 'global' | 'scoped';
  initialData?: PluginComponent.Data;
  plugin_config_id?: string;
  schemaType?: PluginComponent.Schema;
  referPage?: PluginComponent.ReferPage;
  showSelector?: boolean;
  onChange?: (
    plugins: PluginComponent.Data,
    plugin_config_id?: string,
    handleType?: 'edit' | 'delete',
  ) => void;
};

const PanelSectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 25%)',
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
  plugin_config_id = '',
  schemaType = 'route',
  referPage = '',
  type = 'scoped',
  showSelector = false,
  onChange = () => {},
}) => {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();
  const [pluginList, setPluginList] = useState<PluginComponent.Meta[]>([]);
  const [enablePluginsList, setEnablePluginsList] = useState<PluginComponent.Meta[]>([]);
  const [showEnablePlugin, setShowEnablePlugin] = useState<boolean>(false);
  const [pluginTemplateList, setPluginTemplateList] = useState<PluginTemplateModule.ResEntity[]>(
    [],
  );
  const [name, setName] = useState<string>(NEVER_EXIST_PLUGIN_FLAG);
  const [typeList, setTypeList] = useState<string[]>([]);
  const [plugins, setPlugins] = useState({});

  useEffect(() => {
    fetchList().then((data) => {
      const filteredData = data.filter(
        (item) =>
          !(
            PLUGIN_FILTER_LIST[item.name] && PLUGIN_FILTER_LIST[item.name].list.includes(referPage)
          ),
      );
      setPluginList(filteredData);
      const categoryList: string[] = [];
      data.forEach((item) => {
        if (!categoryList.includes(item.type)) {
          categoryList.push(item.type);
        }
      });
      setTypeList(categoryList);
    });
    fetchPluginTemplateList().then((data) => {
      setPluginTemplateList(data);
      form.setFieldsValue({ plugin_config_id });
    });
  }, []);

  useEffect(() => {
    const openPluginList = pluginList.filter(
      (item) => initialData[item.name] && !initialData[item.name].disable,
    );
    setPlugins(initialData);
    setEnablePluginsList(openPluginList);
  }, [initialData, pluginList]);

  const openPluginType = enablePluginsList.map((item) => item.type);
  const newOpenPluginType = openPluginType.filter((elem, index, self) => {
    return index === self.indexOf(elem);
  });

  const tabsList = [
    {
      title: formatMessage({ id: 'component.plugin.all' }),
      key: 'allPlugins',
    },
    {
      title: formatMessage({ id: 'component.plugin.enable' }),
      key: 'enablePlugins',
    },
  ];

  const SwitchTab = () => (
    <Tabs
      defaultActiveKey={showEnablePlugin ? 'enablePlugins' : 'allPlugins'}
      onChange={(val: string) => {
        setShowEnablePlugin(val === 'enablePlugins');
      }}
    >
      {tabsList.map((tab) => (
        <Tabs.TabPane tab={tab.title} key={tab.key} />
      ))}
    </Tabs>
  );

  const PluginList = () => (
    <>
      <style>
        {`
          .ant-card-body .icon {
            width: 5em;
            height: 5em;
            margin-right: 0;
            overflow: hidden;
            vertical-align: -0.15em;
            fill: currentColor;
          }
          .ant-card-head {
            padding: 0;
          }
        `}
      </style>
      <Sider theme="light">
        <Anchor offsetTop={150}>
          {typeList.map((typeItem) => {
            return (
              <Anchor.Link
                href={`#plugin-category-${typeItem}`}
                title={formatMessage({ id: `component.plugin.${typeItem}` })}
                key={typeItem}
              />
            );
          })}
        </Anchor>
      </Sider>
      <Content style={{ padding: '0 10px', backgroundColor: '#fff', minHeight: 1400 }}>
        {showSelector && (
          <>
            <Form form={form}>
              <Form.Item
                label={formatMessage({ id: 'component.select.pluginTemplate' })}
                name="plugin_config_id"
                shouldUpdate={(prev, next) => {
                  if (prev.plugin_config_id !== next.plugin_config_id) {
                    const id = next.plugin_config_id;
                    if (id) {
                      form.setFieldsValue({
                        plugin_config_id: id,
                      });
                    }
                  }
                  return prev.plugin_config_id !== next.plugin_config_id;
                }}
              >
                <Select
                  data-cy="pluginTemplateSelector"
                  disabled={readonly}
                  onChange={(id) => {
                    form.setFieldsValue({
                      plugin_config_id: id,
                    });
                    onChange(plugins, id as string);
                  }}
                >
                  {[
                    {
                      id: '',
                      desc: formatMessage({
                        id: 'component.step.select.pluginTemplate.select.option',
                      }),
                    },
                    ...pluginTemplateList,
                  ].map((item) => (
                    <Select.Option value={item.id!} key={item.id}>
                      {item.desc}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <Alert
              message={
                <>
                  <p>{formatMessage({ id: 'component.plugin.pluginTemplate.tip1' })}</p>
                  <p>{formatMessage({ id: 'component.plugin.pluginTemplate.tip2' })}</p>
                </>
              }
              type="info"
            />
          </>
        )}
        {(readonly ? newOpenPluginType : typeList).map((typeItem) => {
          return (
            <PanelSection
              title={formatMessage({ id: `component.plugin.${typeItem}` })}
              key={typeItem}
              style={PanelSectionStyle}
              id={`plugin-category-${typeItem}`}
            >
              {orderBy(
                (showEnablePlugin ? enablePluginsList : pluginList).filter(
                  readonly
                    ? (item) => item.type === typeItem && !item.hidden && initialData[item.name]
                    : (item) => item.type === typeItem && !item.hidden,
                ),
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
                      danger={initialData[item.name] && !initialData[item.name].disable}
                      onClick={() => {
                        setName(item.name);
                      }}
                    >
                      {initialData[item.name] && !initialData[item.name].disable
                        ? formatMessage({ id: 'component.plugin.disable' })
                        : formatMessage({ id: 'component.plugin.enable' })}
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
                    alignItems: 'center',
                  }}
                  style={{ width: 200 }}
                >
                  {Boolean(PLUGIN_ICON_LIST[item.name]) && PLUGIN_ICON_LIST[item.name]}
                  {Boolean(!PLUGIN_ICON_LIST[item.name]) && (
                    <img
                      alt="pluginImg"
                      src={defaultPluginImg}
                      style={{ width: 50, height: 50, opacity: 0.2 }}
                    />
                  )}
                </Card>
              ))}
            </PanelSection>
          );
        })}
        <br />
        {formatMessage({ id: 'component.plugin.tip1' })}&nbsp;
        <a
          href="https://apisix.apache.org/docs/dashboard/FAQ#4-after-modifying-the-plugin-schema-or-creating-a-custom-plugin-in-apache-apisix-why-cant-i-find-it-on-the-dashboard"
          target="_blank"
          rel="noreferrer"
        >
          {formatMessage({ id: 'component.plugin.tip2' })}
        </a>
      </Content>
    </>
  );

  const Plugin = () => (
    <PluginDetail
      name={name}
      readonly={readonly}
      type={type}
      visible={name !== NEVER_EXIST_PLUGIN_FLAG}
      schemaType={schemaType}
      initialData={initialData}
      maskClosable={false}
      pluginList={pluginList}
      onClose={() => {
        setName(NEVER_EXIST_PLUGIN_FLAG);
      }}
      onChange={({ monacoData, formData, shouldDelete }) => {
        let newPlugins = {
          ...initialData,
          [name]: { ...monacoData, disable: !formData.disable },
        };
        let handleType = 'edit';
        if (shouldDelete === true) {
          newPlugins = omit(plugins, name);
          handleType = 'delete';
        }
        onChange(newPlugins, form.getFieldValue('plugin_config_id'), handleType);
        setPlugins(newPlugins);
        setName(NEVER_EXIST_PLUGIN_FLAG);
      }}
    />
  );
  return (
    <>
      <style>{`
        .ant-avatar {
          background-color: transparent;
        }
      `}</style>
      {!readonly && <SwitchTab />}
      <Layout>
        <PluginList />
        <Plugin />
      </Layout>
    </>
  );
};

export default PluginPage;
