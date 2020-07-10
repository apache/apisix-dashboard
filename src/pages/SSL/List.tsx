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
        notification.success({ message: '更新证书启用状态成功' });
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
      title: '过期时间',
      dataIndex: 'validity_end',
      hideInSearch: true,
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: '是否启用',
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
      title: '更新时间',
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: formatMessage({ id: 'component.global.action' }),
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
            编辑
          </Button>
          <Popconfirm
            title="删除"
            onConfirm={() =>
              removeSSL(record.id).then(() => {
                notification.success({
                  message: formatMessage({ id: 'component.ssl.removeSSLSuccess' }),
                });
                /* eslint-disable no-unused-expressions */
                requestAnimationFrame(() => tableRef.current?.reload());
              })
            }
            cancelText="取消"
            okText="确定"
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'component.global.remove' })}
            </Button>
          </Popconfirm>
        </>
      ),
    },
    {
      title: '有效期',
      dataIndex: 'expire_range',
      hideInTable: true,
      hideInSearch: true,
    },
  ];

  return (
    <PageHeaderWrapper title="证书列表">
      <ProTable<SSLModule.ResSSL>
        search={false}
        rowKey="id"
        columns={columns}
        actionRef={tableRef}
        request={(params) => fetchSSLList(params, search)}
        toolBarRender={(action) => [
          <Input.Search
            placeholder="请输入"
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
