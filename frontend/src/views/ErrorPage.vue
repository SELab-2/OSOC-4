<template>
  <h1>Something went wrong</h1>
  <h2>Status: {{status}}</h2>
  <h3>Message: {{message}}</h3>
</template>

<script>
export default {
  name: "ErrorPage",
  props: {
    status: String,
    message: String
  }
}
</script>

<style scoped>
h1 {
  font-size: 64px;
}
</style>

