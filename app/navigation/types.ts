export type RootTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Requests:
    | {
        openNew?: boolean;
        template?: RequestTemplateType;
      }
    | undefined;
  Documents: undefined;
  Settings: undefined;
};

export type RequestTemplateType =
  | 'Balance sheet'
  | 'Bank declarations'
  | 'Profit/expense (credit loan)'
  | 'Custom guided';
