<script>
import {mapActions } from 'vuex';
export default {
  name: 'LogOut',
  methods:{
    ...mapActions(['logOut']),
    async logOutButton() {
        await this.logOut();
    }
  }
}
</script>

<template>
  <router-link to="/projects" class="nav-link">Projects</router-link>
  <router-link to="/select-users" class="nav-link">Select Users</router-link>
  <router-link to="/manage-users" class="nav-link">Manage Users</router-link>
  <router-link  to="/invite-users" class="nav-link">Invite Users</router-link>
  <button v-on:click=logOutButton type="submit" name="" value="LogOut">Log out</button>
  <router-view/>
</template>

<script>

</script>

<style scoped>

</style>