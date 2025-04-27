import { ConfigProvider } from 'antd';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import '@ant-design/v5-patch-for-react-19';
import enUS from 'antd/locale/en_US';

export const AntdConfigProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { t } = useTranslation();

  return (
    <ConfigProvider
      virtual
      locale={enUS}
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
