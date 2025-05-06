import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSuspenseQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useMemo } from 'react';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import type { APISIXType } from '@/types/schema/apisix';
import { queryClient } from '@/config/global';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { getCredentialListQueryOptions } from '@/apis/credentials';

function CredentialsList() {
  const { t } = useTranslation();
  const { username } = useParams({
    from: '/consumers/detail/$username/credentials/',
  });

  const credentialsQuery = useSuspenseQuery(
    getCredentialListQueryOptions({ username })
  );
  const { data, isLoading } = credentialsQuery;

  const columns = useMemo<
    ProColumns<APISIXType['RespCredentialItem']>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
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
            to="/consumers/detail/$username/credentials/detail/$id"
            params={{
              username: username as string,
              id: record.value.id,
            }}
          />,
        ],
      },
    ];
  }, [t, username]);

  return (
    <AntdConfigProvider>
      <ProTable
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={isLoading}
        search={false}
        options={false}
        pagination={false}
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
                    to="/consumers/detail/$username/credentials/add"
                    params={{ username }}
                    label={t('consumers.credentials.add.title')}
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
      <DetailCredentialsTabs />
      <PageHeader title={t('consumers.credentials.title')} />
      <CredentialsList />
    </>
  );
}

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/'
)({
  component: RouteComponent,
  loader: ({ params }) =>
    queryClient.ensureQueryData(getCredentialListQueryOptions(params)),
});
