import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/global-rules/detail/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/global-rules/detail/$id"!</div>;
}
