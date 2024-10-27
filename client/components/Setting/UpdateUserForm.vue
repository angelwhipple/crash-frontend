<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref, defineEmits } from "vue";

let emit = defineEmits(["cancelEdit"]);
const userStore = useUserStore();

let firstName = ref("");
let lastName = ref("");
let username = ref("");
let currentPassword = ref("");
let newPassword = ref("");

async function updateLegalName() {
  await userStore.updateUserLegalName(firstName.value, lastName.value);
  await userStore.updateSession();
  firstName.value = lastName.value = "";
}

async function updateUsername() {
  await userStore.updateUserUsername(username.value);
  await userStore.updateSession();
  username.value = "";
}

async function updatePassword() {
  await userStore.updateUserPassword(currentPassword.value, newPassword.value);
  await userStore.updateSession();
  currentPassword.value = newPassword.value = "";
}

function cancelEdit() {
  emit("cancelEdit");
}
</script>

<template>
  <h2>Update user details</h2>
  <form @submit.prevent="updateLegalName" class="pure-form">
    <fieldset>
      <legend>Change your name</legend>
      <input type="text" placeholder="First name" v-model="firstName" required />
      <input type="text" placeholder="Last name" v-model="lastName" required />
      <button type="submit" class="pure-button pure-button-primary">Update name</button>
    </fieldset>
  </form>

  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Change your username</legend>
      <input type="text" placeholder="New username" v-model="username" required />
      <button type="submit" class="pure-button pure-button-primary">Update username</button>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <input type="password" placeholder="Old password" v-model="currentPassword" required />
      <input type="password" placeholder="New password" v-model="newPassword" required />
      <button type="submit" class="pure-button pure-button-primary">Update password</button>
    </fieldset>
  </form>

  <button type="submit" class="pure-button pure-button-primary" @click="cancelEdit()">Go back</button>
</template>
