<script setup >
import {ref} from "vue";

let emailRef = ref("");
let passwordRef = ref("");

function loginButton(){
  if(emailRef.value !== "" && passwordRef.value !== ""){
    console.log(passwordRef.value)
    console.log(emailRef.value)
  }
}

</script>

<template>
    <h1>Login</h1>
    <p class="text-muted"> Please enter your login and password!</p>
    <input v-model="emailRef" type="email" name="" placeholder="Email">
    <br/>
    <input v-model="passwordRef" type="password" name="" placeholder="Password">
    <br/>
    <input v-on:click=loginButton() type="submit" name="" value="Login">
    <br/>
    <p @click="$router.push('/sign-up')">Don't have an account yet?</p>
</template>

<style scoped>
</style>