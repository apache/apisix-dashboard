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
import { Anchor, Group, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { getPluginDocsUrl } from '@/utils/pluginDocs';
import IconExternalLink from '~icons/tabler/external-link';

export type PluginDocsLinkProps = {
  name: string;
  /** Show the visible label beside the icon. Icon-only otherwise. */
  withLabel?: boolean;
};

/**
 * A real `<a>`, not the repo's `RouteLinkBtn`, which is a Mantine `Button`
 * carrying `href`: middle-click, cmd-click and "copy link address" are
 * exactly what someone reaching for documentation does, and none of them
 * work on a `<button>`.
 *
 * Renders nothing when the plugin has no page on the released docs —
 * a missing affordance beats a broken link.
 */
export const PluginDocsLink = (props: PluginDocsLinkProps) => {
  const { name, withLabel = false } = props;
  const { t, i18n } = useTranslation();

  const href = getPluginDocsUrl(name, i18n.language);
  if (!href) return null;

  // i18next escapes interpolated values by default; #3459 shipped an
  // accessible name reading `R&amp;D` before that was caught. Plugin names
  // are gateway-controlled and hyphenated, so this is prophylactic.
  const named = t('form.plugins.docsFor', {
    name,
    interpolation: { escapeValue: false },
  });

  const link = (
    <Anchor
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      underline="never"
      size="sm"
      // With a visible label the label IS the accessible name; overriding
      // it with text that does not contain the visible label would break
      // WCAG 2.5.3. Icon-only has no visible text, so it needs one.
      {...(!withLabel && { 'aria-label': named })}
    >
      {withLabel ? (
        <Group component="span" gap={4} wrap="nowrap">
          <IconExternalLink aria-hidden focusable="false" />
          {t('docs')}
        </Group>
      ) : (
        <IconExternalLink aria-hidden focusable="false" />
      )}
    </Anchor>
  );

  return withLabel ? link : <Tooltip label={named}>{link}</Tooltip>;
};
