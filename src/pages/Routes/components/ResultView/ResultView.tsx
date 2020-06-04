import React from 'react';
import { Result, Button } from 'antd';

type Props = {
  onReset?(): void;
};

const ResultView: React.FC<Props> = ({ onReset }) => (
  <Result
    status="success"
    title="提交成功"
    extra={[
      <Button
        type="primary"
        key="goto-list"
        onClick={() => window.location.replace('/dashboard/routes')}
      >
        返回路由列表
      </Button>,
      <Button key="create" onClick={onReset}>
        创建新路由
      </Button>,
    ]}
  />
);

export default ResultView;
