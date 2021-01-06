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
import { history, useIntl } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, notification, Popconfirm, Space } from 'antd';

import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();

  const columns: ProColumns<ServiceModule.ResponseBody>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'component.global.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'component.global.description' }),
      dataIndex: 'desc',
      hideInSearch: true
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      hideInSearch: true,
      render: (_, record) => (
        <>
          <Space align="baseline">
            <Button
              type="primary"
              onClick={() => history.push(`/service/${record.id}/edit`)}
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: 'component.global.edit' })}
            </Button>
            <Popconfirm
              title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
              onConfirm={() => {
                remove(record.id!).then(() => {
                  notification.success({
                    message: `${formatMessage({ id: 'component.global.delete' })} ${formatMessage({
                      id: 'menu.service',
                    })} ${formatMessage({ id: 'component.status.success' })}`,
                  });
                  /* eslint-disable no-unused-expressions */
                  ref.current?.reload();
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

  return (
    <PageHeaderWrapper
      title={`${formatMessage({ id: 'menu.service' })} ${formatMessage({
        id: 'component.global.list',
      })}`}
    >
      <ProTable<ServiceModule.ResponseBody>
        actionRef={ref}
        rowKey="id"
        columns={columns}
        request={fetchList}
        search={{
          searchText: formatMessage({ id: 'component.global.search' }),
          resetText: formatMessage({ id: 'component.global.reset' }),
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/service/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default Page;
