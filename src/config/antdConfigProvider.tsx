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
import '@ant-design/v5-patch-for-react-19';

import { ConfigProvider } from 'antd';
import deDE from 'antd/locale/de_DE';
import enUS from 'antd/locale/en_US';
import esES from 'antd/locale/es_ES';
import trTR from 'antd/locale/tr_TR';
import zhCN from 'antd/locale/zh_CN';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

// antd's own locale must follow the app language, or antd-rendered
// surfaces (pagination, table controls) stay English after a switch
// (#3417).
const antdLocales: Record<string, typeof enUS> = {
  en: enUS,
  zh: zhCN,
  es: esES,
  de: deDE,
  tr: trTR,
};

export const AntdConfigProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { t, i18n } = useTranslation();

  return (
    <ConfigProvider
      virtual
      locale={antdLocales[i18n.language] ?? enUS}
      renderEmpty={() => <div>{t('noData')}</div>}
      theme={{
        token: {
          borderRadiusSM: 2,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
