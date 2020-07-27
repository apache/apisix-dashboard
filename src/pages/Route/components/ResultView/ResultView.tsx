import React from 'react';
import { Result, Button } from 'antd';
import { history, useIntl } from 'umi';

type Props = {
  onReset?(): void;
};

const ResultView: React.FC<Props> = () => {

  const { formatMessage } = useIntl();

  return(
    <Result
    status="success"
    title={formatMessage({ id: 'route.result.submit.success' })}
    extra={[
      <Button type="primary" key="goto-list" onClick={() => history.replace('/routes/list')}>
        {formatMessage({ id: 'route.result.return.list' })}
      </Button>,
      <Button key="create-new" onClick={() => history.replace('/routes/create')}>
        {formatMessage({ id: 'route.result.create' })}
      </Button>,
    ]}
  />
  );
  
};

export default ResultView;
