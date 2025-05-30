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
import { readdir, readFile } from 'fs/promises';
import type { Plugin } from 'vite';

type Options<T extends string> = {
  langs: T[];
  baseLang: T;
  getTranslationDir: (lang: T) => Promise<string> | string;
};

export type LangProgress<T extends string> = {
  [key in T]: {
    count: number;
    percent: number;
  };
};

const countKeys = (obj: any) => {
  let count = 0;
  for (const val of Object.values(obj)) {
    if (typeof val === 'object' && val !== null) {
      count += countKeys(val);
    } else {
      count++;
    }
  }
  return count;
};

const getTranslationFiles = async <T extends string>(
  params: Pick<Options<T>, 'getTranslationDir'> & { lang: T }
) => {
  const { getTranslationDir, lang } = params;
  const dir = await getTranslationDir(lang);
  const files = await readdir(dir);
  return files.filter((f) => f.endsWith('.json')).map((f) => `${dir}/${f}`);
};

const genI18nProgress = async <T extends string>(options: Options<T>) => {
  const { langs, baseLang, getTranslationDir } = options;
  const langCountsMap = new Map<T, number>(langs.map((lang) => [lang, 0]));

  await Promise.all(
    langs.map(async (lang) => {
      const files = await getTranslationFiles({ getTranslationDir, lang });
      const counts = await Promise.all(
        files.map(async (file) => {
          const content = await readFile(file, 'utf-8');
          return countKeys(JSON.parse(content));
        })
      );
      const count = counts.reduce((a, b) => a + b, 0);
      langCountsMap.set(lang, count);
    })
  );

  const baseLangCount = langCountsMap.get(baseLang)!;
  const res = {} as LangProgress<T>;
  for (const [lang, count] of langCountsMap.entries()) {
    res[lang] = {
      count,
      percent: Math.round((count / baseLangCount) * 100),
    };
  }
  return res;
};

const i18nProgress = <T extends string>(options: Options<T>): Plugin => {
  const name = 'i18n-progress';
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  return {
    name: `vite-plugin-${name}`,
    resolveId(id) {
      if (id !== virtualModuleId) return;
      return resolvedVirtualModuleId;
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) return;
      const progress = await genI18nProgress(options);
      return `export default ${JSON.stringify(progress)}`;
    },
  };
};
export default i18nProgress;
