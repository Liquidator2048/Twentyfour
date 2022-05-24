import { RootState } from './types';
import { getVal } from './utils';

const state: RootState = {
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
};
export default state;
