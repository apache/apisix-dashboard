import React from 'react';
import { Tabs } from 'antd';

import { DefaultFooter } from '@ant-design/pro-layout';
import { SelectLang } from '@@/plugin-locale/SelectLang';
import { Link } from 'umi';
import logo from '@/assets/logo.svg';
import styles from './Login.less';

const Tab = Tabs.TabPane;

const Page: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <SelectLang />
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>APISIX Dashboard</span>
            </Link>
          </div>
          <div className={styles.desc}>Cloud-Native Microservices API Gateway</div>
        </div>
        <div className={styles.main}>
          <Tabs>
            <Tab key="test" tab="Test">
              Test
            </Tab>
          </Tabs>
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
};

export default Page;
