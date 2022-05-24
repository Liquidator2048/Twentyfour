import { RootState } from '../root/types';
import { GetterTree } from 'vuex';

const getters: GetterTree<RootState, RootState> = {
    LOADING(state: RootState): boolean {
        return state.LOADING > 0;
    },
};

export default getters;
