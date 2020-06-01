declare namespace RoutesModule {
  interface MatchingRule {
    paramsLocation: 'query' | 'params' | 'header' | 'cookie';
    paramsName: string;
    paramsExpresstion: '==' | '～=' | '>' | '<' | '~~';
    paramsValue: string;
    key: string;
  }

  type Step1DataProps = {
    name: string;
    protocol: [];
    hosts: string[];
    paths: string[];
    httpMethods: [];
    advancedMatchingRules: MatchingRule[];
  };

  interface StepProps {
    data: {
      step1Data: Step1DataProps;
      step2Data: Step2DataProps;
    };
    onChange(data: T): void;
  }

  type backendAddressItemProps = {
    host: '';
    port: number;
    weight: number;
  };

  type Step2DataProps = {
    backendProtocol: 'HTTP' | 'HTTPS' | 'originalRequest';
    backendAddressList: backendAddressItemProps[];
  };
}
