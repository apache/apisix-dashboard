import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/route/add')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/route/create"!</div>;
}
