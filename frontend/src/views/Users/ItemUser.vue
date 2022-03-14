<template>
  <div class="card">
    <label>{{user.name}}</label>
  </div>
</template>

<script>
  export default {
    name: 'ItemUser',
    props: ['user']
  }
</script>

<style scoped>

</style>