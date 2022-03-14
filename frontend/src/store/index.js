import {createStore} from 'vuex';
import createPersistedState from "vuex-persistedstate";

import users from './modules/users';

export default createStore({
    modules: {
        users
    },
    plugins: [createPersistedState()]
})