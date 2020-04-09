import { Alert, Checkbox } from 'antd';
import React, { useState } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { StateType } from '@/models/login';
import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
import LoginFrom from './components/Login';

import styles from './style.less';

const { Tab, UserName, Password, Submit } = LoginFrom;
interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
}

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC<LoginProps> = props => {
  const { userLogin = {}, submitting } = props;
  const { status, type: loginType } = userLogin;
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState<string>('account');

  const handleSubmit = (values: LoginParamsType) => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, type },
    });
  };
  return (
    <div className={styles.main}>
      <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
        <Tab key="account" tab={formatMessage({ id: 'component.user.loginByPassword' })}>
          {status === 'error' && loginType === 'account' && !submitting && (
            <LoginMessage
              content={formatMessage({ id: 'component.user.wrongUsernameOrPassword' })}
            />
          )}

          <UserName
            name="userName"
            placeholder={formatMessage({ id: 'component.user.username' })}
            defaultValue="admin"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'component.user.inputUsername' }),
              },
            ]}
          />
          <Password
            name="password"
            placeholder={formatMessage({ id: 'component.user.password' })}
            defaultValue="123456"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'component.user.inputPassword' }),
              },
            ]}
          />
        </Tab>
        <div>
          <Checkbox checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)}>
            <FormattedMessage id="component.user.rememberMe" />
          </Checkbox>
        </div>
        <Submit loading={submitting}>
          <FormattedMessage id="component.user.login" />
        </Submit>
      </LoginFrom>
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
