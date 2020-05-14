import React from 'react';
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import styles from './index.less';
import CertificateForm from '../CertificateForm/index';
import { FormData } from '../..';

interface Props {
  data: FormData;
}

const Step2: React.FC<Props> = props => {
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
  const buttonArea = (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <Button type="primary" onClick={preStep} style={{ marginRight: '8px' }}>
        上一步
      </Button>
      <Button type="primary" onClick={onValidateForm}>
        下一步
      </Button>
    </div>
  );
  if (data.createType === 'INPUT') {
    renderView = (
      <div className="step2-container">
        <CertificateForm mode="EDIT" form={form} data={data} />
        {buttonArea}
      </div>
    );
  } else {
    type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';
    const handleChange = (info: UploadChangeParam<UploadFile<any>>, type: UploadType) => {
      console.log('type: ', type);
      console.log('info: ', info);
    };
    const uploadProps = {
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      // onChange: handleChange,
      multiple: true,
    };
    renderView = (
      <>
        <Form form={form} layout="horizontal" className={styles.stepForm} initialValues={data}>
          <Form.Item>
            <Upload
              {...uploadProps}
              onChange={info => handleChange(info, 'PUBLIC_KEY')}
              className={styles.stepForm}
            >
              <Button>
                <UploadOutlined /> 点击上传公钥
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Upload
              {...uploadProps}
              onChange={info => handleChange(info, 'PRIVATE_KEY')}
              className={styles.stepForm}
            >
              <Button>
                <UploadOutlined /> 点击上传私钥
              </Button>
            </Upload>
          </Form.Item>
        </Form>
        {buttonArea}
      </>
    );
  }
  return renderView;
};
export default Step2;
