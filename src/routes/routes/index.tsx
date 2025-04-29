import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { A6Type } from '@/types/schema/apisix';
import { API_ROUTES } from '@/config/constant';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useMemo } from 'react';

const routesQueryOptions = queryOptions({
  queryKey: ['routes'],
  queryFn: () =>
    req.get<unknown, A6Type['RespRouteList']>(API_ROUTES).then((v) => v.data),
});

const ToCreatePageBtn = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Button component={Link} to={router.routesById['/routes/add'].to}>
      {t('route.add.title')}
    </Button>
  );
};

function RouteComponent() {
  const query = useSuspenseQuery(routesQueryOptions);
  const { data, isLoading } = query;
  const { t } = useTranslation();

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
    <ProTable
      columns={columns}
      dataSource={data.list}
      rowKey="id"
      loading={isLoading}
      search={false}
      options={{
        reload: true,
      }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        total: data.total,
      }}
      toolBarRender={() => [<ToCreatePageBtn key="add" />]}
    />
  );
}

export const Route = createFileRoute('/routes/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(routesQueryOptions),
});
