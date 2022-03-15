<script setup>
  import LoggedInHeader from "@/views/headers/LoggedInHeader.vue";
  import NotLoggedInHeader from "@/views/headers/NotLoggedInHeader.vue";
</script>

<template>
  <header>
  </header>
  <main>
    <LoggedInHeader v-if="$store.getters.getIsAuthenticated"/>
    <NotLoggedInHeader v-else/>
  </main>
</template>

<script>
import store from "@/store/index"
import {isStillAuthenticated, redirect} from "./utils/json-requests";
export default {
  name: 'App'
}

window.addEventListener('storage', function(event) {
  if (! isStillAuthenticated()) {
    console.log("Logged out from another tab")
    store.commit("setIsAuthenticated", false)
    redirect("Login")
  }
});

</script>

<style>
@import './assets/styles/base.css';
</style>
