import { RootState } from '../root/types';
import { ComputedState } from './types';
import { Module } from 'vuex';
import state from './state';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

const namespaced = true;

const computed: Module<ComputedState, RootState> = {
    namespaced,
    mutations,
    actions,
    getters,
    state,
};
export default computed;
