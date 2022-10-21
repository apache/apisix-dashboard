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
import { PlusOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, notification, Popconfirm, Space } from 'antd';
import { omit } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { history, useIntl } from 'umi';

import PluginDetail from '@/components/Plugin/PluginDetail';
import usePagination from '@/hooks/usePagination';

import { createOrUpdate, fetchList, fetchPluginList } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [pluginList, setPluginList] = useState<PluginComponent.Meta[]>([]);
  const [name, setName] = useState('');
  const { paginationConfig, savePageList, checkPageList } = usePagination();
  const [pluginId, setPluginId] = useState<string>('');

  useEffect(() => {
    fetchPluginList().then(setPluginList);
  }, []);

  useEffect(() => {
    if (!name) {
      fetchList().then(({ data }) => {
        const plugins: any = {};
        data.forEach(({ name: pluginName, value }) => {
          plugins[pluginName] = value;
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
                setPluginId(record.id);
                createOrUpdate({ plugins })
                  .then(() => {
                    notification.success({
                      message: formatMessage({ id: 'page.plugin.delete' }),
                    });
                    checkPageList(ref);
                    setInitialData(plugins);
                    setName('');
                  })
                  .finally(() => {
                    setPluginId('');
                  });
              }}
              okText={formatMessage({ id: 'component.global.confirm' })}
              cancelText={formatMessage({ id: 'component.global.cancel' })}
            >
              <Button type="primary" danger loading={record.id === pluginId}>
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
      pluginList={pluginList}
      maskClosable={false}
      onClose={() => {
        setVisible(false);
      }}
      onChange={({ formData, monacoData, shouldDelete }) => {
        const disable = !formData.disable;
        let plugins = {
          ...initialData,
          [name]: { ...monacoData, disable },
        };
        if (shouldDelete === true) {
          plugins = omit(plugins, name);
        }
        createOrUpdate({
          plugins,
        }).then(() => {
          setVisible(false);
          setName('');
          ref.current?.reload();
          notification.success({
            message: formatMessage({
              id: `page.plugin.${shouldDelete ? 'delete' : 'edit'}`,
            }),
          });
        });
      }}
    />
  );

  return (
    <PageHeaderWrapper
      title={formatMessage({ id: 'page.plugin.list' })}
      content={formatMessage({ id: 'page.plugin.list.enabled' })}
    >
      <ProTable<PluginModule.TransformedPlugin>
        actionRef={ref}
        rowKey="id"
        search={false}
        columns={columns}
        request={fetchList}
        pagination={{
          onChange: (page, pageSize?) => savePageList(page, pageSize),
          pageSize: paginationConfig.pageSize,
          current: paginationConfig.current,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push('/plugin/market')}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.enable' })}
          </Button>,
        ]}
      />
      <PluginDrawer />
    </PageHeaderWrapper>
  );
};

export default Page;
