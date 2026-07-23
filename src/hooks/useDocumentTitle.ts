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

import type { Resources } from '@/config/i18n';
import { navRoutes } from '@/config/navRoutes';

// matches the static <title> in index.html (the default before any route
// resolves and the suffix on every page)
const APP_NAME = 'Apache APISIX Dashboard';

type SourceLabel = keyof Resources['en']['common']['sources'];

// path segment -> sources i18n label. Built from the nav table (the single
// source of truth), plus `credentials`, which is only ever a nested
// resource (never a top-level nav entry).
const segmentToLabel: Record<string, SourceLabel> = {
  ...Object.fromEntries(
    navRoutes.map((r) => [r.to.replace(/^\//, ''), r.label])
  ),
  credentials: 'credentials',
};

const isParam = (seg: string) => seg.startsWith('$');

/**
 * Classify the DEEPEST matched route by its pattern (e.g.
 * `/services/detail/$id/routes/add`). The action is read from the TAIL of
 * the pattern so a `detail/$id` in the middle (navigation context) does
 * not misclassify a nested add/detail page as the parent's detail (#3441
 * review): a nested `…/routes/add` is "Add Route", not "Service Detail".
 */
const classify = (
  routeId: string
): { label: SourceLabel; action: 'add' | 'detail' | 'list' } | null => {
  const segs = routeId.split('/').filter(Boolean);
  if (segs.length === 0) return null;

  const last = segs[segs.length - 1];
  let action: 'add' | 'detail' | 'list';
  let resourceIdx: number;

  if (last === 'add') {
    action = 'add';
    resourceIdx = segs.length - 2;
  } else if (isParam(last) && segs[segs.length - 2] === 'detail') {
    action = 'detail';
    resourceIdx = segs.length - 3;
  } else {
    // list page: the leaf segment is the resource (skip a trailing param)
    action = 'list';
    resourceIdx = isParam(last) ? segs.length - 2 : segs.length - 1;
  }

  const resource = segs[resourceIdx];
  const label = resource && segmentToLabel[resource];
  return label ? { label, action } : null;
};

/**
 * Give every page a distinct, localized document.title instead of the one
 * static title the app shipped with (#3417). Derived centrally from the
 * deepest matched route + the nav route table, reactive to both
 * navigation and language change — no per-route boilerplate.
 */
export const useDocumentTitle = () => {
  const { t, i18n } = useTranslation();
  const routeId = useRouterState({
    select: (s) => s.matches[s.matches.length - 1]?.routeId as string,
  });

  useEffect(() => {
    const matched = routeId ? classify(routeId) : null;
    let title = APP_NAME;
    if (matched) {
      const name = t(`sources.${matched.label}`);
      if (matched.action === 'add') {
        title = `${t('info.add.title', { name })} - ${APP_NAME}`;
      } else if (matched.action === 'detail') {
        title = `${t('info.detail.title', { name })} - ${APP_NAME}`;
      } else {
        title = `${name} - ${APP_NAME}`;
      }
    }
    document.title = title;
    // i18n.language in deps so the title re-localizes on a language switch
  }, [routeId, t, i18n.language]);
};
