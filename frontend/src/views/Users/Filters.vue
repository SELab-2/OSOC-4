<script setup lang="ts">

import {ref} from "vue";

let filters: string[] = ["Marketer", "Video editor", "Copywriter"];
let nameFilter = "Roles"
let checkedFilter = ref([]);
</script>

<template>
  <h2>{{ nameFilter }}</h2>
  <div v-for="filter in filters">
    <input type="checkbox" :key="filter" :value="filter" v-model="checkedFilter">
    <label>{{filter}}</label>
  </div>
</template>

<style scoped>

</style>