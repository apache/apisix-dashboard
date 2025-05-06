import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <DetailCredentialsTabs />
      <div>Hello "/consumers/detail/$username/credentials/"!</div>
    </>
  );
}
