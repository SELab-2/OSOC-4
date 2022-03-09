<script setup lang="ts">


import ItemUser from "@/views/Users/ItemUser.vue";

let users = [{name: "Test", studies: "Computer science"}]
</script>

<template>
  <h2>Users</h2>
  <div v-for="user in users">
    <item-user :user="user"/>
  </div>
</template>

<style scoped>

</style>