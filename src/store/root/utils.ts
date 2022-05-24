import { RootState } from './types';

export function storeState(state: RootState): void {
    localStorage.setItem('RootState', JSON.stringify({
        IPFS_USE_LOCAL_NODE: state.IPFS_USE_LOCAL_NODE,
        IPFS_HOST: state.IPFS_HOST,
        WEB3_USE_BROWSER_PROVIDER: state.WEB3_USE_BROWSER_PROVIDER,
        DB_PATH: state.DB_PATH,
    }));
}


export function storeVal<T extends keyof RootState>(name: string, val: RootState[T], state: RootState): void {
    const currentState = getState(state);
    currentState[name] = val;
    storeState(currentState);
}

export function getState(defVal: RootState): RootState {
    const rawState = localStorage.getItem('RootState');
    if (!rawState) return { ...defVal };
    const state: RootState = JSON.parse(rawState);
    return state ?? { ...defVal };
}

export function getVal<T extends keyof RootState>(name: string, defVal: RootState[T]): RootState[T] {
    const state = getState({ [name]: defVal } as RootState);
    if (!state)
        return defVal;
    if (typeof state[name] === 'undefined')
        return defVal;
    return state[name];
}
