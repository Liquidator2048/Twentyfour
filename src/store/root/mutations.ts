import { RootState } from './types';
import { storeVal } from './utils';
import { MutationTree } from 'vuex';

const mutations: MutationTree<RootState> = {
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
};

export default mutations;
