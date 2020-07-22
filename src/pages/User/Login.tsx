import React, { useState } from 'react';
import { Button, Tabs } from 'antd';
import { DefaultFooter } from '@ant-design/pro-layout';
import { SelectLang } from '@@/plugin-locale/SelectLang';
import { Link } from 'umi';
import LoginMethodPassword from '@/pages/User/components/LoginMethodPassword';
import LoginMethodTest from '@/pages/User/components/LoginMethodTest';
import { UserModule } from '@/pages/User/typing';
import logo from '@/assets/logo.svg';
import styles from './Login.less';

const Tab = Tabs.TabPane;

/**
 * Login Methods List
 */
const loginMethods: UserModule.LoginMethod[] = [LoginMethodPassword, LoginMethodTest];

/**
 * User Login Page
 * @constructor
 */
const Page: React.FC = () => {
  const [loginType, setLoginType] = useState(loginMethods[0]);

  const onTabChange = (activeKey: string) => {
    loginMethods.forEach((item, index) => {
      if (activeKey === item.id) setLoginType(loginMethods[index]);
    });
  };

  const onSubmit = () => {
    setLoginType(loginMethods[0]);
  };

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
          <Tabs activeKey={loginType.id} onChange={onTabChange}>
            {loginMethods.map((item) => (
              <Tab key={item.id} tab={item.name}>
                {item.render()}
              </Tab>
            ))}
          </Tabs>
          <Button className={styles.submit} size="large" type="primary" onClick={onSubmit}>
            登录
          </Button>
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
};

export default Page;
