<script setup lang="ts">
  import {ref} from "vue";
  import LoggedInHeader from "@/views/headers/LoggedInHeader.vue";
  import NotLoggedInHeader from "@/views/headers/NotLoggedInHeader.vue";

  const loggedIn = ref(false)
  const admin = ref(false)
  function switchLoginStatus() {
    loggedIn.value = ! loggedIn.value
  }
  function switchAdminStatus(){
    admin.value = ! admin.value
  }

</script>

<template>
  <header>
  </header>
  <main>
    <p v-if=admin.valueOf()> you are an admin </p>
    <LoggedInHeader v-if="loggedIn"/>
    <template v-else>
      <NotLoggedInHeader :admin="admin.valueOf()"/>
    </template>
    <br>
    <button @click=switchLoginStatus()>Log off / on view</button>
    <button @click=switchAdminStatus()>Turn admin mode off / on</button>
  </main>
</template>

<style>
</style>
