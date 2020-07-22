import { ReactElement } from 'react';

declare namespace UserModule {
  interface LoginMethod {
    name: string;
    render: () => ReactElement;
  }
}
