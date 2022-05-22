import Vuex from 'vuex';
import { RootState } from '@/store/types';
import computed from '@/store/computed/index';


function getState(defVal: RootState): RootState {
    const rawState = localStorage.getItem('RootState');
    if (!rawState) return { ...defVal };
    const state: RootState = JSON.parse(rawState);
    return state ?? { ...defVal };
}

function storeState(state: RootState): void {
    localStorage.setItem('RootState', JSON.stringify({
        IPFS_USE_LOCAL_NODE: state.IPFS_USE_LOCAL_NODE,
        IPFS_HOST: state.IPFS_HOST,
        WEB3_USE_BROWSER_PROVIDER: state.WEB3_USE_BROWSER_PROVIDER,
        DB_PATH: state.DB_PATH,
    }));
}

function getVal<T extends keyof RootState>(name: string, defVal: RootState[T]): RootState[T] {
    const state = getState({ [name]: defVal } as RootState);
    if (!state)
        return defVal;
    if (typeof state[name] === 'undefined')
        return defVal;
    return state[name];
}


function storeVal<T extends keyof RootState>(name: string, val: RootState[T], state: RootState): void {
    const currentState = getState(state);
    currentState[name] = val;
    storeState(currentState);
}

export default new Vuex.Store<RootState>({
    state: {
        IPFS_USE_LOCAL_NODE: getVal('IPFS_USE_LOCAL_NODE', false),
        IPFS_HOST: getVal('IPFS_HOST', null),
        WEB3_USE_BROWSER_PROVIDER: getVal('WEB3_USE_BROWSER_PROVIDER', false),
        WEB3_RPC: getVal('WEB3_RPC', process.env.VUE_APP_WEB3_RPC as string),
        WEB3_CONTRACT_ADDRESS: process.env.VUE_APP_WEB3_CONTRACT_ADDRESS as string,
        DB_PATH: getVal('DB_PATH', null),
        WEB3_CHAIN_ID: 5,
        LOADING: 0,
        HAS_ERROR: false,
        ERROR_MESSAGE: null,
        RESULTS: [],
    },
    mutations: {
        IPFS_USE_LOCAL_NODE_set(state: RootState, value: boolean) {
            state.IPFS_USE_LOCAL_NODE = value;
            storeVal('IPFS_USE_LOCAL_NODE', state.IPFS_USE_LOCAL_NODE, state);
        },
        IPFS_HOST_set(state: RootState, value: string | null) {
            state.IPFS_HOST = value;
            storeVal('IPFS_HOST', state.IPFS_HOST, state);
        },
        WEB3_RPC_set(state: RootState, value: string) {
            state.WEB3_RPC = value;
            storeVal('WEB3_RPC', state.WEB3_RPC, state);
        },
        DB_PATH_set(state: RootState, value: string | null) {
            state.DB_PATH = value;
            storeVal('DB_PATH', state.DB_PATH, state);
        },
        WEB3_USE_BROWSER_PROVIDER_set(state: RootState, value: boolean) {
            state.WEB3_USE_BROWSER_PROVIDER = value;
            storeVal('WEB3_USE_BROWSER_PROVIDER', state.WEB3_USE_BROWSER_PROVIDER, state);
        },
        LOADING_set(state: RootState, value: boolean) {
            if (value) {
                state.LOADING = state.LOADING + 1;
            } else if (state.LOADING > 0) {
                state.LOADING = state.LOADING - 1;
            }
        },
        ERROR_set(state: RootState, value: string) {
            if (value) {
                state.HAS_ERROR = true;
                state.ERROR_MESSAGE = value;
            } else {
                state.HAS_ERROR = false;
                state.ERROR_MESSAGE = value;
            }
        },
    },
    getters: {
        LOADING(state: RootState): boolean {
            return state.LOADING > 0;
        },
    },
    actions: {},
    modules: { computed },
    strict: false,
});

