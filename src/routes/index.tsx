import { createFileRoute, redirect } from '@tanstack/react-router';

import { navRoutes } from '@/config/navRoutes';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    return redirect({
      to: navRoutes[0].to,
    });
  },
});
