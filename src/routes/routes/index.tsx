import { queryClient } from '@/config/global';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { A6Type } from '@/types/schema/apisix';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import ToAddPageBtn from '@/components/page/ToAddPageBtn';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { getRouteListQueryOptions } from '@/apis/routes';
import { usePagination } from '@/utils/usePagination';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import PageHeader from '@/components/page/PageHeader';

const RouteList = () => {
  const { pagination, handlePageChange, updateTotal } = usePagination({
    queryKey: 'routes',
  });

  const query = useSuspenseQuery(getRouteListQueryOptions(pagination));
  const { data, isLoading } = query;
  const { t } = useTranslation();

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<A6Type['RespRouteList']['data']['list'][number]>[]
  >(() => {
    return [
      {
        dataIndex: 'id',
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: 'name',
        title: t('form.basic.name'),
        key: 'name',
        valueType: 'text',
      },
      {
        dataIndex: 'desc',
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        dataIndex: 'uri',
        title: 'URI',
        key: 'uri',
        valueType: 'text',
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
                    label={t('route.add.title')}
                    to="/routes/add"
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

function RouteComponent() {
  return (
    <>
      <PageHeader title="Routes" />
      <AntdConfigProvider>
        <RouteList />
      </AntdConfigProvider>
    </>
  );
}

export const Route = createFileRoute('/routes/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getRouteListQueryOptions(deps)),
});
