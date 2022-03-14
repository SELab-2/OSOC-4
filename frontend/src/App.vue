<script setup>
  import {ref} from "vue";
  import LoggedInHeader from "@/views/headers/LoggedInHeader.vue";
  import NotLoggedInHeader from "@/views/headers/NotLoggedInHeader.vue";

  const loggedIn = ref(false)
  function switchLoginStatus() {
    loggedIn.value = ! loggedIn.value
  }
</script>

<template>
  <header>
  </header>
  <main>
    <LoggedInHeader v-if="loggedIn"/>
    <NotLoggedInHeader v-else/>
    <br>
    <button @click=switchLoginStatus()>Log off / on view</button>
  </main>
</template>

<style>
</style>
