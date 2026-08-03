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
const DOCS_ORIGIN = 'https://apisix.apache.org';

/** Plugins whose documentation page is not named after the plugin. */
const SLUG_OVERRIDES: Record<string, string> = {
  // both halves are documented on one page
  'serverless-pre-function': 'serverless',
  'serverless-post-function': 'serverless',
};

/**
 * Names with no page on the released docs. Two reasons, one consequence:
 * `example-plugin` is the gateway's sample plugin and `ai` has no page of
 * its own; the rest are newer than the current docs release and resolve
 * only under `/next/`. Drop those from here once the released docs catch
 * up — linking `/next/` instead would point users at documentation for a
 * version they are not running.
 */
const WITHOUT_DOC_PAGE = new Set([
  'example-plugin',
  'ai',
  'ai-cache',
  'ai-lakera-guard',
  'mcp-bridge',
]);

/**
 * The docs site publishes English and Chinese only. `language` is one of
 * the bare codes in `src/config/i18n.ts` (`en | zh | es | de | tr`) —
 * `supportedLngs` is derived from the resource keys, so there are no
 * regional variants to match loosely.
 */
export const getPluginDocsUrl = (
  name: string,
  language: string
): string | null => {
  if (WITHOUT_DOC_PAGE.has(name)) return null;
  const slug = SLUG_OVERRIDES[name] ?? name;
  const prefix = language === 'zh' ? '/zh' : '';
  return `${DOCS_ORIGIN}${prefix}/docs/apisix/plugins/${slug}/`;
};
