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
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, notification } from 'antd';
import { history, useIntl } from 'umi';
import { PlusOutlined } from '@ant-design/icons';
import { timestampToLocaleString } from '@/helpers';

import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();

  const { formatMessage } = useIntl();

  const columns: ProColumns<UpstreamModule.ResponseBody>[] = [
    {
      title: formatMessage({ id: 'upstream.list.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'upstream.list.type' }),
      dataIndex: 'type',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'upstream.list.description' }),
      dataIndex: 'desc',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'upstream.list.edit.time' }),
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => timestampToLocaleString(text as number),
    },
    {
      title: formatMessage({ id: 'upstream.list.operation' }),
      valueType: 'option',
      hideInSearch: true,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => history.push(`/upstream/${record.id}/edit`)}
          >
            {formatMessage({ id: 'upstream.list.edit' })}
          </Button>
          <Popconfirm
            title={formatMessage({ id: 'upstream.list.confirm.delete' })}
            okText={formatMessage({ id: 'upstream.list.confirm' })}
            cancelText={formatMessage({ id: 'upstream.list.cancel' })}
            onConfirm={() => {
              remove(record.id!).then(() => {
                notification.success({
                  message: formatMessage({ id: 'upstream.list.delete.successfully' }),
                });
                /* eslint-disable no-unused-expressions */
                ref.current?.reload();
              });
            }}
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'upstream.list.delete' })}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <PageContainer title={formatMessage({ id: 'upstream.list' })}>
      <ProTable<UpstreamModule.ResponseBody>
        actionRef={ref}
        columns={columns}
        rowKey="id"
        request={fetchList}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/upstream/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Page;
