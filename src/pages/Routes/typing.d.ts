declare namespace RoutesModule {
  interface Step1ModalProps {
    paramsLocation: 'query' | 'params' | 'header' | 'cookie';
    paramsName: string;
    paramsExpresstion: '==' | '～=' | '>' | '<' | '~~';
    paramsValue: string;
    remark: string;
    key: string;
  }

  interface Step1HostProps {
    host: string;
    port: number;
    priority: number;
  }

  interface step1DataProps {
    name: string;
    protocol: [];
    hosts: Step1HostProps[];
    path: string[];
    httpMethods: [];
    advancedMatchingRules: Step1ModalProps[];
  }

  interface StepProps {
    data: {
      step1Data: step1DataProps;
    };
    onChange(data: T): void;
  }
}
