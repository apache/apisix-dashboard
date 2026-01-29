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
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';

type SetParamsFunction = (params: { name?: string; page?: number }) => void;

/**
 * Custom hook for table search functionality with debouncing.
 * Provides consistent search behavior across all table views.
 *
 * @param setParams - Function to update the search parameters
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export const useTableSearch = (setParams: SetParamsFunction, debounceMs = 300) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useDebouncedCallback((value: string) => {
    setParams({ name: value || undefined, page: 1 });
  }, debounceMs);

  const handleClear = () => {
    setSearchValue('');
    setParams({ name: undefined });
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };

  return {
    searchValue,
    handleChange,
    handleClear,
  };
};
