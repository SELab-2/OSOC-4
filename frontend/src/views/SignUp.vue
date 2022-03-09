<script setup lang="ts">
import {ref} from "vue";

let name = ref("");
let email = ref("");
let password = ref("");
let passwordCheck = ref("");

function signUp() {
  if(name.value !== "" && email.value !== "" && password.value === passwordCheck.value){
    console.log(email.value);
    console.log(password.value);
    console.log(name.value);
  }
}
</script>

<template>
  <h1>Sign up</h1>
  <input v-model="name" type="text" name="" placeholder="Your name">
  <br/>
  <input v-model="email" type="email" name="" placeholder="Email">
  <br/>
  <input v-model="password" type="password" name="" placeholder="Password">
  <br/>
  <input v-model="passwordCheck" type="password" name="" placeholder="Repeat password">
  <br/>
  <input v-on:click=signUp() type="submit" name="" value="SignUp">
  <br/>
  <p @click="$router.push('/login')">Already have an account?</p>
</template>

<style scoped>

</style>