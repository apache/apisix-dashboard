import React from 'react';

declare namespace UserModule {
  interface LoginMethod {
    id: string;
    name: string;
    render: () => React.ReactElement;
    getData: () => LoginData;
  }

  type LoginData = {
    [string]: string;
  };
}
