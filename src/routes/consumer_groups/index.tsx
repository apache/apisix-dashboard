import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getConsumerGroupListQueryOptions } from '@/apis/consumer_groups';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_CONSUMER_GROUPS } from '@/config/constant';
import { queryClient } from '@/config/global';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { usePagination } from '@/utils/usePagination';

function ConsumerGroupsList() {
  const { t } = useTranslation();

  const { pagination, handlePageChange, updateTotal } = usePagination({
    queryKey: 'consumer_groups',
  });

  const consumerGroupsQuery = useSuspenseQuery(
    getConsumerGroupListQueryOptions(pagination)
  );
  const { data, isLoading, refetch } = consumerGroupsQuery;

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<APISIXType['RespConsumerGroupItem']>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'name'],
        title: t('form.basic.name'),
        key: 'name',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'desc'],
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('form.info.update_time'),
        key: 'update_time',
        valueType: 'dateTime',
        sorter: true,
        renderText: (text) => {
          if (!text) return '-';
          return new Date(Number(text) * 1000).toISOString();
        },
      },
      {
        title: t('actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailPageBtn
            key="detail"
            to="/consumer_groups/detail/$id"
            params={{ id: record.value.id }}
          />,
          <DeleteResourceBtn
            key="delete"
            name={t('consumerGroups.singular')}
            target={record.value.id}
            api={`${API_CONSUMER_GROUPS}/${record.value.id}`}
            onSuccess={refetch}
          />,
        ],
      },
    ];
  }, [refetch, t]);

  return (
    <AntdConfigProvider>
      <ProTable
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={isLoading}
        search={false}
        options={false}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: handlePageChange,
        }}
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolbar={{
          menu: {
            type: 'inline',
            items: [
              {
                key: 'add',
                label: (
                  <ToAddPageBtn
                    key="add"
                    to="/consumer_groups/add"
                    label={t('consumerGroups.add.title')}
                  />
                ),
              },
            ],
          },
        }}
      />
    </AntdConfigProvider>
  );
}

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('navbar.consumerGroups')} />
      <ConsumerGroupsList />
    </>
  );
}

export const Route = createFileRoute('/consumer_groups/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getConsumerGroupListQueryOptions(deps)),
});
