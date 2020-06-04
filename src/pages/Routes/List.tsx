import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';

import { ListItem } from '@/transforms/global';

const RouteList: React.FC = () => {
  const columns: ProColumns<ListItem<RouteModule.BaseData>>[] = [
    {
      title: 'ID',
      dataIndex: 'displayKey',
      sortOrder: 'descend',
      hideInSearch: true,
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem<RouteModule.BaseData>> columns={columns} search={false} />
    </PageHeaderWrapper>
  );
};

export default RouteList;
