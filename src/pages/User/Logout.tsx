import React from 'react';
import LoginMethodPassword from '@/pages/User/components/LoginMethodPassword';
import LoginMethodExample from '@/pages/User/components/LoginMethodExample';
import { UserModule } from '@/pages/User/typing';
import { getUrlQuery } from '@/helpers';

/**
 * Login Methods List
 */
const loginMethods: UserModule.LoginMethod[] = [LoginMethodPassword, LoginMethodExample];

/**
 * User Logout Page
 * @constructor
 */
const Page: React.FC = () => {
  // run all logout method
  loginMethods.forEach((item) => {
    item.logout();
  });

  const redirect = getUrlQuery('redirect');
  window.location.href = `/user/login${redirect ? `?redirect=${redirect}` : ''}`;

  return <div />;
};

export default Page;
