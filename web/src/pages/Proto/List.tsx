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
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProtoDrawer from './components/ProtoDrawer';
import { Button, notification, Popconfirm, Space } from 'antd';
import { useIntl } from 'umi';
import usePagination from '@/hooks/usePagination';

import { PlusOutlined } from '@ant-design/icons';

import { timestampToLocaleString } from '@/helpers';
import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { paginationConfig, savePageList, checkPageList } = usePagination();
  const emptyProtoData = {
    id: null,
    content: '',
    desc: '',
  };
  const [protoData, setProtoData] = useState<ProtoModule.ProtoData>(emptyProtoData);
  const [editMode, setEditMode] = useState<ProtoModule.EditMode>('create');

  const refreshTable = () => {
    ref.current?.reload();
  };

  const showDrawer = (data: ProtoModule.ProtoData, mode: ProtoModule.EditMode) => {
    setDrawerVisible(true);
    setProtoData(data);
    setEditMode(mode);
  };

  const columns: ProColumns<ProtoModule.ResponseBody>[] = [
    {
      title: formatMessage({ id: 'component.global.id' }),
      hideInSearch: true,
      dataIndex: 'id',
      width: 100,
    },
    {
      title: formatMessage({ id: 'page.proto.desc' }),
      dataIndex: 'desc',
      ellipsis: true,
      width: 200,
    },
    {
      title: formatMessage({ id: 'page.proto.content' }),
      hideInSearch: true,
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: formatMessage({ id: 'component.global.updateTime' }),
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => timestampToLocaleString(text as number),
      width: 200,
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <Space align="baseline">
          <Button
            type="primary"
            onClick={() =>
              showDrawer({ id: record.id, content: record.content, desc: record.desc }, 'update')
            }
          >
            {formatMessage({ id: 'component.global.edit' })}
          </Button>
          <Popconfirm
            title={formatMessage({ id: 'page.proto.list.confirm.delete' })}
            okText={formatMessage({ id: 'page.proto.list.confirm' })}
            cancelText={formatMessage({ id: 'page.proto.list.cancel' })}
            onConfirm={() => {
              remove(record.id).then(() => {
                notification.success({
                  message: formatMessage({ id: 'page.proto.list.delete.successfully' }),
                });
                checkPageList(ref);
              });
            }}
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'page.proto.list.delete' })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageHeaderWrapper
      title={formatMessage({ id: 'page.proto.list' })}
      content={formatMessage({ id: 'page.proto.list.description' })}
    >
      <ProtoDrawer
        protoData={protoData as ProtoModule.ProtoData}
        setProtoData={setProtoData}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        editMode={editMode}
        refreshTable={refreshTable}
      />
      <ProTable<ProtoModule.ResponseBody>
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
          <Button type="primary" onClick={() => showDrawer(emptyProtoData, 'create')}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
        tableAlertRender={false}
        scroll={{ x: 1300 }}
      />
    </PageHeaderWrapper>
  );
};

export default Page;
