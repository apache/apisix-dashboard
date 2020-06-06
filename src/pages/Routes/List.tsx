import React, { useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { history } from 'umi';
import { Button, Popconfirm, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { ListItem } from '@/transforms/global';
import { fetchRouteList, removeRoute } from './service';

const RouteList: React.FC = () => {
  const ref = useRef<ActionType>();

  const columns: ProColumns<ListItem<RouteModule.BaseData>>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      render: (text) => `${new Date(Number(text) * 1000).toLocaleString()}`,
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
              removeRoute(record.id!).then(() => {
                notification.success({ message: '删除路由成功' });
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
    <PageHeaderWrapper>
      <ProTable<ListItem<RouteModule.BaseData>>
        actionRef={ref}
        rowKey="name"
        request={() => fetchRouteList()}
        columns={columns}
        search={false}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/routes/create`)}>
            <PlusOutlined />
            创建
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default RouteList;
