import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Popconfirm, Button, notification, Input } from 'antd';
import { history } from 'umi';
import moment from 'moment';

import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();

  const [search, setSearch] = useState('');

  const columns: ProColumns<UpstreamModule.ResEntity>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => history.push(`/upstream/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该条记录吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => {
              remove(record.id!).then(() => {
                notification.success({
                  message: '删除记录成功',
                });
                /* eslint-disable no-unused-expressions */
                ref.current?.reload();
              });
            }}
          >
            <Button type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <PageContainer title="上游列表">
      <ProTable<UpstreamModule.ResEntity>
        actionRef={ref}
        columns={columns}
        rowKey="id"
        search={false}
        request={(params) => fetchList(params, search)}
        toolBarRender={(action) => [
          <Input.Search
            placeholder="请输入"
            onSearch={(value) => {
              setSearch(value);
              action.setPageInfo({ page: 1 });
              action.reload();
            }}
          />,
          <Button type="primary" onClick={() => history.push('/upstream/create')}>
            <PlusOutlined />
            创建
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Page;
