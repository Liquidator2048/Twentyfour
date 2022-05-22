import { ComputedState } from '@/store/types';

const state: ComputedState = {
    IPFS: null,
    IPFS_IS_HTTP: false,
    SQLITE: null,
    DB: null,
    SEARCH: {
        prepared: null,
        str: null,
        sql: '',
        hasMore: false,
        columns: ['magnet', 'title', 'info', 'date', 'cat_id'],
    },
    SEARCH_RESULTS: [],
    SEARCHING: 0,
    CATEGORIES: [],
};

export default state;
