import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';

import { BASE_PATH } from './constant';

export const router = createRouter({ routeTree, basepath: BASE_PATH });

export type Router = typeof router;

export const queryClient = new QueryClient({});
