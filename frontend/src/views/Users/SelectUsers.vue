<script setup >
import Filters from "@/views/Users/Filters.vue";
import ListUsers from "@/views/Users/ListUsers.vue";
</script>

<template>
  <h1>Select Users</h1>
  <div class="division">
    <Filters/>
  </div>
  <div class="division">

    <ListUsers/>
  </div>

</template>

<style scoped>
.division{
  width:50%;
  height:100px;
  float:left;
}
</style>