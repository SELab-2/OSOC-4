import type {RouteRecordRaw} from "vue-router";
import {createRouter, createWebHistory} from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/sign-up',
        name: 'SignUp',
        component: () => import('../views/SignUp.vue')
    },
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('../views/Projects.vue')
    },
    {
        path: '/select-users',
        name: 'SelectUsers',
        component: () => import('../views/SelectUsers.vue')
    },
    {
        path: '/manage-users',
        name: 'ManageUsers',
        component: () => import('../views/ManageUsers.vue')
    }
    ];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router