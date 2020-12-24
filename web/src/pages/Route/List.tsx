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
import { Button, Popconfirm, notification, Tag, Space } from 'antd';
import { history, useIntl } from 'umi';
import { PlusOutlined, BugOutlined } from '@ant-design/icons';
import { timestampToLocaleString } from '@/helpers';

import { fetchList, remove, updateRouteStatus } from './service';
import { DebugDrawView } from './components/DebugViews';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();

  enum RouteStatus {
    Offline = 0,
    Publish,
  }

  const handleTableActionSuccessResponse = (msgTip: string) => {
    notification.success({
      message: msgTip,
    });

    ref.current?.reload();
  };

  const handlePublishOffline = (rid: string, status: RouteModule.RouteStatus) => {
    updateRouteStatus(rid, status).then(() => {
      const actionName = status ? formatMessage({ id: 'page.route.publish' }) : formatMessage({ id: 'page.route.offline' })
      handleTableActionSuccessResponse(
        `${actionName} ${formatMessage({
          id: 'menu.routes',
        })} ${formatMessage({ id: 'component.status.success' })}`,
      );
    });
  }

  const [debugDrawVisible, setDebugDrawVisible] = useState(false);

  const columns: ProColumns<RouteModule.ResponseBody>[] = [
    {
      title: formatMessage({ id: 'component.global.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'page.route.domainName' }),
      hideInSearch: true,
      render: (_, record) => {
        const list = record.hosts || (record.host && [record.host]) || [];

        return list.map((item) => (
          <Tag key={item} color="geekblue">
            {item}
          </Tag>
        ));
      },
    },
    {
      title: formatMessage({ id: 'page.route.path' }),
      render: (_, record) => {
        const list = record.uris || (record.uri && [record.uri]) || [];

        return list.map((item) => (
          <Tag key={item} color="geekblue">
            {item}
          </Tag>
        ));
      },
    },
    {
      title: formatMessage({ id: 'component.global.description' }),
      dataIndex: 'desc',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'page.route.status' }),
      dataIndex: 'status',
      render: (_, record) => (
        <>
          {record.status ? (
            <Tag color="green">{formatMessage({ id: 'page.route.published' })}</Tag>
          ) : (
            <Tag color="red">{formatMessage({ id: 'page.route.unpublished' })}</Tag>
          )}
        </>
      ),
    },
    {
      title: formatMessage({ id: 'component.global.updateTime' }),
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => timestampToLocaleString(text as number),
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
              onClick={() => history.push(`/routes/${record.id}/edit`)}
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: 'component.global.edit' })}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handlePublishOffline(record.id, RouteStatus.Publish)
              }}
              style={{ marginRight: 10 }}
              disabled={Boolean(record.status)}
            >
              {formatMessage({ id: 'page.route.publish' })}
            </Button>
            <Popconfirm
              title={formatMessage({ id: 'page.route.popconfirm.title.offline' })}
              onConfirm={() => {
                handlePublishOffline(record.id, RouteStatus.Offline)
              }}
              okText={formatMessage({ id: 'component.global.confirm' })}
              cancelText={formatMessage({ id: 'component.global.cancel' })}
              disabled={Boolean(!record.status)}
            >
              <Button type="primary" danger disabled={Boolean(!record.status)}>
                {formatMessage({ id: 'page.route.offline' })}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
              onConfirm={() => {
                remove(record.id!).then(() => {
                  handleTableActionSuccessResponse(
                    `${formatMessage({ id: 'component.global.delete' })} ${formatMessage({
                      id: 'menu.routes',
                    })} ${formatMessage({ id: 'component.status.success' })}`,
                  );
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
      title={`${formatMessage({ id: 'menu.routes' })} ${formatMessage({
        id: 'component.global.list',
      })}`}
    >
      <ProTable<RouteModule.ResponseBody>
        actionRef={ref}
        rowKey="id"
        columns={columns}
        request={fetchList}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/routes/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
          <Button type="primary" onClick={() => setDebugDrawVisible(true)}>
            <BugOutlined />
            {formatMessage({ id: 'page.route.onlineDebug' })}
          </Button>,
        ]}
      />
      <DebugDrawView
        visible={debugDrawVisible}
        onClose={() => {
          setDebugDrawVisible(false);
        }}
      />
    </PageHeaderWrapper>
  );
};

export default Page;
