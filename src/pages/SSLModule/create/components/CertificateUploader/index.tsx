import React from 'react';
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { FormInstance } from 'antd/lib/form';
import { UploadFile } from 'antd/lib/upload/interface';
import styles from '../../style.less';

interface UploaderProps {
  form: FormInstance;
  data: FormData;
}

type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';

const CertificateUploader: React.FC<UploaderProps> = ({ form, data }) => {
  const handleChange = (info: UploadChangeParam<UploadFile<any>>, type: UploadType) => {
    console.log('type: ', type);
    console.log('info: ', info);
    // info.file.status = 'done';
    //   const fr = new FileReader();
    //   fr.readAsText(info.file.originFileObj)
    //   fr.onload(function(){ // 文件读取成功回调
    //     console.log(this.result)
    // });
  };
  const uploadProps = {
    // onChange: handleChange,
    multiple: false,
  };
  return (
    <Form form={form} layout="horizontal" className={styles.stepForm} initialValues={data}>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => handleChange(info, 'PUBLIC_KEY')}
          {...uploadProps}
        >
          <Button>
            <UploadOutlined /> 点击上传公钥
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => handleChange(info, 'PRIVATE_KEY')}
          {...uploadProps}
        >
          <Button>
            <UploadOutlined /> 点击上传私钥
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};
export default CertificateUploader;
