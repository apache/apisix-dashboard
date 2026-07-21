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
import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { navRoutes } from '@/config/navRoutes';

// matches the static <title> in index.html (the default before any route
// resolves and the suffix on every page)
const APP_NAME = 'Apache APISIX Dashboard';

// Longest `to` first so '/consumer_groups' wins over '/consumers'.
const sectionsByPathLength = [...navRoutes].sort(
  (a, b) => b.to.length - a.to.length
);

/**
 * Give every page a distinct, localized document.title instead of the one
 * static title the app shipped with (#3417). Derived centrally from the
 * current path + the nav route table (single source of truth), reactive
 * to both navigation and language change — no per-route boilerplate.
 */
export const useDocumentTitle = () => {
  const { t, i18n } = useTranslation();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    const section = sectionsByPathLength.find(
      (r) => pathname === r.to || pathname.startsWith(`${r.to}/`)
    );

    let title = APP_NAME;
    if (section) {
      const name = t(`sources.${section.label}`);
      const rest = pathname.slice(section.to.length);
      if (rest.startsWith('/add')) {
        title = `${t('info.add.title', { name })} - ${APP_NAME}`;
      } else if (rest.startsWith('/detail')) {
        title = `${t('info.detail.title', { name })} - ${APP_NAME}`;
      } else {
        title = `${name} - ${APP_NAME}`;
      }
    }
    document.title = title;
    // i18n.language in deps so the title re-localizes on a language switch
  }, [pathname, t, i18n.language]);
};
