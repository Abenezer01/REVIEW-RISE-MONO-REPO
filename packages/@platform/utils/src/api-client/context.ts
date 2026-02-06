import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<Map<string, any>>();

export const setRequestContext = (key: string, value: any) => {
    const store = requestContext.getStore();
    if (store) {
        store.set(key, value);
    }
};

export const getRequestContext = (key: string) => {
    const store = requestContext.getStore();
    return store?.get(key);
};
