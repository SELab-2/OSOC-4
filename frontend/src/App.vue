<script setup>
  import LoggedInHeader from "@/views/headers/LoggedInHeader.vue";
  import NotLoggedInHeader from "@/views/headers/NotLoggedInHeader.vue";
</script>

<template>
  <header>
  </header>
  <main>
    <LoggedInHeader v-if="this.$store.getters.getIsAuthenticated"/>
    <NotLoggedInHeader v-else/>
  </main>
</template>

<script>
export default {
  name: 'App'
}


</script>

<style>
</style>
