/*
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
import React, { useState } from 'react';
import { Button, notification, Tabs } from 'antd';
import { DefaultFooter } from '@ant-design/pro-layout';
import { SelectLang } from '@@/plugin-locale/SelectLang';
import { Link, useIntl, history } from 'umi';
import LoginMethodPassword from '@/pages/User/components/LoginMethodPassword';
import LoginMethodExample from '@/pages/User/components/LoginMethodExample';
import { UserModule } from '@/pages/User/typing';
import logo from '@/assets/logo.svg';
import { SettingOutlined } from '@ant-design/icons';
import styles from './Login.less';
import { getUrlQuery } from '@/helpers';

const Tab = Tabs.TabPane;

/**
 * Login Methods List
 */
const loginMethods: UserModule.LoginMethod[] = [LoginMethodPassword, LoginMethodExample];

/**
 * User Login Page
 * @constructor
 */
const Page: React.FC = () => {
  const { formatMessage } = useIntl();
  const [loginMethod, setLoginMethod] = useState(loginMethods[0]);

  const onSettingsClick = () => {
    history.replace(`/settings?redirect=${encodeURIComponent(history.location.pathname)}`);
  };

  const onTabChange = (activeKey: string) => {
    loginMethods.forEach((item, index) => {
      if (activeKey === item.id) setLoginMethod(loginMethods[index]);
    });
  };

  const onSubmit = () => {
    loginMethod.checkData().then((validate) => {
      if (validate) {
        loginMethod.submit(loginMethod.getData()).then((response) => {
          if (response.status) {
            notification.success({
              message: formatMessage({ id: 'component.status.success' }),
              description: response.message,
              duration: 1,
              onClose: () => {
                const redirect = getUrlQuery('redirect');
                history.replace(redirect ? decodeURIComponent(redirect) : '/');
              },
            });
          } else {
            notification.error({
              message: formatMessage({ id: 'component.status.fail' }),
              description: response.message,
            });
          }
        });
      }
    });
  };

  if (localStorage.getItem('token')) {
    history.replace('/');
    return null;
  }
  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <div className={styles.settings} onClick={onSettingsClick}>
          <SettingOutlined />
        </div>
        <SelectLang />
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
            </Link>
          </div>
          <div className={styles.desc}>
            Apache APISIX Dashboard
            <br />
            Cloud-Native Microservices API Gateway
          </div>
        </div>
        <div className={styles.main}>
          <Tabs activeKey={loginMethod.id} onChange={onTabChange}>
            {loginMethods.map((item) => (
              <Tab key={item.id} tab={item.name}>
                {item.render()}
              </Tab>
            ))}
          </Tabs>
          <Button className={styles.submit} size="large" type="primary" onClick={onSubmit}>
            {formatMessage({ id: 'component.user.login' })}
          </Button>
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
};

export default Page;
