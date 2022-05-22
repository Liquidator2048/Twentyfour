import { ActionTree } from 'vuex';
import { Category, ComputedState, RootState } from '@/store/types';
import * as IPFSCore from 'ipfs-core';
import * as IPFSHttpClient from 'ipfs-http-client';
import SQLiteAsyncESMFactory from '@/wa-sqlite/wa-sqlite-async.mjs';
import * as SQLite from 'wa-sqlite';
import { IpfsAsyncVFS } from '@/IpfsAsyncVFS';

const PAGE_SIZE = 20;

const actions: ActionTree<ComputedState, RootState> = {
    async reset({ dispatch, commit }) {
        try {
            commit('ERROR_set', null, { root: true });
            commit('LOADING_set', true, { root: true });
            //commit('DB_PATH_set', null, { root: true });
            await dispatch('resetIPFS');
            await dispatch('resetSqlite');
            await dispatch('resetDbPath');
            await dispatch('resetDb');

            try {
                await dispatch('loadCategories');
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            commit('ERROR_set', error, { root: true });
            throw error;
        } finally {
            commit('LOADING_set', false, { root: true });
        }
    },

    async resetIPFS({ commit, state, rootState }) {
        console.log('reset ipfs');

        if (state.IPFS && !state.IPFS_IS_HTTP) {
            try {
                await state.IPFS.stop();
            } catch (error) {
                console.warn(error);
            }
        }
        commit('IPFS_Set', null);
        let ipfs: IPFSCore.IPFS | IPFSHttpClient.IPFSHTTPClient;
        if (rootState.IPFS_USE_LOCAL_NODE) {
            if (!rootState.IPFS_HOST) {
                throw new Error('no ipfs host configured');
            }
            commit('IPFS_IS_HTTP_set', true);
            ipfs = IPFSHttpClient.create({ url: rootState.IPFS_HOST });
        } else {
            commit('IPFS_IS_HTTP_set', false);
            ipfs = await IPFSCore.create({
                start: false,
                EXPERIMENTAL: { ipnsPubsub: true },
                config: { Pubsub: { Enabled: true } },
            });
            await ipfs.start();
        }

        commit('IPFS_Set', ipfs);
    },

    async resetSqlite({ commit, state, dispatch }) {
        console.log('reset sqlite');
        commit('SQLITE_Set', null);
        if (!state.IPFS) {
            throw new Error('no IPFS provider');
        }
        await dispatch('disposeSqlite');
        const asyncFactory = await SQLiteAsyncESMFactory();
        const sqlite = SQLite.Factory(asyncFactory);
        sqlite.vfs_register(new IpfsAsyncVFS(state.IPFS));
        commit('SQLITE_Set', sqlite);
    },

    async resetDbPath({ commit, state, getters }) {
        console.log('reset db path');
        let dbpath = await getters.getDBPathfromWeb3;
        if (dbpath.startsWith('/ipns/')) {
            if (!state.IPFS) {
                throw new Error('no IPFS provider');
            }
            const response = await state.IPFS.name.resolve(dbpath);
            dbpath = (await response[Symbol.asyncIterator]().next()).value as string;
        }
        commit('DB_PATH_set', dbpath, { root: true });
    },

    async resetDb({ commit, state, rootState, dispatch }) {
        console.log('reset db');
        commit('DB_Set', null);

        if (!state.SQLITE) {
            throw new Error('no sqlite');
        }
        if (!rootState.DB_PATH) {
            throw new Error('no database path');
        }
        await dispatch('disposeSqlite');
        const db = await state.SQLITE.open_v2(rootState.DB_PATH, undefined, 'ipfs-async');
        commit('DB_Set', db);

    },

    async prepareDb({ commit, state }, sql?: string) {
        if (!state.SQLITE) {
            throw new Error('no sqlite');
        }
        if (!state.DB) {
            throw new Error('no db');
        }

        if (state.SEARCH.prepared !== null && state.SEARCH.prepared.stmt != -1) {
            try {
                await state.SQLITE.reset(state.SEARCH.prepared.stmt);
                await state.SQLITE.finalize(state.SEARCH.prepared.stmt);
            } catch (error) {
                console.warn(error);
            }
        }
        if (sql) {
            commit('SEARCH_sql_set', sql);
        } else {
            commit('SEARCH_sql_reset');
        }
        const str = state.SQLITE.str_new(state.DB, state.SEARCH.sql);
        const prepared = await state.SQLITE.prepare_v2(state.DB, state.SQLITE.str_value(str));
        commit('SEARCH_str_set', str);
        commit('SEARCH_prepared_set', prepared);
    },

    async loadCategories({ commit, state }) {
        if (!state.SQLITE) {
            throw new Error('no sqlite');
        }
        if (!state.DB) {
            throw new Error('no db');
        }
        const categories: Category[] = [];
        await state.SQLITE.exec(
            state.DB,
            `SELECT id, value FROM categories`,
            (row) => {
                categories.push({
                    id: row[0] as number,
                    value: row[1] as string,
                });
            },
        );
        commit('CATEGORIES_set', categories);
    },

    async search({ state, commit, dispatch }, search: { search: string, catId?: number | null, sql?: string }) {
        commit('SEARCHING_set', true);
        commit('RESULTS_set', []);
        if (!state.SQLITE) {
            throw new Error('no sqlite');
        }
        await dispatch('prepareDb', search.sql);
        if (state.SEARCH.prepared?.stmt == null) {
            throw new Error('search engine not ready');
        }
        try {

            state.SQLITE.bind_collection(
                state.SEARCH.prepared.stmt,
                {
                    '@search': search.search ?? null,
                    '@catId': search.catId ?? null,
                },
            );
            const columns = state.SQLITE.column_names(state.SEARCH.prepared.stmt);
            commit('SEARCH_columns_set', columns);
            commit('SEARCH_hasMore', true);
            await dispatch('loadResults');
        } catch (error) {
            commit('ERROR_set', error, { root: true });
            throw error;
        } finally {
            commit('SEARCHING_set', false);
        }
    },


    async executeQuery({ dispatch }, queryString: string) {
        await dispatch('search', { sql: queryString });
    },

    async loadResults({ commit, state }) {
        try {
            commit('SEARCHING_set', true);
            if (!state.SQLITE) {
                throw new Error('no sqlite');
            }
            if (state.SEARCH.prepared?.stmt == null) {
                throw new Error('search engine not reeady');
            }
            if (!state.SEARCH.hasMore) {
                return;
            }
            const limit = state.SEARCH_RESULTS.length + PAGE_SIZE;
            commit('SEARCH_hasMore', await state.SQLITE.step(state.SEARCH.prepared.stmt) === SQLite.SQLITE_ROW);
            if (!state.SEARCH.hasMore) {
                return;
            }
            do {
                const row = state.SQLITE.row(state.SEARCH.prepared.stmt);
                if (row.length > 0)
                    commit('RESULTS_addRange', Object.fromEntries(state.SEARCH.columns.map((_, i) => [state.SEARCH.columns[i], row[i]])));
                commit('SEARCH_hasMore', await state.SQLITE.step(state.SEARCH.prepared.stmt) === SQLite.SQLITE_ROW && row.length > 0);
            } while (state.SEARCH.hasMore && state.SEARCH_RESULTS.length < limit);
        } catch (error) {
            commit('SEARCH_hasMore', false);
            throw error;
        } finally {
            commit('SEARCHING_set', false);
        }
    },

    async dispose({ dispatch }) {
        await dispatch('disposeIpfs');
        await dispatch('disposeSqlite');
    },

    async disposeIpfs({ state }) {
        if (state.IPFS && !state.IPFS_IS_HTTP) {
            try {
                await state.IPFS.stop();
            } catch (error) {
                console.warn(error);
            }
        }
    },

    async disposeSqlite({ state }) {
        try {
            if (state.SEARCH.prepared !== null && state.SEARCH.prepared.stmt != -1) {
                //await state.SQLITE?.reset(state.SEARCH.prepared.stmt);
                await state.SQLITE?.finalize(state.SEARCH.prepared.stmt);
                state.SEARCH.prepared.stmt = -1;
            }
            if (state.SQLITE && state.DB) {
                await state.SQLITE.close(state.DB);
            }
        } catch (error) {
            console.warn(error);
        }
    },

    resetResults({ commit }) {
        commit('RESULTS_set', []);
    },
};
export default actions;
