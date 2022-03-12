import axios from 'axios';
import {postCreate} from "../../utils/json-requests";

const state = {
    user: null
};

const getters = {
    isAuthenticated: state => !!state.user,
    stateUser: state => state.user,
}

const actions = {
    async logIn({dispatch}, user){
        const data = postCreate('http://localhost:8000/login', user)
        this.commit('setUser', data);
    },
    async logout({commit}){
        this.commit('setUser', null);
    }
};

const mutations = {
    setUser(state, user){
        state.user = user
    }
};

export default{
    state,
    getters,
    actions,
    mutations
};