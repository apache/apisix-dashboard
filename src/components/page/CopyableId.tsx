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
import { ActionIcon, CopyButton, Group, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import IconCheck from '~icons/tabler/check';
import IconCopy from '~icons/tabler/copy';

export type CopyableIdProps = {
  value?: string;
};

/**
 * A resource identifier plus a control to copy it.
 *
 * The id is the string you paste into a `curl` against the Admin API, into a
 * declarative config, or into another resource's `upstream_id`; until now the
 * only way to get it out of the dashboard was to select the text by hand.
 *
 * This lives in the table cell rather than on the detail page's id field:
 * detail sections render as a disabled `<fieldset>` to express read-only,
 * and the HTML spec disables every form control inside one — so a button
 * there would be dead exactly where it is most wanted.
 */
export const CopyableId = (props: CopyableIdProps) => {
  const { value } = props;
  const { t } = useTranslation();

  if (!value) return '-';

  return (
    <Group gap={4} wrap="nowrap">
      <span>{value}</span>
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => {
          const label = copied ? t('form.btn.copied') : t('form.btn.copy');
          return (
            <Tooltip label={label} withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color={copied ? 'teal' : 'gray'}
                onClick={copy}
                aria-label={label}
              >
                {copied ? <IconCheck /> : <IconCopy />}
              </ActionIcon>
            </Tooltip>
          );
        }}
      </CopyButton>
    </Group>
  );
};
