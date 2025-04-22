import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/route/create')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/route/create"!</div>;
}
