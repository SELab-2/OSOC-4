import {createRouter, createWebHistory} from "vue-router";

//todo router env var gebruiken
//todo package.json env var gebruiken
//todo VITE_API_URL die dubbele slash wegdoen

const routes = [
  {
    path: '/development/frontend/login',
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
    component: () => import('../views/JoinUser.vue')
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

//todo get path from router
/*
router.beforeEach((to, from) => {
  if(to.name !== 'Login' &&! store.getters.getIsAuthenticated){
    return '/login'
  }
})
 */

export default router
