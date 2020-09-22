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
import React, { useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Popconfirm, notification, Tag, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { history, useIntl } from 'umi';

import { fetchList, offline, publish, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const [search, setSearch] = useState('');
  const { formatMessage } = useIntl();

  const columns: ProColumns<RouteModule.BaseData>[] = [
    {
      title: formatMessage({ id: 'route.list.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'route.list.domain.name' }),
      dataIndex: 'hosts',
      render: (_, record) =>
        (record.hosts || []).map((host) => (
          <Tag key={host} color="geekblue">
            {host}
          </Tag>
        )),
    },
    {
      title: formatMessage({ id: 'route.list.path' }),
      dataIndex: 'uri',
      render: (_, record) =>
        record.uris.map((uri) => (
          <Tag key={uri} color="geekblue">
            {uri}
          </Tag>
        )),
    },
    // {
    //   title: '优先级',
    //   dataIndex: 'priority',
    // },
    {
      title: formatMessage({ id: 'route.list.description' }),
      dataIndex: 'description',
    },
    {
      title: formatMessage({ id: 'route.list.group.name' }),
      dataIndex: 'route_group_name',
    },
    {
      title: formatMessage({ id: 'route.list.status' }),
      dataIndex: 'status',
      render: (_, record) => (
        <>
          {record.status ? (
            <Tag color="green">{formatMessage({ id: 'route.list.status.publish' })}</Tag>
          ) : (
            <Tag color="red">{formatMessage({ id: 'route.list.status.offline' })}</Tag>
          )}
        </>
      ),
    },
    {
      title: formatMessage({ id: 'route.list.edit.time' }),
      dataIndex: 'update_time',
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: formatMessage({ id: 'route.list.operation' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Space align="baseline">
            <Button
              type="primary"
              onClick={() => {
                publish(record.id!).then(() => {
                  notification.success({
                    message: formatMessage({ id: 'route.list.publish.success' }),
                  });
                  /* eslint-disable no-unused-expressions */
                  ref.current?.reload();
                });
              }}
              style={{ marginRight: 10 }}
              disabled={record.status}
            >
              {formatMessage({ id: 'route.list.publish' })}
            </Button>
            <Button
              type="primary"
              onClick={() => history.push(`/routes/${record.id}/edit`)}
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: 'route.list.edit' })}
            </Button>
            <Button
              type="primary"
              onClick={() => history.push(`/routes/${record.id}/debug`)}
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: 'route.list.debug' })}
            </Button>
            <Popconfirm
              title={formatMessage({ id: 'route.list.offline.confirm' })}
              onConfirm={() => {
                offline(record.id!).then(() => {
                  notification.success({
                    message: formatMessage({ id: 'route.list.offline.success' }),
                  });
                  /* eslint-disable no-unused-expressions */
                  ref.current?.reload();
                });
              }}
              okText={formatMessage({ id: 'route.list.offline' })}
              cancelText={formatMessage({ id: 'route.list.cancel' })}
            >
              <Button type="primary" danger disabled={!record.status}>
                {formatMessage({ id: 'route.list.offline' })}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={formatMessage({ id: 'route.list.delete.confrim' })}
              onConfirm={() => {
                remove(record.id!).then(() => {
                  notification.success({
                    message: formatMessage({ id: 'route.list.delete.success' }),
                  });
                  /* eslint-disable no-unused-expressions */
                  ref.current?.reload();
                });
              }}
              okText={formatMessage({ id: 'route.list.confirm' })}
              cancelText={formatMessage({ id: 'route.list.cancel' })}
            >
              <Button type="primary" danger>
                {formatMessage({ id: 'route.list.delete' })}
              </Button>
            </Popconfirm>
          </Space>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper title={formatMessage({ id: 'route.list' })}>
      <ProTable<RouteModule.BaseData>
        actionRef={ref}
        rowKey="name"
        columns={columns}
        search={false}
        request={(params) => fetchList(params, search)}
        toolBarRender={(action) => [
          <Input.Search
            placeholder={formatMessage({ id: 'route.list.input' })}
            onSearch={(value) => {
              setSearch(value);
              action.setPageInfo({ page: 1 });
              action.reload();
            }}
          />,
          <Button type="primary" onClick={() => history.push('/routes/create')}>
            <PlusOutlined />
            {formatMessage({ id: 'route.list.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default Page;
