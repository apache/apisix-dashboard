import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { A6Type } from '@/types/schema/apisix';
import { API_UPSTREAMS } from '@/config/constant';

const upstreamsQueryOptions = queryOptions({
  queryKey: ['upstreams'],
  queryFn: () =>
    req
      .get<unknown, A6Type['RespUpstreamList']>(API_UPSTREAMS)
      .then((v) => v.data),
});

const ToCreatePageBtn = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Button component={Link} to={router.routesById['/upstreams/add'].to}>
      {t('upstreams.add.title')}
    </Button>
  );
};

function RouteComponent() {
  const { data } = useSuspenseQuery(upstreamsQueryOptions);
  return (
    <>
      <ToCreatePageBtn />
      {data.total === 0 ? (
        <div>Empty</div>
      ) : (
        <div>{JSON.stringify(data.list, null, 2)}</div>
      )}
    </>
  );
}

export const Route = createFileRoute('/upstreams/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(upstreamsQueryOptions),
});
