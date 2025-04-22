import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/service/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/service/"!</div>;
}
