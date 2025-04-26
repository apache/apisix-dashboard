import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { A6Type } from '@/types/schema/apisix';
import { API_UPSTREAMS } from '@/config/constant';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useMemo } from 'react';
import PageHeader from '@/components/page/PageHeader';
import { RouteLinkBtn } from '@/components/Btn';
import IconPlus from '~icons/material-symbols/add';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
const upstreamsQueryOptions = queryOptions({
  queryKey: ['upstreams'],
  queryFn: () =>
    req
      .get<unknown, A6Type['RespUpstreamList']>(API_UPSTREAMS)
      .then((v) => v.data),
});

const ToAddPageBtn = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <RouteLinkBtn
      leftSection={<IconPlus />}
      size="compact-sm"
      variant="gradient"
      to={router.routesById['/upstreams/add'].to}
    >
      {t('upstreams.add.title')}
    </RouteLinkBtn>
  );
};

type UpstreamItem = A6Type['RespUpstreamList']['data']['list'][number];
type DetailPageBtnProps = {
  record: UpstreamItem;
};
const DetailPageBtn = (props: DetailPageBtnProps) => {
  const { record } = props;
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <>
      <RouteLinkBtn
        size="xs"
        variant="transparent"
        to={router.routesById['/upstreams/detail/$upstreamId'].to}
        params={{ upstreamId: record.value.id }}
      >
        {t('view')}
      </RouteLinkBtn>
    </>
  );
};

function RouteComponent() {
  const query = useSuspenseQuery(upstreamsQueryOptions);
  const { data, isLoading } = query;
  const { t } = useTranslation();

  const columns = useMemo<
    ProColumns<A6Type['RespUpstreamList']['data']['list'][number]>[]
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
        dataIndex: ['value', 'labels'],
        title: t('form.basic.labels.title'),
        key: 'labels',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'scheme'],
        title: t('form.upstream.scheme'),
        key: 'scheme',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('form.upstream.updateTime'),
        key: 'update_time',
        valueType: 'dateTime',
        sorter: true,
        renderText: (text) => {
          if (!text) return '-';
          // 将 Unix 时间戳（秒级）转换为毫秒级时间戳，以便正确显示
          return new Date(Number(text) * 1000).toISOString();
        },
      },
      {
        title: t('actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [<DetailPageBtn key="detail" record={record} />],
      },
    ];
  }, [t]);

  return (
    <>
      <PageHeader title={t('upstreams.title')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data?.list}
          rowKey="id"
          loading={isLoading}
          search={false}
          options={{
            reload: true,
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          cardProps={{ bodyStyle: { padding: 0 } }}
          toolbar={{
            menu: {
              type: 'inline',
              items: [
                {
                  key: 'add',
                  label: <ToAddPageBtn key="add" />,
                },
              ],
            },
          }}
        />
      </AntdConfigProvider>
    </>
  );
}

export const Route = createFileRoute('/upstreams/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(upstreamsQueryOptions),
});
