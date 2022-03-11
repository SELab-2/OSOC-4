<script setup lang="ts">
const props = defineProps({
  admin : Boolean
})

console.log(props.admin)

function test(){
  console.log("TEST");
  console.log(props.admin);
}
</script>

<template>
  <router-link to="/projects" class="nav-link">Projects</router-link>
  <router-link to="/select-users" class="nav-link">Select Users</router-link>
  <router-link to="/manage-users" class="nav-link">Manage Users</router-link>
  <router-link v-if="props.admin" to="/add-users" class="nav-link">Add Users</router-link>
  <p v-else> not admin</p>
  <button @click=test>Log out</button>
  <router-view/>
</template>

<style scoped>

</style>