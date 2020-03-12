import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { fetchList as fetchSSLList } from '@/services/ssl';
import { SSL } from '@/models/ssl';
import { ListItem } from '@/transforms/global';

const List: React.FC = () => {
  const columns: ProColumns<ListItem<SSL>>[] = [
    {
      title: 'ID',
      dataIndex: 'displayKey',
    },
    {
      title: 'SNI',
      dataIndex: ['value', 'sni'],
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem<SSL>> request={() => fetchSSLList()} search={false} columns={columns} />
    </PageHeaderWrapper>
  );
};

export default List;
