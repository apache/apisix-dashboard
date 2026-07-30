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
import { Stack, Text } from '@mantine/core';
import {
  type ErrorComponentProps,
  type LinkProps,
  useParams,
} from '@tanstack/react-router';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { RouteLinkBtn } from '@/components/Btn';
import { PageError } from '@/components/page/PageError';
import PageHeader from '@/components/page/PageHeader';
import type { Resources } from '@/config/i18n';
import { useResetQueryError } from '@/hooks/useResetQueryError';
import type { FileRoutesByTo } from '@/routeTree.gen';
import { isNotFoundError } from '@/utils/error';

/** Every `sources` key has a matching top-level object carrying `singular`. */
export type DetailResource = keyof Resources['en']['common']['sources'];

export type DetailNotFoundProps = {
  /**
   * The identifier from the URL. Deliberately not the resource's `name`:
   * the name lives only in the response, which by definition never
   * arrived, and `name` is optional in APISIX anyway.
   */
  id: string;
  resource: DetailResource;
  to: keyof FileRoutesByTo;
  /** the 404 that produced this panel; see `useResetQueryError` */
  error: unknown;
} & Pick<LinkProps, 'params'>;

export const DetailNotFound = ({
  id,
  resource,
  to,
  params,
  error,
}: DetailNotFoundProps) => {
  const { t } = useTranslation();
  const singular = t(`${resource}.singular`);
  // The same call `PageError` makes, so the app's two error surfaces cannot
  // drift: react-query caches the failure and replays it on later mounts.
  // Without this, deleting a resource, opening its URL, then re-creating it
  // under the same id leaves this panel claiming it does not exist.
  useResetQueryError(error);
  return (
    <>
      {/*
        No `extra`: Edit and Delete are structurally absent rather than
        conditionally hidden, so nothing can regress them back into a page
        whose resource does not exist.
      */}
      <PageHeader title={t('info.detail.titleWithId', { name: singular, id })} />
      <Stack align="flex-start" gap="md">
        <Text>{t('error.notFound.description', { name: singular })}</Text>
        <RouteLinkBtn to={to} params={params} size="compact-sm" variant="light">
          {t('error.notFound.back', { name: t(`sources.${resource}`) })}
        </RouteLinkBtn>
      </Stack>
    </>
  );
};

export type DetailErrorComponentOptions = {
  /** which URL param carries this resource's identifier */
  idParam: string;
  resource: DetailResource;
  /** the list to return to */
  to: keyof FileRoutesByTo;
  /**
   * handles everything that is not a 404; defaults to the same generic
   * error page (message plus Retry) the root error component shows, so
   * intercepting 404s here does not cost the other failures their Retry
   */
  fallback?: ComponentType<ErrorComponentProps>;
};

/**
 * A route `errorComponent` that turns a 404 into an explicit not-found
 * state and defers everything else.
 *
 * Route-level rather than app-level on purpose: the root error component
 * replaces the whole shell, losing the nav and any way back to the list.
 * A child route's error component replaces only that route's element
 * inside the root `<Outlet>`.
 */
// A factory, not a component, so react-refresh cannot treat it as one; it
// belongs beside the panel it builds rather than in a file of its own.
// eslint-disable-next-line react-refresh/only-export-components
export const genDetailErrorComponent = ({
  idParam,
  resource,
  to,
  fallback: Fallback = PageError,
}: DetailErrorComponentOptions) => {
  // Named and capitalised so eslint-plugin-react-hooks recognises it as a
  // component and accepts the hook call below.
  const DetailErrorComponent = (props: ErrorComponentProps) => {
    // `strict: false` avoids threading a per-route `from` literal through
    // the factory; the same escape hatch `services/detail.$id.tsx` uses.
    const urlParams = useParams({ strict: false }) as Record<string, string>;
    if (!isNotFoundError(props.error)) {
      return <Fallback {...props} />;
    }
    return (
      <DetailNotFound
        id={urlParams[idParam] ?? ''}
        resource={resource}
        to={to}
        error={props.error}
        // Passing every URL param covers the nested routes, whose back
        // link interpolates a parent's `$id`; extra keys are ignored when
        // the target path has no placeholder for them. The router would
        // also inherit those params from the current match, but stating
        // them keeps the target independent of that implicit behaviour.
        params={urlParams}
      />
    );
  };
  return DetailErrorComponent;
};
