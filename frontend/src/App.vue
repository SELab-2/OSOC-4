<script setup>
  import LoggedInHeader from "@/views/headers/LoggedInHeader.vue";
  import NotLoggedInHeader from "@/views/headers/NotLoggedInHeader.vue";
</script>

<template>
  <header>
  </header>
  <main>
    <LoggedInHeader v-if="loggedIn"/>
    <NotLoggedInHeader v-else/>
  </main>
</template>

<script>
export default {
  name: 'App',
  computed: {
    loggedIn: function (){
      return this.$store.getters.isAuthenticated;
    }
  }
}


</script>

<style>
</style>
