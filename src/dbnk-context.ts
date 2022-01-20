export interface DbnkContext {
  [key: string]: {
    [key: string]: any;
    contexts: {
      [key: string]: DbnkContext;
    };
  };
}
