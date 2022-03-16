<template>
  <h1>
    Forgot password!
  </h1>
  <input v-model="user.email" type="email" name="" placeholder="Email address">
  <input class="submit" v-on:click=forgotBButton type="submit" name="" value="Reset password">
</template>

<script>
import {mapActions } from 'vuex';
export default {
  name: 'Forgot',
  data() {
    return {
      user: {
        email: ''
      }
    }
  },
  methods:{
    ...mapActions(['forgot']),
    async forgotBButton() {
      if (this.user.email !== "") {
        await this.forgot(this.user);
      }
    }
  }
}


</script>

<style scoped>

</style>