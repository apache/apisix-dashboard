import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/services/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/service/"!</div>;
}
