import { MutationTree } from 'vuex';
import { Category, ComputedState, SearchResults } from './types';
import * as IPFSCore from 'ipfs-core';
import * as IPFSHttpClient from 'ipfs-http-client';
import Vue from 'vue';

const mutations: MutationTree<ComputedState> = {
    IPFS_Set(state: ComputedState, value: IPFSCore.IPFS | IPFSHttpClient.IPFSHTTPClient) {
        state.IPFS = value;
    },
    IPFS_IS_HTTP_set(state: ComputedState, value: boolean) {
        state.IPFS_IS_HTTP = value;
    },
    SQLITE_Set(state: ComputedState, value: SQLiteAPI) {
        state.SQLITE = value;
    },
    DB_Set(state: ComputedState, value: number) {
        state.DB = value;
    },
    SEARCH_str_set(state: ComputedState, value: number | null) {
        Vue.set(state.SEARCH, 'str', value);
    },
    SEARCH_prepared_set(state: ComputedState, value: { stmt: number, sql: number } | null) {
        Vue.set(state.SEARCH, 'prepared', value);
    },
    RESULTS_set(state: ComputedState, value: SearchResults) {
        state.SEARCH_RESULTS = value;
    },
    RESULTS_addRange(state: ComputedState, value: SearchResults) {
        state.SEARCH_RESULTS = state.SEARCH_RESULTS.concat(value);
    },
    SEARCH_hasMore(state: ComputedState, value: boolean) {
        Vue.set(state.SEARCH, 'hasMore', value);
    },
    SEARCH_sql_set(state: ComputedState, sql: string) {
        Vue.set(state.SEARCH, 'sql', sql);
    },
    SEARCH_columns_set(state: ComputedState, columns: string[]) {
        Vue.set(state.SEARCH, 'columns', columns);
    },
    SEARCH_sql_reset(state: ComputedState) {
        Vue.set(state.SEARCH, 'sql', `
            SELECT t.magnet, t.title, t.info, t.date, t.cat_id
            FROM torrents t
            WHERE (
                title MATCH @search OR info MATCH @search
            ) AND (
               @catId IS NULL OR t.cat_id = @catId
            )
        `);
    },
    SEARCHING_set(state: ComputedState, value: boolean) {
        if (value) {
            state.SEARCHING = state.SEARCHING + 1;
        } else if (state.SEARCHING > 0) {
            state.SEARCHING = state.SEARCHING - 1;
        }
    },
    CATEGORIES_set(state: ComputedState, value: Category[]) {
        state.CATEGORIES = value;
    },
};
export default mutations;
