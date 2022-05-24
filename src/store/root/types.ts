import * as IPFSCore from 'ipfs-core';
import * as IPFSHttpClient from 'ipfs-http-client';
import SQLiteAPI from 'wa-sqlite';

export type SearchResults = { [key: string]: any }[]


export interface RootState {
    [key: string]: any;

    IPFS_USE_LOCAL_NODE: boolean;
    IPFS_HOST: string | null;
    WEB3_USE_BROWSER_PROVIDER: boolean;
    WEB3_RPC: string;
    WEB3_CONTRACT_ADDRESS: string;
    WEB3_CHAIN_ID: number;
    DB_PATH: string | null;
    LOADING: number;
    HAS_ERROR: boolean;
    ERROR_MESSAGE: string | null;
    RESULTS: SearchResults;
}

export interface Category {
    id: number | null,
    value: string
}


