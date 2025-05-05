import { queryClient } from '@/config/global';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { APISIXType } from '@/types/schema/apisix';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import { ToDetailPageBtn, ToAddPageBtn } from '@/components/page/ToAddPageBtn';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { getStreamRouteListQueryOptions } from '@/apis/stream_routes';
import { usePagination } from '@/utils/usePagination';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import PageHeader from '@/components/page/PageHeader';

const StreamRouteList = () => {
  const { pagination, handlePageChange, updateTotal } = usePagination({
    queryKey: 'stream_routes',
  });

  const query = useSuspenseQuery(getStreamRouteListQueryOptions(pagination));
  const { data, isLoading } = query;
  const { t } = useTranslation();

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<APISIXType['RespStreamRouteItem']>[]
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
        title: t('actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailPageBtn
            key="detail"
            to="/routes/detail/$id"
            id={record.value.id}
          />,
        ],
      },
    ];
  }, [t]);

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
                    label={t('streamRoutes.add.title')}
                    to="/stream_routes/add"
                  />
                ),
              },
            ],
          },
        }}
      />
    </AntdConfigProvider>
  );
};

function StreamRouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t('streamRoutes.title')} />
      <AntdConfigProvider>
        <StreamRouteList />
      </AntdConfigProvider>
    </>
  );
}

export const Route = createFileRoute('/stream_routes/')({
  component: StreamRouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getStreamRouteListQueryOptions(deps)),
});
