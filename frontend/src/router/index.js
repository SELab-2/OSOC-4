import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/invite-users',
    name: 'InviteUsers',
    component: () => import('../views/InviteUsers.vue')
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
  },
  {
    path: '/invite/:key',
    name: 'JoinUser',
    component: () => import('../views/InviteUsers.vue')
  },
  // ERRORS
  {
    path: '/error',
    name: 'ErrorPage',
    component: () => import('../views/ErrorPage.vue'),
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router