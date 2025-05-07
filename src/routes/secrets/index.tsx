import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { APISIXType } from '@/types/schema/apisix';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { usePagination } from '@/utils/usePagination';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { getSecretListQueryOptions } from '@/apis/secrets';
import { queryClient } from '@/config/global';

function SecretList() {
  const { t } = useTranslation();

  const { pagination, handlePageChange, updateTotal } = usePagination({
    queryKey: 'secrets',
  });

  const secretsQuery = useSuspenseQuery(getSecretListQueryOptions(pagination));
  const { data, isLoading } = secretsQuery;

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<APISIXType['RespSecretList']['data']['list'][number]>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
        width: 300,
      },
      {
        dataIndex: ['value', 'manager'],
        title: t('form.secrets.manager'),
        key: 'manager',
        valueType: 'text',
        width: 120,
      },
      {
        title: t('actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailPageBtn
            key="detail"
            to="/secrets/detail/$id"
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
        dataSource={data?.list || []}
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
                    to="/secrets/add"
                    label={t('secrets.add.title')}
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
      <PageHeader title={t('navbar.secrets')} />
      <SecretList />
    </>
  );
}

export const Route = createFileRoute('/secrets/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getSecretListQueryOptions(deps)),
});
