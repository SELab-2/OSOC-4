import {createRouter, createWebHistory} from "vue-router";
import store from "../store"

const BASEURL = import.meta.env.VITE_FRONTEND_BASE_URL || "/test"; //TODO: CHANGE THIS TO THE RIGHT ENV VAR

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

for (let route of routes) {
  route.path = BASEURL + route.path;
}

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from) => {
  if((to.name !== 'Login') &&! store.getters.getIsAuthenticated){
    // redirect the user to the login page
    console.log("Not logged in")
    return { name: 'Login' }
  }
})


export default router
