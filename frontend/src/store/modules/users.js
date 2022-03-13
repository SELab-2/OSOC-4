import {Engine} from "../../utils/json-requests";

const state = {
    isAuthenticated: false
};

const getters = {
    getIsAuthenticated: state => state.isAuthenticated,
}

const actions = {
    async logIn({dispatch}, user){
        console.log("trying to log in")
        this.engine = new Engine()
        await this.engine.login('http://localhost:8000/login', user)
        this.commit('setIsAuthenticated', true);
    },
    async logOut({commit}){
        console.log("logout")
        console.log(this.tokens)
        await this.engine.logout('http://localhost:8000/logout')
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