import React, { useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Popconfirm, notification, Tag, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { history } from 'umi';

import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const [search, setSearch] = useState('');

  const columns: ProColumns<RouteModule.BaseData>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '域名',
      dataIndex: 'hosts',
      render: (_, record) =>
        record.hosts.map((host) => (
          <Tag key={host} color="geekblue">
            {host}
          </Tag>
        )),
    },
    {
      title: '路径',
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
            onClick={() => history.push(`/routes/${record.id}/edit`)}
            style={{ marginRight: 10 }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该路由吗？"
            onConfirm={() => {
              remove(record.id!).then(() => {
                notification.success({ message: '删除记录成功' });
                /* eslint-disable no-unused-expressions */
                ref.current?.reload();
              });
            }}
            okText="确定"
            cancelText="取消"
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
    <PageHeaderWrapper title="路由列表">
      <ProTable<RouteModule.BaseData>
        actionRef={ref}
        rowKey="name"
        columns={columns}
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
          <Button type="primary" onClick={() => history.push('/routes/create')}>
            <PlusOutlined />
            创建
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default Page;
