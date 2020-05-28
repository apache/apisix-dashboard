declare namespace RoutesModule {
  interface MatchingRule {
    paramsLocation: 'query' | 'params' | 'header' | 'cookie';
    paramsName: string;
    paramsExpresstion: '==' | '～=' | '>' | '<' | '~~';
    paramsValue: string;
    key: string;
  }

  interface Step1DataProps {
    name: string;
    protocol: [];
    hosts: string[];
    paths: string[];
    httpMethods: [];
    advancedMatchingRules: MatchingRule[];
  }

  interface StepProps {
    data: {
      step1Data: Step1DataProps;
    };
    onChange(data: T): void;
  }
}
