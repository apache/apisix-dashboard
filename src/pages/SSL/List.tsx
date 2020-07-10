import React, { useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Switch, Popconfirm, notification, DatePicker } from 'antd';
import { history, useIntl } from 'umi';
import { PlusOutlined } from '@ant-design/icons';

import { fetchList as fetchSSLList, remove as removeSSL, update as updateSSL } from './service';

const List: React.FC = () => {
  const tableRef = useRef<ActionType>();
  const { formatMessage } = useIntl();

  const onEnableChange = (id: string, checked: boolean) => {
    updateSSL(id, checked)
      .then(() => {
        notification.success({ message: '更新证书启用状态成功' });
      })
      .catch(() => {
        notification.error({ message: '更新证书启用状态失败' });
        /* eslint-disable no-unused-expressions */
        tableRef.current?.reload();
      });
  };

  const columns: ProColumns<SSLModule.ResSSL>[] = [
    {
      title: 'SNI',
      dataIndex: 'sni',
    },
    {
      title: '过期时间',
      dataIndex: 'validity_end',
      hideInSearch: true,
      render: (text) => `${new Date(Number(text) * 1000).toLocaleString()}`,
    },
    {
      title: '是否启用',
      dataIndex: 'status',
      render: (text, record) => (
        <Switch
          defaultChecked={Number(text) === 1}
          onChange={(checked: boolean) => {
            onEnableChange(record.id, checked);
          }}
        />
      ),
      renderFormItem: (_, props) => (
        <Switch onChange={(checked) => props.onChange && props.onChange(Number(checked))} />
      ),
    },
    {
      title: formatMessage({ id: 'component.global.action' }),
      valueType: 'option',
      render: (_, record) => (
        <Popconfirm
          title="删除"
          // TODO: 确认按钮应为红色警告
          onConfirm={() =>
            removeSSL(record.id).then(() => {
              notification.success({
                message: formatMessage({ id: 'component.ssl.removeSSLSuccess' }),
              });
              /* eslint-disable no-unused-expressions */
              requestAnimationFrame(() => tableRef.current?.reload());
            })
          }
        >
          <Button type="primary" danger>
            {formatMessage({ id: 'component.global.remove' })}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: '有效期',
      dataIndex: 'expire_range',
      hideInTable: true,
      renderFormItem: (_, props) => (
        <DatePicker.RangePicker
          onChange={(range) => {
            const from = range?.[0]?.unix();
            const to = range?.[1]?.unix();
            props.onChange && props.onChange(`${from}:${to}`);
          }}
        />
      ),
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<SSLModule.ResSSL>
        request={(params) => fetchSSLList(params)}
        search
        rowKey="id"
        columns={columns}
        actionRef={tableRef}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/ssl/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default List;
