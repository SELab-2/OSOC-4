<script >
import {mapActions } from 'vuex';
export default {
  name: 'Login',
  data() {
    return {
      user: {
        email: '',
        password: ''
      }
    }
  },
  methods:{
    ...mapActions(['logIn']),
    async loginButton() {
      if (this.user.email !== "" && this.user.password !== "") {
        await this.logIn(this.user);
        // console.log(this.user.password)
        // console.log(this.user.email)
        // await this.logIn(this.user)
        // console.log('finished login in?');
      }
    }
  }
}


</script>

<template>
    <h1>Login</h1>
    <p class="text-muted"> Please enter your login and password!</p>
    <input v-model="user.email" type="email" name="" placeholder="Email">
    <br/>
    <input v-model="user.password" type="password" name="" placeholder="Password">
    <br/>
    <input v-on:click=loginButton type="submit" name="" value="Login">
</template>

<style scoped>
</style>