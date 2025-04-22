import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import { BASE_PATH } from './constant';

export const router = createRouter({ routeTree, basepath: BASE_PATH });

export type Router = typeof router;
