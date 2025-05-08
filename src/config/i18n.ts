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
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en_common from '@/locales/en/common.json';
import zh_common from '@/locales/zh/common.json';

export const resources = {
  en: {
    common: en_common,
  },
  zh: {
    common: zh_common,
  },
} as const;

export type Resources = typeof resources;
export const defaultNS: keyof Resources['en'] = 'common';

i18n.use(initReactI18next).init({
  lng: 'en',
  ns: ['common'],
  defaultNS,
  resources,
});

export default i18n;
