import { req } from '@/api/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AxiosResponse } from 'axios';

const routesQueryOptions = queryOptions({
  queryKey: ['routes'],
  queryFn: () =>
    req
      .get<unknown, AxiosResponse<A6.ListResponse<A6.Route>>>('/routes')
      .then((v) => v.data),
});

export const Route = createFileRoute('/route/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(routesQueryOptions),
});

function RouteComponent() {
  const { data } = useSuspenseQuery(routesQueryOptions);
  if (data.total === 0) {
    return <div>Empty</div>;
  }
  return <div>{JSON.stringify(data.list, null, 2)}</div>;
}
