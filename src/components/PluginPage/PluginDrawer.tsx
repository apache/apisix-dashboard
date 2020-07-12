import React, { Fragment } from 'react';
import { Drawer, Button } from 'antd';
import { withTheme, FormProps } from '@rjsf/core';
import { Theme as AntDTheme } from '@rjsf/antd';
import { JSONSchema7 } from 'json-schema';

interface Props {
  name?: string;
  initialData: any;
  active?: boolean;
  disabled?: boolean;
  schema: JSONSchema7;
  onActive(name: string): void;
  onInactive(name: string): void;
  onClose(): void;
  onFinish(values: any): void;
}

const PluginDrawer: React.FC<Props> = ({
  name,
  active,
  disabled,
  schema,
  initialData,
  onActive,
  onInactive,
  onClose,
  onFinish,
}) => {
  const PluginForm = withTheme(AntDTheme);

  if (!name) {
    return null;
  }

  // NOTE: 用于作为 PluginForm 的引用
  let form: any;

  return (
    <Drawer
      title={`配置 ${name} 插件`}
      width={400}
      visible={Boolean(name)}
      destroyOnClose
      onClose={onClose}
      footer={
        disabled ? null : (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {Boolean(active) && (
                <Button type="primary" danger onClick={() => onInactive(name)}>
                  禁用
                </Button>
              )}
              {Boolean(!active) && (
                <Button type="primary" onClick={() => onActive(name)}>
                  启用
                </Button>
              )}
            </div>
            {Boolean(active) && (
              <div>
                <Button onClick={onClose}>取消</Button>
                <Button
                  type="primary"
                  style={{ marginRight: 8, marginLeft: 8 }}
                  onClick={() => {
                    form.submit();
                  }}
                >
                  确认
                </Button>
              </div>
            )}
          </div>
        )
      }
    >
      <PluginForm
        schema={schema}
        liveValidate
        disabled={disabled || !active}
        formData={initialData}
        showErrorList={false}
        ref={(_form: FormProps<any>) => {
          form = _form;
        }}
        onSubmit={({ formData }) => {
          onFinish(formData);
        }}
      >
        {/* NOTE: 留空，用于隐藏 Submit 按钮 */}
        <Fragment />
      </PluginForm>
    </Drawer>
  );
};

export default PluginDrawer;
