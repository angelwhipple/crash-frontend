<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref, defineProps } from "vue";

const props = defineProps(['email']);

const email = ref(props.email);
const password = ref("");
const { loginUser, updateSession } = useUserStore();

async function login() {
  await loginUser(email.value, password.value);
  void updateSession();
  void router.push({ name: "Home" });
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="login">
    <h3>Login</h3>
    <fieldset>
      <div class="pure-control-group">
        <label for="aligned-email">Email</label>
        <input v-model.trim="email" type="text" id="aligned-email" required />
      </div>
      <div class="pure-control-group">
        <label for="aligned-password">Password</label>
        <input type="password" v-model.trim="password" id="aligned-password" placeholder="Password" required />
      </div>
      <div class="pure-controls">
        <button type="submit" class="pure-button pure-button-primary">Submit</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}
</style>
