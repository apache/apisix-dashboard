import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import type { AxiosResponse } from 'axios';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { A6 } from '@/types/schema/apisix';

const routesQueryOptions = queryOptions({
  queryKey: ['routes'],
  queryFn: () =>
    req
      .get<unknown, AxiosResponse<A6.ListResponse<A6.Route>>>('/routes')
      .then((v) => v.data),
});

const ToCreatePageBtn = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Button component={Link} to={router.routesById['/route/add'].to}>
      {t('route.add')}
    </Button>
  );
};

function RouteComponent() {
  const { data } = useSuspenseQuery(routesQueryOptions);
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

export const Route = createFileRoute('/route/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(routesQueryOptions),
});
