<script setup lang="ts">
</script>

<template>
  <router-link to="/projects" class="nav-link">Projects</router-link>
  <router-link to="/select-users" class="nav-link">Select Users</router-link>
  <router-link to="/manage-users" class="nav-link">Manage Users</router-link>
  <router-link  to="/invite-users" class="nav-link">Invite Users</router-link>
  <button >Log out</button>
  <router-view/>
</template>

<style scoped>

</style>