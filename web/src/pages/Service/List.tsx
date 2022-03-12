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
import { history, useIntl } from 'umi';
import usePagination from '@/hooks/usePagination';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, notification, Popconfirm, Space } from 'antd';
import { omit } from 'lodash';

import { DELETE_FIELDS } from '@/constants';
import { RawDataEditor } from '@/components/RawDataEditor';
import { fetchList, remove, create, update } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [rawData, setRawData] = useState<Record<string, any>>({});
  const [id, setId] = useState('');
  const [editorMode, setEditorMode] = useState<'create' | 'update'>('create');
  const { paginationConfig, savePageList, checkPageList } = usePagination();

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
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      hideInSearch: true,
      render: (_, record) => (
        <>
          <Space align="baseline">
            <Button type="primary" onClick={() => history.push(`/service/${record.id}/edit`)}>
              {formatMessage({ id: 'component.global.edit' })}
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
              title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
              onConfirm={() => {
                remove(record.id!).then(() => {
                  notification.success({
                    message: `${formatMessage({ id: 'component.global.delete' })} ${formatMessage({
                      id: 'menu.service',
                    })} ${formatMessage({ id: 'component.status.success' })}`,
                  });
                  checkPageList(ref);
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
      title={formatMessage({ id: 'page.service.list' })}
      content={formatMessage({ id: 'page.service.description' })}
    >
      <ProTable<ServiceModule.ResponseBody>
        actionRef={ref}
        rowKey="id"
        columns={columns}
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
          <Button type="primary" onClick={() => history.push(`/service/create`)}>
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
        type="service"
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
    </PageHeaderWrapper>
  );
};

export default Page;
