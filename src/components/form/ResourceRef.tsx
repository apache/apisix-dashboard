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
import { Anchor, type AnchorProps, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { createLink } from '@tanstack/react-router';
import { HttpStatusCode, isAxiosError } from 'axios';
import { forwardRef } from 'react';
import { type FieldValues, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  getConsumerGroupQueryOptions,
  getPluginConfigQueryOptions,
  getServiceQueryOptions,
  getUpstreamQueryOptions,
} from '@/apis/hooks';
import { toRefId } from '@/components/form/ref-id';
import {
  FormItemTextInput,
  type FormItemTextInputProps,
} from '@/components/form/TextInput';
import type { FileRoutesByTo } from '@/routeTree.gen';
import IconWarning from '~icons/tabler/alert-triangle';
// An in-app router navigation, not a new window: `external-link` would say
// the opposite of what this control does.
import IconGoTo from '~icons/tabler/arrow-right';

/**
 * A 404 means the referenced resource does not exist; anything else means
 * we could not ask. #3458 introduces a shared `isNotFoundError` in
 * `@/utils/error` and makes "a read 404 is neither retried nor toasted"
 * the global rule. Once it has merged, this predicate collapses into that
 * import and the local `retry` below can go away entirely; the red
 * `Key not found` toast a dangling reference still pops today goes with it.
 */
const isNotFound = (error: unknown) =>
  isAxiosError(error) && error.response?.status === HttpStatusCode.NotFound;

/**
 * A real `<a>`, not the repo's `RouteLinkBtn`, which is a Mantine `Button`.
 * `FormSection` renders a `<fieldset>` and passes `disabled` in the nested
 * service → route view; a disabled fieldset kills every descendant form
 * control but leaves anchors alone.
 */
const MantineAnchorLink = forwardRef<HTMLAnchorElement, AnchorProps>(
  (props, ref) => <Anchor ref={ref} {...props} />
);
MantineAnchorLink.displayName = 'ResourceRefLink';
const ResourceRefLink = createLink(MantineAnchorLink);

/** The four referenced resources all carry an optional `name`. */
type RefDetail = { value?: { name?: string } };

/**
 * The referenceable resources. The `satisfies` checks the route strings
 * against the generated route tree; it does NOT check that each entry's
 * factory belongs to its key, because every factory satisfies the erased
 * `(id: string) => unknown` slot. `ResourceRef.test.ts` covers that pairing.
 *
 * The cast keeps the one unavoidable widening here instead of at every
 * call site: TanStack's `queryOptions()` types `queryFn` as optional and
 * as taking a query context, which no shared signature can express.
 */
export const REFS = {
  upstreams: {
    to: '/upstreams/detail/$id',
    getQueryOptions: getUpstreamQueryOptions,
  },
  services: {
    to: '/services/detail/$id',
    getQueryOptions: getServiceQueryOptions,
  },
  pluginConfigs: {
    to: '/plugin_configs/detail/$id',
    getQueryOptions: getPluginConfigQueryOptions,
  },
  consumerGroups: {
    to: '/consumer_groups/detail/$id',
    getQueryOptions: getConsumerGroupQueryOptions,
  },
} satisfies Record<
  string,
  { to: keyof FileRoutesByTo; getQueryOptions: (id: string) => unknown }
> as unknown as Record<
  'upstreams' | 'services' | 'pluginConfigs' | 'consumerGroups',
  {
    to: keyof FileRoutesByTo;
    getQueryOptions: (id: string) => {
      queryKey: readonly unknown[];
      queryFn: () => Promise<RefDetail>;
    };
  }
>;

export type ResourceRefTarget = keyof typeof REFS;

export type FormItemResourceRefProps<T extends FieldValues> =
  FormItemTextInputProps<T> & {
    resource: ResourceRefTarget;
  };

export const FormItemResourceRef = <T extends FieldValues>(
  props: FormItemResourceRefProps<T>
) => {
  const { resource, ...inputProps } = props;
  const { t } = useTranslation();

  const value = useWatch({
    control: props.control,
    name: props.name,
  });
  // Without this the field fires one query per keystroke while it is being
  // typed into, and all but the last are guaranteed to 404.
  const [id] = useDebouncedValue(toRefId(value), 300);

  const { to, getQueryOptions } = REFS[resource];
  const options = getQueryOptions(id);
  const { data, error } = useQuery({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: !!id,
    // 404 = "no such resource", which is an answer, not a failure: the
    // global default would retry it three times and delay the warning by
    // ~7s of backoff — once per typing pause and once per window refocus.
    // Real failures (5xx, network) still get two more tries.
    retry: (failureCount, error) => failureCount < 2 && !isNotFound(error),
  });

  const singular = t(`${resource}.singular`);
  const missing = t('form.ref.missing', { name: singular });
  const name = data?.value?.name;
  // Reads as an action, not as a bare noun: a screen reader announcing
  // "link, xref upstream backend" says nothing about where it goes.
  const label = name
    ? // `name` is user-controlled (a resource's own name, e.g. "R&D
      // backend"). i18next's default `escapeValue: true` would HTML-escape
      // it (`R&amp;D`) before it ever reaches React. That escaping is not
      // just unneeded here, it is wrong: `label` lands in a React
      // `aria-label` attribute and a Mantine `Tooltip` label, both of which
      // React itself escapes on render. Double-escaping turns a literal
      // "&" into a literal "&amp;" in the rendered text.
      t('form.ref.viewNamed', {
        resource: singular,
        name,
        interpolation: { escapeValue: false },
      })
    : t('form.ref.view', { name: singular });

  const rightSection = (() => {
    if (!id) return null;
    if (isNotFound(error)) {
      return (
        <Tooltip label={missing} withArrow>
          <span role="img" aria-label={missing}>
            <IconWarning />
          </span>
        </Tooltip>
      );
    }
    // In flight, or a failure that is not a 404: we do not know that the
    // reference is broken, so we do not say so. A refetch that fails this
    // way after a successful resolve keeps react-query's cached `data`, so
    // the link stays — last known good beats blanking a working link.
    if (!data) return null;
    return (
      <Tooltip label={label} withArrow>
        <ResourceRefLink to={to} params={{ id }} aria-label={label}>
          <IconGoTo />
        </ResourceRefLink>
      </Tooltip>
    );
  })();

  return (
    <FormItemTextInput
      {...inputProps}
      rightSection={rightSection}
      // Mantine sets `pointer-events: none` on input sections by default,
      // which would render the link and then swallow every click on it.
      rightSectionPointerEvents="all"
    />
  );
};
