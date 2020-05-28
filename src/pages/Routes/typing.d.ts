declare namespace RoutesModule {
  interface Step1ModalProps {
    paramsLocation: string;
    paramsName: string;
    paramsExpresstion: string;
    paramsValue: string;
    remark?: string;
    key: string;
  }

  interface Step1HostProps {
    host: string;
    port: string;
    priority: string;
  }

  interface Step1PageDataProps {
    apiName: string;
    protocol: string;
    hosts: Step1HostProps[];
    requestPath: string;
    httpMethods: [];
    advancedConfig: Step1ModalProps[];
  }

  interface StepProps {
    pageData: {
      step1PageData: Step1PageDataProps;
    };
    onChange(data: any): void;
  }
}
