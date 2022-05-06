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
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, notification, Space } from 'antd';
import { history, useIntl } from 'umi';

import { PlusOutlined } from '@ant-design/icons';
import { omit } from 'lodash';
import usePagination from '@/hooks/usePagination';
import { DELETE_FIELDS } from '@/constants';

import { RawDataEditor } from '@/components/RawDataEditor';
import { timestampToLocaleString } from '@/helpers';

import { fetchList, remove, create, update } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [rawData, setRawData] = useState<Record<string, any>>({});
  const [id, setId] = useState('');
  const [editorMode, setEditorMode] = useState<'create' | 'update'>('create');
  const { paginationConfig, savePageList, checkPageList } = usePagination();
  const { formatMessage } = useIntl();

  const columns: ProColumns<UpstreamModule.ResponseBody>[] = [
    {
      title: formatMessage({ id: 'page.upstream.list.id' }),
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'page.upstream.list.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'page.upstream.list.type' }),
      dataIndex: 'type',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'page.upstream.list.description' }),
      dataIndex: 'desc',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'page.upstream.list.edit.time' }),
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => timestampToLocaleString(text as number),
    },
    {
      title: formatMessage({ id: 'page.upstream.list.operation' }),
      valueType: 'option',
      hideInSearch: true,
      render: (_, record) => (
        <Space align="baseline">
          <Button type="primary" onClick={() => history.push(`/upstream/${record.id}/edit`)}>
            {formatMessage({ id: 'page.upstream.list.edit' })}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setId(record.id);
              setRawData(omit(record, DELETE_FIELDS));
              setVisible(true);
              setEditorMode('update');
            }}
          >
            {formatMessage({ id: 'component.global.view' })}
          </Button>
          <Popconfirm
            title={formatMessage({ id: 'page.upstream.list.confirm.delete' })}
            okText={formatMessage({ id: 'page.upstream.list.confirm' })}
            cancelText={formatMessage({ id: 'page.upstream.list.cancel' })}
            onConfirm={() => {
              remove(record.id!).then(() => {
                notification.success({
                  message: formatMessage({ id: 'page.upstream.list.delete.successfully' }),
                });
                checkPageList(ref);
              });
            }}
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'page.upstream.list.delete' })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={formatMessage({ id: 'page.upstream.list' })}
      content={formatMessage({ id: 'page.upstream.list.content' })}
    >
      <ProTable<UpstreamModule.ResponseBody>
        actionRef={ref}
        columns={columns}
        rowKey="id"
        request={fetchList}
        pagination={{
          onChange: (page, pageSize?) => savePageList(page, pageSize),
          pageSize: paginationConfig.pageSize,
          current: paginationConfig.current,
        }}
        search={{
          searchText: formatMessage({ id: 'component.global.search' }),
          resetText: formatMessage({ id: 'component.global.reset' }),
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/upstream/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
          <Button
            type="default"
            onClick={() => {
              setVisible(true);
              setEditorMode('create');
              setRawData({});
            }}
          >
            {formatMessage({ id: 'component.global.data.editor' })}
          </Button>,
        ]}
      />
      <RawDataEditor
        visible={visible}
        type="upstream"
        readonly={false}
        data={rawData}
        onClose={() => {
          setVisible(false);
        }}
        onSubmit={(data: any) => {
          (editorMode === 'create' ? create(data) : update(id, data)).then(() => {
            setVisible(false);
            ref.current?.reload();
          });
        }}
      />
    </PageContainer>
  );
};

export default Page;
