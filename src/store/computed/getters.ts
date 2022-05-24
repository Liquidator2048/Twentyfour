import { GetterTree } from 'vuex';
import { Category, ComputedState } from './types';
import { RootState } from '../root/types';
import w3lib from '@/libs/w3lib';

const getters: GetterTree<ComputedState, RootState> = {
    async getDBPathfromWeb3(state: ComputedState, getters, rootState: RootState): Promise<string> {
        if (!rootState.WEB3_CONTRACT_ADDRESS) {
            throw new Error('no contract address');
        }
        if (!rootState.WEB3_USE_BROWSER_PROVIDER && !rootState.WEB3_RPC) {
            throw new Error('no Web3 provider');
        }
        return await w3lib(rootState.WEB3_CONTRACT_ADDRESS, rootState.WEB3_USE_BROWSER_PROVIDER, rootState.WEB3_RPC, rootState.WEB3_CHAIN_ID).getDbcid();
    },
    SEARCHING(state: ComputedState): boolean {
        return state.SEARCHING > 0;
    },
    CATEGORY_BY_ID(state: ComputedState) {
        return function(id: number): Category | null {
            for (const cat of state.CATEGORIES) {
                if (cat.id === id) return cat;
            }
            return null;
        };
    },
};
export default getters;
