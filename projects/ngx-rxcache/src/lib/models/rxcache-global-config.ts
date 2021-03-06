export interface RxCacheGlobalConfig {
  genericError: string;
  errorHandler?: (id: string, error: any, value?: any) => string | void;
}

export const globalConfig: RxCacheGlobalConfig = {
  genericError: 'An error has occurred'
};
