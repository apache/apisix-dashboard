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
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

import type { Resources } from '@/config/i18n';

export type ListEmptyStateProps = {
  /**
   * Resource key, used to look up the already-translated plural name in
   * `sources.*`. Typing it this way means a typo cannot compile.
   */
  resource: keyof Resources['en']['common']['sources'];
};

/**
 * Shown in place of an empty list. Deliberately text-only: the toolbar's Add
 * button sits directly above the table, so repeating it here would be a
 * duplicate control rather than a shortcut.
 */
export const ListEmptyState = (props: ListEmptyStateProps) => {
  const { resource } = props;
  const { t } = useTranslation();
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t('empty.description', { name: t(`sources.${resource}`) })}
    />
  );
};
