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
import { Button, Code, Stack, Text } from '@mantine/core';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useResetQueryError } from '@/hooks/useResetQueryError';

/**
 * The app's generic error state: the message plus a Retry that re-runs the
 * failed load. Shared so a route-level error component offers the same
 * affordance the root one does (#3418) — a detail route that handled its
 * own errors with TanStack's bare `ErrorComponent` would silently drop the
 * Retry button.
 */
export const PageError = (props: ErrorComponentProps) => {
  const { error } = props;
  const { t } = useTranslation();
  const router = useRouter();
  // detail pages throw from useSuspenseQuery during render; unless the
  // query error-reset boundary is reset, react-query re-throws the cached
  // error on remount and the Retry button would loop back here
  useResetQueryError(error);
  return (
    <Stack align="center" justify="center" mih="60vh" gap="md" p="xl">
      <Text fw={700} size="lg">
        {t('error.title')}
      </Text>
      <Code block>{error.message}</Code>
      <Button onClick={() => router.invalidate()}>{t('error.retry')}</Button>
    </Stack>
  );
};
