import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Popconfirm, Button, notification, Input } from 'antd';
import moment from 'moment';

import { history, useIntl } from 'umi';
import { fetchList, remove } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const [search, setSearch] = useState('');
  const { formatMessage } = useIntl();

  const columns: ProColumns<ConsumerModule.ResEntity>[] = [
    {
      title: formatMessage({ id: 'consumer.list.username' }),
      dataIndex: 'username',
    },
    {
      title: formatMessage({ id: 'consumer.list.description' }),
      dataIndex: 'desc',
    },
    {
      title: formatMessage({ id: 'consumer.list.update.time' }),
      dataIndex: 'update_time',
      render: (text) => `${moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}`,
    },
    {
      title: formatMessage({ id: 'consumer.list.operation' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => history.push(`/consumer/${record.id}/edit`)}
          >
            {formatMessage({ id: 'consumer.list.edit' })}
          </Button>
          <Popconfirm
            title={formatMessage({ id: 'consumer.list.delete.confirm' })}
            okText={formatMessage({ id: 'consumer.list.confirm' })}
            cancelText={formatMessage({ id: 'consumer.list.cancel' })}
            onConfirm={() => {
              remove(record.id).then(() => {
                notification.success({ message: formatMessage({ id: 'consumer.list.delete.success' }) });
                /* eslint-disable no-unused-expressions */
                ref.current?.reload();
              });
            }}
          >
            <Button type="primary" danger>
              {formatMessage({ id: 'consumer.list.delete' })}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <PageContainer title={formatMessage({ id: 'consumer.list.list' })}>
      <ProTable<ConsumerModule.ResEntity>
        actionRef={ref}
        columns={columns}
        rowKey="id"
        search={false}
        request={(params) => fetchList(params, search)}
        toolBarRender={(action) => [
          <Input.Search
            placeholder={formatMessage({ id: 'consumer.list.input' })}
            onSearch={(value) => {
              setSearch(value);
              action.setPageInfo({ page: 1 });
              action.reload();
            }}
          />,
          <Button type="primary" onClick={() => history.push('/consumer/create')}>
            <PlusOutlined />
            {formatMessage({ id: 'consumer.list.create' })}
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Page;
