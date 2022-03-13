import {Engine, redirect} from "../../utils/json-requests";

const state = {
    isAuthenticated: false
};

const getters = {
    getIsAuthenticated: state => state.isAuthenticated,
}

const actions = {
    async logIn({dispatch}, user){
        this.engine = new Engine()
        await this.engine.login('http://localhost:8000/login', user)
        this.commit('setIsAuthenticated', true);
    },
    async logOut({commit}){
        await this.engine.logout('http://localhost:8000/logout')
        await redirect("Login")
        this.commit('setIsAuthenticated', false);
    }
};

const mutations = {
    setIsAuthenticated(state, value){
        state.isAuthenticated = value
    }
};

export default{
    state,
    getters,
    actions,
    mutations
};