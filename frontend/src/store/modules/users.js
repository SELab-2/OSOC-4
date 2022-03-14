import {login, logout, redirect} from "../../utils/json-requests";

const state = {
    isAuthenticated: false
};

const getters = {
    getIsAuthenticated: state => state.isAuthenticated,
}

const actions = {
    async logIn({getters, commit}, user){
        console.log("login")
        await login('http://localhost:8000/login', user, getters, commit)
    },
    async logOut({getters, commit}){
        await logout('http://localhost:8000/logout', getters, commit)
        await redirect("Login")
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