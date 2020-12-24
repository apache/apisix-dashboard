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
import React, { useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history, useIntl } from 'umi';

import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Popconfirm, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchList } from './service';


const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl()

  const columns: ProColumns<PluginModule.TansformResponse>[] = [
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
              onClick={() => { console.log('edit rule'); }}
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: 'component.global.edit' })}
            </Button>

            <Popconfirm
              title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
              onConfirm={() => {
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
  ]

  return (
    <PageHeaderWrapper
      title={`${formatMessage({ id: 'menu.plugin' })} ${formatMessage({
        id: 'component.global.list',
      })}`}>
      <ProTable<PluginModule.TansformResponse>
        actionRef={ref}
        rowKey="id"
        search={false}
        columns={columns}
        request={fetchList}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push('/plugin/config')}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>
        ]}
      />
    </PageHeaderWrapper>)
}

export default Page;