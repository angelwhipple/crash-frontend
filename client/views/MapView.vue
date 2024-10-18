<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

</script>

<template>
  <main class="centered">
    <div class="map"></div>
  </main>
</template>

<style scoped>
.map {
  width: 75%;
  height: 75%;
  background-color: var(--primary);
}
</style>