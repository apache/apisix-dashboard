/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useRouter } from '@tanstack/react-router';
import { useCallback, useEffect,useState } from 'react';

import { queryClient } from '@/config/global';
import type { PageSearchType } from '@/types/schema/pageSearch';

type PaginationState = PageSearchType & {
  total: number;
};

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialTotal?: number;
  queryKey: string;
  /** If true, updates URL with pagination state */
  syncWithUrl?: boolean;
}

export interface UsePaginationResult {
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  handlePageChange: (page: number, pageSize: number) => void;
  createQueryKey: (page: number, pageSize: number) => (string | number)[];
  refreshData: () => void;
  updateTotal: (total: number) => void;
}

/**
 * Custom hook for managing pagination state and related operations
 *
 * @param options - Configuration options for pagination
 * @returns Pagination state and handlers
 */
export function usePagination(
  options: UsePaginationOptions
): UsePaginationResult {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialTotal = 0,
    queryKey,
    syncWithUrl = true,
  } = options;

  // Get router for URL integration
  const router = useRouter();
  const routeSearch = router.state.location.search;

  // Initialize pagination from URL if available
  const urlPage =
    syncWithUrl && routeSearch.page
      ? Number(routeSearch.page) || initialPage
      : initialPage;
  const urlPageSize =
    syncWithUrl && routeSearch.pageSize
      ? Number(routeSearch.pageSize) || initialPageSize
      : initialPageSize;

  const [pagination, setPagination] = useState<PaginationState>({
    page: urlPage,
    pageSize: urlPageSize,
    total: initialTotal,
  });

  // Sync URL with state when URL params change
  useEffect(() => {
    if (syncWithUrl) {
      const urlPage = routeSearch.page ? Number(routeSearch.page) || 1 : null;
      const urlPageSize = routeSearch.pageSize
        ? Number(routeSearch.pageSize) || 10
        : null;

      if (
        (urlPage !== null && urlPage !== pagination.page) ||
        (urlPageSize !== null && urlPageSize !== pagination.pageSize)
      ) {
        setPagination((prev) => ({
          ...prev,
          current: urlPage || prev.page,
          pageSize: urlPageSize || prev.pageSize,
        }));
      }
    }
  }, [routeSearch, syncWithUrl, pagination]);

  /**
   * Creates a query key array for React Query based on the given page and pageSize
   */
  const createQueryKey = useCallback(
    (page: number, pageSize: number): (string | number)[] => [
      queryKey,
      page,
      pageSize,
    ],
    [queryKey]
  );

  /**
   * Handles page and page size changes
   */
  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize,
      }));

      // Update URL with new pagination state if enabled
      if (syncWithUrl) {
        router.navigate({
          search: (prev) => {
            // Keep all existing search params
            const newSearch = { ...prev };
            newSearch.page = page;
            newSearch.pageSize = pageSize;
            return newSearch as never;
          },
          replace: true,
        });
      }

      // Invalidate the query to trigger a refetch with new pagination
      queryClient.invalidateQueries({
        queryKey: createQueryKey(page, pageSize),
      });
    },
    [createQueryKey, router, syncWithUrl]
  );

  /**
   * Updates pagination total when data changes
   */
  const updateTotal = useCallback((total: number) => {
    setPagination((prev) => ({ ...prev, total }));
  }, []);

  /**
   * Refreshes current page data
   */
  const refreshData = useCallback(() => {
    const { page, pageSize } = pagination;
    queryClient.invalidateQueries({
      queryKey: createQueryKey(page, pageSize),
    });
  }, [createQueryKey, pagination]);

  return {
    pagination,
    setPagination,
    handlePageChange,
    createQueryKey,
    refreshData,
    updateTotal,
  };
}
