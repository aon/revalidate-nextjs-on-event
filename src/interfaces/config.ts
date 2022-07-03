export interface Config {
  provider: string;
  events: {
    signature: string;
    contract: {
      address: string;
      name: string;
    };
    api: {
      url: string;
      path: string;
    };
  }[];
}
