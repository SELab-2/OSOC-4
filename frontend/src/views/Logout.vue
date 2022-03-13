<template>
  <h2>Logging out...</h2>

</template>

<script>
import {redirect} from "../utils/json-requests.js";
export default {
  name: "Logout",
  async mounted() {
    // call the logout function
    await this.logOut()
    this.commit('setState', null);
    await redirect("Login")
  }
}


</script>
<style scoped>

</style>