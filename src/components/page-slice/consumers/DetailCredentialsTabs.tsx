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
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, type TabsItem } from '@/components/page/Tabs';

export const DetailCredentialsTabs = () => {
  const { t } = useTranslation();
  const { username } = useParams({ strict: false });
  const navigate = useNavigate();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const items = useMemo(
    (): TabsItem[] => [
      {
        value: 'detail',
        label: t('info.detail.title', { name: t('consumers.singular') }),
      },
      {
        value: 'credentials',
        label: t('info.detail.title', {
          name: t('credentials.singular'),
        }),
      },
    ],
    [t]
  );
  return (
    <Tabs
      items={items}
      variant="outline"
      value={pathname.includes('credentials') ? 'credentials' : 'detail'}
      onChange={(v) => {
        navigate({
          to:
            v === 'credentials'
              ? '/consumers/detail/$username/credentials'
              : '/consumers/detail/$username',
          params: { username: username as string },
        });
      }}
    />
  );
};
