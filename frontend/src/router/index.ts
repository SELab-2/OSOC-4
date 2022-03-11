import type {RouteRecordRaw} from "vue-router";
import {createRouter, createWebHistory} from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/add-users',
        name: 'AddUsers',
        component: () => import('../views/AddUsers.vue')
    },
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('../views/ManageProjects.vue')
    },
    {
        path: '/select-users',
        name: 'SelectUsers',
        component: () => import('../views/Users/SelectUsers.vue')
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