/* eslint-disable no-param-reassign */
import React from 'react';
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { FormInstance } from 'antd/lib/form';
import { UploadFile } from 'antd/lib/upload/interface';
import styles from '../../style.less';

interface UploaderProp {
  form: FormInstance;
  data: FormData;
}

const CertificateUploader: React.FC<UploaderProp> = ({ form, data }) => {
  type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';
  const handleChange = (info: UploadChangeParam<UploadFile<any>>, type: UploadType) => {
    console.log('type: ', type);
    console.log('info: ', info);
    info.file.status = 'done';
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
    <>
      <Form form={form} layout="horizontal" className={styles.stepForm} initialValues={data}>
        <Form.Item>
          <Upload
            {...uploadProps}
            onChange={(info) => handleChange(info, 'PUBLIC_KEY')}
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
            onChange={(info) => handleChange(info, 'PRIVATE_KEY')}
            className={styles.stepForm}
          >
            <Button>
              <UploadOutlined /> 点击上传私钥
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </>
  );
};
export default CertificateUploader;
