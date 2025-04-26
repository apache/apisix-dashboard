import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/upstreams/detail/$upstreamId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/upstreams/detail/$id"!</div>;
}
