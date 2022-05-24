import * as IPFSCore from 'ipfs-core';
import * as IPFSHttpClient from 'ipfs-http-client';
import SQLiteAPI from 'wa-sqlite';

export interface Category {
    id: number | null,
    value: string
}

export type SearchResults = { [key: string]: any }[]

export interface ComputedState {
    IPFS: IPFSCore.IPFS | IPFSHttpClient.IPFSHTTPClient | null;
    IPFS_IS_HTTP: boolean;
    SQLITE: SQLiteAPI | null;
    DB: number | null;
    SEARCH: {
        prepared: { stmt: number, sql: number } | null,
        str: number | null,
        sql: string,
        hasMore: boolean,
        columns: string[]
    };
    SEARCH_RESULTS: { [key: string]: SQLiteCompatibleType }[];
    SEARCHING: number;
    CATEGORIES: Category[];
}
