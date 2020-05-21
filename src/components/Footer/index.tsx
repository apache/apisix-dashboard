import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => (
  <DefaultFooter
    copyright="2020 Apache APISIX"
    links={[
      {
        key: 'GitHub',
        title: <GithubOutlined />,
        href: 'https://github.com/apache/incubator-apisix',
        blankTarget: true,
      },
    ]}
  />
);
