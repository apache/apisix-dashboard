import React from 'react';
import { Result, Button } from 'antd';
import { history } from 'umi';

type Props = {
  onReset?(): void;
};

const ResultView: React.FC<Props> = () => (
  <Result
    status="success"
    title="提交成功"
    extra={[
      <Button type="primary" key="goto-list" onClick={() => history.replace('/routes')}>
        返回路由列表
      </Button>,
      <Button key="create-new" onClick={() => history.replace('/routes/create')}>
        创建新路由
      </Button>,
    ]}
  />
);

export default ResultView;
