<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref, defineEmits } from "vue";

let emit = defineEmits(["edit"]);

function edit() {
  emit("edit");
}
</script>

<template>
  <p>User details</p>
  <button class="pure-button pure-button-primary" @click="edit()">Edit</button>
</template>