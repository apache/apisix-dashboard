import React, { CSSProperties } from 'react';

import { Row, Col, Button } from 'antd';

interface Props {
  step: number;
  onChange(nextStep: number): void;
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

const ActionBar: React.FC<Props> = ({ step, onChange }) => {
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
            {step < 3 ? '下一步' : '创建'}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ActionBar;
