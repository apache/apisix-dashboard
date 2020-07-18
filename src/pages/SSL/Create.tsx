import React, { useState } from 'react';
import { Card, Steps, notification, Form } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import moment from 'moment';

import ActionBar from '@/components/ActionBar';
import { history } from 'umi';
import Step1 from '@/pages/SSL/components/Step1';
import Step2 from '@/pages/SSL/components/Step2';
import { verifyKeyPaire, create, update } from '@/pages/SSL/service';
import styles from '@/pages/SSL/style.less';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [form] = Form.useForm();
  const { id } = (props as any).match.params;

  const onValidateForm = () => {
    let keyPaire = { cert: '', key: '' };
    form
      .validateFields()
      .then((value) => {
        keyPaire = { cert: value.cert, key: value.key };
        return verifyKeyPaire(value.cert, value.key);
      })
      .then(({ data }) => {
        form.setFieldsValue({
          ...form.getFieldsValue(),
          ...keyPaire,
          snis: data.snis,
          expireTime: moment.unix(Number(data.validity_end)).format('YYYY-MM-DD HH:mm:ss'),
        });
        setStep(2);
      })
      .catch(() => {
        notification.warning({ message: '请检查证书内容' });
      });
  };

  const submit = () => {
    const data = form.getFieldsValue();
    const sslData = {
      sni: data.snis,
      cert: data.cert!,
      key: data.key!,
    };
    (id ? update(id, sslData) : create(sslData)).then(() => {
      history.replace('/ssl/list');
    });
  };

  const handleStepChange = (nextStep: number) => {
    if (nextStep === 2) {
      onValidateForm();
    }
    if (nextStep === 3) {
      submit();
    }
  };

  return (
    <>
      <PageHeaderWrapper title="证书创建">
        <Card bordered={false}>
          <Steps current={step - 1} className={styles.steps}>
            {['完善证书信息', '预览'].map((item) => (
              <Steps.Step title={item} key={item} />
            ))}
          </Steps>
          {Boolean(step === 1) && <Step1 form={form} />}
          {Boolean(step === 2) && <Step2 form={form} />}
        </Card>
      </PageHeaderWrapper>
      <ActionBar step={step} lastStep={2} onChange={handleStepChange} />
    </>
  );
};

export default Page;
