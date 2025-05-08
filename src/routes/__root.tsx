import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useLocalStorage } from '@mantine/hooks';
import { LOCAL_STORAGE_ADMIN_KEY } from '@/config/constant';
import { Layout } from '@/components/page/Layout';

const RouteRenderer = () => {
  const [authExists] = useLocalStorage({
    key: LOCAL_STORAGE_ADMIN_KEY,
  });

  if (authExists) return <Outlet />;
  return null;
};

const Root = () => {
  return (
    <Layout>
      <RouteRenderer />
    </Layout>
  );
};

export const Route = createRootRoute({
  component: Root,
});
