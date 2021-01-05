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
import React, { useEffect, useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history, useIntl } from 'umi';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Popconfirm, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { omit } from 'lodash';

import PluginDetail from '@/components/Plugin/PluginDetail';

import { fetchList, createOrUpdate } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [name, setName] = useState('');

  useEffect(() => {
    if (!name) {
      fetchList().then(({ data }) => {
        const plugins: any = {};
        // eslint-disable-next-line no-shadow
        data.forEach(({ name, value }) => {
          plugins[name] = value;
        });
        setInitialData(plugins);
      });
    }
  }, [name]);

  const columns: ProColumns<PluginModule.TransformedPlugin>[] = [
    {
      title: formatMessage({ id: 'component.global.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Space align="baseline">
            <Button
              type="primary"
              onClick={() => {
                setName(record.name);
                setVisible(true);
              }}
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: 'component.global.edit' })}
            </Button>

            <Popconfirm
              title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
              onConfirm={() => {
                const plugins = omit(initialData, [`${record.name}`]);
                createOrUpdate({ plugins }).then(() => {
                  ref.current?.reload();
                  setName('');
                });
              }}
              okText={formatMessage({ id: 'component.global.confirm' })}
              cancelText={formatMessage({ id: 'component.global.cancel' })}
            >
              <Button type="primary" danger>
                {formatMessage({ id: 'component.global.delete' })}
              </Button>
            </Popconfirm>
          </Space>
        </>
      ),
    },
  ];

  const PluginDrawer = () => (
    <PluginDetail
      name={name}
      readonly={false}
      visible={visible}
      type="global"
      schemaType="route"
      initialData={initialData}
      onClose={() => {
        setVisible(false);
      }}
      onChange={({ formData, codemirrorData }) => {
        const disable = !formData.disable;
        createOrUpdate({
          plugins: {
            ...initialData,
            [name]: { ...codemirrorData, disable },
          },
        }).then(() => {
          setVisible(false);
          setName('');
          ref.current?.reload();
        });
      }}
    />
  );

  return (
    <PageHeaderWrapper
      title={`${formatMessage({ id: 'menu.plugin' })} ${formatMessage({
        id: 'component.global.list',
      })}`}
    >
      <ProTable<PluginModule.TransformedPlugin>
        actionRef={ref}
        rowKey="id"
        search={false}
        columns={columns}
        request={fetchList}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push('/plugin/market')}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
      <PluginDrawer />
    </PageHeaderWrapper>
  );
};

export default Page;
