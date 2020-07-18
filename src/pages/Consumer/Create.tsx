import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Steps, notification, Form } from 'antd';
import { history } from 'umi';

import ActionBar from '@/components/ActionBar';
import PluginPage from '@/components/PluginPage';
import { PLUGIN_MAPPER_SOURCE } from '@/components/PluginPage/data';

import Step1 from './components/Step1';
import Preview from './components/Preview';
import { fetchItem, create, update } from './service';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [plugins, setPlugins] = useState<PluginPage.PluginData>({});
  const [form1] = Form.useForm();

  useEffect(() => {
    const { id } = (props as any).match.params;
    if (id) {
      fetchItem(id).then(({ data }) => {
        const { username, desc, ...rest } = data;
        form1.setFieldsValue({ username, desc });
        setPlugins(rest.plugins);
      });
    }
  }, []);

  const onSubmit = () => {
    const data = { ...form1.getFieldsValue(), plugins } as ConsumerModule.Entity;
    const { id } = (props as any).match.params;
    (id ? update(id, data) : create(data))
      .then(() => {
        notification.success({ message: `${id ? '更新' : '创建'} Consumer 成功` });
        history.push('/consumer/list');
      })
      .catch(() => {
        setStep(3);
      });
  };

  const onStepChange = (nextStep: number) => {
    if (step === 1) {
      form1.validateFields().then(() => {
        setStep(nextStep);
      });
    } else if (nextStep === 3) {
      const authPluginNames = Object.entries(PLUGIN_MAPPER_SOURCE)
        .filter(([name, value]) => name.includes('auth') && value.category === 'Security')
        .map((item) => item[0]);
      const isValid = Object.keys(plugins).some((name) => authPluginNames.includes(name));
      if (!isValid) {
        notification.warning({ message: '请启用至少一种身份认证类插件' });
        return;
      }
      setStep(3);
    } else if (nextStep === 4) {
      onSubmit();
    } else {
      setStep(nextStep);
    }
  };

  return (
    <>
      <PageContainer title={`${(props as any).match.params.id ? '编辑' : '创建'} Consumer`}>
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: 30 }}>
            <Steps.Step title="基础信息" />
            <Steps.Step title="插件配置" />
            <Steps.Step title="预览" />
          </Steps>

          {step === 1 && <Step1 form={form1} />}
          {step === 2 && <PluginPage data={plugins} onChange={setPlugins} />}
          {step === 3 && <Preview form1={form1} plugins={plugins} />}
        </Card>
      </PageContainer>
      <ActionBar step={step} lastStep={3} onChange={onStepChange} />
    </>
  );
};

export default Page;
