import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import { BASE_PATH } from './constant';
import { QueryClient } from '@tanstack/react-query';

export const router = createRouter({ routeTree, basepath: BASE_PATH });

export type Router = typeof router;

export const queryClient = new QueryClient({});
