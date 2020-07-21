import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';
import { useIntl } from 'umi';

const { formatMessage } = useIntl();

const NoFoundPage: React.FC<{}> = () => (
  <Result
    status={404}
    title="404"
    subTitle={formatMessage({ id: '404.not.find' })}
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        {formatMessage({ id: '404.back.home' })}
      </Button>
    }
  />
);

export default NoFoundPage;
