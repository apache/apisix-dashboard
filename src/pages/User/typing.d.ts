import { ReactElement } from 'react';

declare namespace UserModule {
  interface LoginMethod {
    id: string;
    name: string;
    render: () => ReactElement;
  }
}
