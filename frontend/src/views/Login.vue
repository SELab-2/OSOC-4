<script setup lang="ts" xmlns:name="http://www.w3.org/1999/xhtml">
import {ref} from "vue";

let email = ref("");
let password = ref("");

function loginButton(){
  console.log(email.value);
  console.log(password.value)
}

</script>

<template>
    <h1>Login</h1>
    <p class="text-muted"> Please enter your login and password!</p>
    <input v-model="email" type="email" name="" placeholder="Email">
    <br/>
    <input v-model="password" type="password" name="" placeholder="Password">
    <br/>
    <input v-on:click=loginButton() type="submit" name="" value="Login">
    <br/>
    <p @click="$router.push('/sign-up')">Don't have an account yet?</p>
</template>

<style scoped>
</style>