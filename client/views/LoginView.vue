<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const email = ref("");
const verified = ref(false);
const accountExists = ref(false);
const { fetchUserByEmail } = useUserStore();

async function verifyEmail() {
  try {
    const user = await fetchUserByEmail(email.value);
    if (user) {
      accountExists.value = true;
    }
  } catch (e) {}
  verified.value = true;
}
</script>

<template>
  <h1>GET STARTED</h1>
  <section v-if="!verified" class="centered">
    <div style="display:flex; flex-direction: column;">
      <p style="opacity: 0.5">Provide a work or school email</p>
      <form class="pure-form pure-form-aligned" @submit.prevent="verifyEmail">
          <div class="pure-control-group">
            <input v-model.trim="email" type="text" id="aligned-email" placeholder="Email" required />
            <button type="submit" class="pure-button pure-button-primary">Next</button>
          </div>
      </form>
    </div>
  </section>
  <section v-else class="centered">
    <LoginForm v-if="accountExists" v-bind:email="email"/>
    <RegisterForm v-else v-bind:email="email"/>
  </section>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
