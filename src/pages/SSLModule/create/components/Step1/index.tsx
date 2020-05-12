import React from 'react';
import { Form, Button, Select } from 'antd';
import styles from './index.less';

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

const Step1: React.FC = props => {
  const { data, setCurrentStep, setFormData } = props;
  const [form] = Form.useForm();

  const { validateFields } = form;
  const onValidateForm = async () => {
    const values = await validateFields();
    setCurrentStep(1);
    setFormData({ createType: values.createType });
  };
  return (
    <>
      <Form
        {...formItemLayout}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        initialValues={data}
      >
        <Form.Item
          label="创建方式"
          name="createType"
          rules={[{ required: true, message: '请选择创建方式' }]}
        >
          <Select placeholder="请选择创建方式">
            <Option value="ManualInput">手动输入</Option>
            <Option value="UploadCertificate">上传证书</Option>
          </Select>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: {
              span: formItemLayout.wrapperCol.span,
              offset: formItemLayout.labelCol.span,
            },
          }}
        >
          <Button type="primary" onClick={onValidateForm}>
            下一步
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Step1;
