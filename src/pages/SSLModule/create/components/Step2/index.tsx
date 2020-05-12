import React from 'react';
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './index.less';
import ListDetail from '../listDetail/index';

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

const Step2: React.FC = props => {
  const [form] = Form.useForm();
  const { data, setCurrentStep, setFormData } = props;

  const { validateFields } = form;

  const onValidateForm = async () => {
    const values = await validateFields();
    setFormData({
      createType: data.createType,
      ...values,
    });
    setCurrentStep(2);
  };
  const preStep = () => {
    setCurrentStep(0);
  };
  let renderView;
  if (data.createType === 'ManualInput') {
    renderView = (
      <div className="step2-container">
        <ListDetail mode="EDIT" form={form} data={data} />
        <div className="button-area">
          <Button type="primary" onClick={preStep}>
            上一步
          </Button>
          <Button type="primary" onClick={onValidateForm}>
            下一步
          </Button>
        </div>
      </div>
    );
  } else {
    renderView = (
      <>
        <Form
          {...formItemLayout}
          form={form}
          layout="horizontal"
          className={styles.stepForm}
          hideRequiredMark
          initialValues={data}
        >
          <Form.Item>
            <Upload className={styles.stepForm}>
              <Button>
                <UploadOutlined /> 点击上传
              </Button>
            </Upload>
          </Form.Item>
        </Form>
        <div className="button-area">
          <Button type="primary" onClick={preStep}>
            上一步
          </Button>
          <Button type="primary" onClick={onValidateForm}>
            下一步
          </Button>
        </div>
      </>
    );
  }
  return renderView;
};
export default Step2;
