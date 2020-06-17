import React, { CSSProperties } from 'react';

import { Row, Col, Button } from 'antd';

interface Props {
  step: number;
  onChange(nextStep: number): void;
  redirect?: boolean;
}

const style: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 10,
  margin: '-24px -24px 0',
  backgroundColor: '#fff',
  padding: '6px 36px',
  borderTop: '1px solid #ebecec',
  width: '100%',
};

const ActionBar: React.FC<Props> = ({ step, onChange, redirect }) => {
  if (step > 3) {
    return null;
  }

  return (
    <div style={style}>
      <Row gutter={10} justify="end">
        <Col>
          <Button type="primary" onClick={() => onChange(step - 1)} disabled={step === 0}>
            上一步
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={() => onChange(step + 1)}>
            {!redirect && (step < 3 ? '下一步' : '提交')}
            {redirect && (step === 0 ? '下一步' : '提交')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ActionBar;
