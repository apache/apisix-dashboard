import React from 'react';

declare namespace UserModule {
  interface LoginMethod {
    id: string;
    name: string;
    render: () => React.ReactElement;
    getData: () => LoginData;
    checkData: () => Promise<boolean>;
    submit: (data) => Promise<LoginResponse>;
    logout: () => void;
  }

  type LoginData = {
    [string]: string;
  };

  interface LoginResponse {
    status: boolean;
    message: string;
    data: {
      [string]: any;
    };
  }
}
