import Vuex from 'vuex';
import { RootState } from './root/types';
import computed from './computed/index';
import state from './root/state';
import mutations from './root/mutations';
import getters from './root/getters';
import actions from './root/actions';
import { createLogger } from 'vuex';

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store<RootState>({
    state,
    mutations,
    getters,
    actions,
    modules: { computed },
    strict: false,
    plugins: debug ? [createLogger()] : [],
    devtools: debug,
});

