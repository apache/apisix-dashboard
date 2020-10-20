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
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Popconfirm, Button, notification, Input } from 'antd';
import { history, useIntl } from 'umi';
import moment from 'moment';

import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();

  const [search, setSearch] = useState('');
  const { formatMessage } = useIntl();

  const columns: ProColumns<RouteGroupModule.RouteGroupEntity>[] = [
    {
      title: formatMessage({ id: 'component.global.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'component.global.description' }),
      dataIndex: 'description',
    },
    {
      title: formatMessage({ id: 'component.global.editTime' }),
      dataIndex: 'update_time',
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => history.push(`/routegroup/${record.id}/edit`)}
          >
            {formatMessage({ id: 'component.global.edit' })}
          </Button>
          <Popconfirm
            title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
            okText={formatMessage({ id: 'component.global.confirm' })}
            cancelText={formatMessage({ id: 'component.global.cancel' })}
            onConfirm={() => {
              remove(record.id!).then(() => {
                notification.success({
                  message: `${formatMessage({ id: 'component.global.delete' })} ${formatMessage({
                    id: 'menu.routegroup',
                  })} ${formatMessage({ id: 'component.status.success' })}`,
                });
                /* eslint-disable no-unused-expressions */
                ref.current?.reload();
              });
            }}
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'component.global.delete' })}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <PageContainer
      title={`${formatMessage({ id: 'menu.routegroup' })}${formatMessage({
        id: 'component.global.list',
      })}`}
    >
      <ProTable<RouteGroupModule.RouteGroupEntity>
        actionRef={ref}
        columns={columns}
        rowKey="id"
        search={false}
        request={(params) => fetchList(params, search)}
        toolBarRender={(action) => [
          <Input.Search
            placeholder={formatMessage({ id: 'component.global.pleaseEnter' })}
            onSearch={(value) => {
              setSearch(value);
              action.setPageInfo({ page: 1 });
              action.reload();
            }}
          />,
          <Button type="primary" onClick={() => history.push('/routegroup/create')}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Page;
