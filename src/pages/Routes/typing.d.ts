declare namespace RouteModule {
  interface MatchingRule {
    paramsLocation: 'query' | 'params' | 'header' | 'cookie';
    paramsName: string;
    paramsExpresstion: '==' | '～=' | '>' | '<' | '~~';
    paramsValue: string;
    key: string;
  }

  type Step1Data = {
    name: string;
    protocol: [];
    hosts: string[];
    paths: string[];
    httpMethods: [];
    advancedMatchingRules: MatchingRule[];
  };

  type Step3Data = {
    plugins: {
      [name: string]: any;
    };
  };

  interface Data {
    data: {
      step1Data: Step1Data;
      step2Data: Step2Data;
      step3Data: Step3Data;
    };
    onChange(data: T): void;
  }

  type backendAddressItemProps = {
    host: '';
    port: number;
    weight: number;
  };

  interface UpstreamHeader {
    header_name: string;
    header_value: string;
    header_desc: string;
    key: string;
  }

  type Step2Data = {
    backendProtocol: 'HTTP' | 'HTTPS' | 'originalRequest';
    backendAddressList: backendAddressItemProps[];
    upstream_header: UpstreamHeader[];
    timeout: {
      connect: number;
      send: number;
      read: number;
    };
  };
}
