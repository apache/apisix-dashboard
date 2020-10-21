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
import { Button, Switch, Popconfirm, notification, Tag, Input } from 'antd';
import { useIntl, history } from 'umi';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

import { fetchList as fetchSSLList, remove as removeSSL, switchEnable } from '@/pages/SSL/service';

const Page: React.FC = () => {
  const [search, setSearch] = useState('');

  const tableRef = useRef<ActionType>();
  const { formatMessage } = useIntl();

  const onEnableChange = (id: string, checked: boolean) => {
    switchEnable(id, checked)
      .then(() => {
        notification.success({
          message: formatMessage({
            id: 'page.ssl.notification.updateCertEnableStatusSuccessfully',
          }),
        });
      })
      .catch(() => {
        /* eslint-disable no-unused-expressions */
        tableRef.current?.reload();
      });
  };

  const columns: ProColumns<SSLModule.ResSSL>[] = [
    {
      title: 'SNI',
      dataIndex: 'sni',
      render: (_, record) => {
        return record.snis.map((sni) => (
          <Tag color="geekblue" key={sni}>
            {sni}
          </Tag>
        ));
      },
    },
    {
      title: formatMessage({ id: 'page.ssl.list.expirationTime' }),
      dataIndex: 'validity_end',
      hideInSearch: true,
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: formatMessage({ id: 'page.ssl.list.ifEnable' }),
      dataIndex: 'status',
      hideInSearch: true,
      render: (text, record) => (
        <Switch
          defaultChecked={Number(text) === 1}
          onChange={(checked: boolean) => {
            onEnableChange(record.id, checked);
          }}
        />
      ),
    },
    {
      title: formatMessage({ id: 'component.global.updateTime' }),
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              history.push(`/ssl/${record.id}/edit`);
            }}
            style={{ marginRight: 10 }}
          >
            {formatMessage({ id: 'component.global.edit' })}
          </Button>
          <Popconfirm
            title={formatMessage({ id: 'component.global.delete' })}
            onConfirm={() =>
              removeSSL(record.id).then(() => {
                notification.success({
                  message: formatMessage({ id: 'component.ssl.removeSSLSuccess' }),
                });
                /* eslint-disable no-unused-expressions */
                requestAnimationFrame(() => tableRef.current?.reload());
              })
            }
            cancelText={formatMessage({ id: 'component.global.cancel' })}
            okText={formatMessage({ id: 'component.global.confirm' })}
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'component.global.remove' })}
            </Button>
          </Popconfirm>
        </>
      ),
    },
    {
      title: formatMessage({ id: 'page.ssl.list.periodOfValidity' }),
      dataIndex: 'expire_range',
      hideInTable: true,
      hideInSearch: true,
    },
  ];

  return (
    <PageHeaderWrapper
      title={`${formatMessage({ id: 'menu.ssl' })}${formatMessage({
        id: 'component.global.list',
      })}`}
    >
      <ProTable<SSLModule.ResSSL>
        search={false}
        rowKey="id"
        columns={columns}
        actionRef={tableRef}
        request={(params) => fetchSSLList(params, search)}
        toolBarRender={(action) => [
          <Input.Search
            placeholder={formatMessage({ id: 'component.global.pleaseEnter' })}
            onSearch={(value) => {
              setSearch(value);
              action.setPageInfo({ page: 1 });
              action.reload();
            }}
          />,
          <Button type="primary" onClick={() => history.push(`/ssl/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default Page;
