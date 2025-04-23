import { router } from '@/config/global';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
