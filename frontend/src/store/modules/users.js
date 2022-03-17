import { login, logout, redirect } from "../../utils/json-requests";
import {log} from "../../utils/logger";

const state = {
    isAuthenticated: false
};

const getters = {
    getIsAuthenticated: state => state.isAuthenticated,
}

const actions = {
    async logIn({ getters, commit }, user) {
        log("Users: login")
        await login('/login', user, getters, commit)
    },
    async logOut({ getters, commit }) {
        log("Users: logout")
        await logout('/logout', getters, commit)
        log("Users: logout: redirect to Login")
        await redirect("Login")
    }
};

const mutations = {
    setIsAuthenticated(state, value) {
        log("Users: setIsAuthenticated: " + value)
        state.isAuthenticated = value
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};