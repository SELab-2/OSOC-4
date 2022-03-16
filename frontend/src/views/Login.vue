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
      }
    }
  }
}


</script>

<template>
  <div id="reset-this-root">

  <div class="header">
    <p class="title">Welcome!</p>
  </div>

  <div class="body">

    <section class="side">
      <img src="../assets/images/logo-osoc-color.svg" alt="osoc-emblem">
    </section>

    <section class="main">

      <div class="login-container">
        <p class="welcome-message">Please provide login credentials to proceed</p>
        <div class="login-form">
          <input v-model="user.email" type="email" name="" placeholder="Email address">
          <input v-model="user.password" type="password" name="" placeholder="Password">
          <input class="submit" v-on:click=loginButton type="submit" name="" value="Login">
        </div>
      </div>
    </section>
  </div>

  </div>
</template>

<style scoped>
@import "../assets/styles/base.css";
@import "../assets/styles/login.css";
</style>