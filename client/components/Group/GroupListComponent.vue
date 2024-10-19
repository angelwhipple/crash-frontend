<script setup lang="ts">
import { ref, defineProps } from "vue";
import { useGroupStore } from "@/stores/group";
import GroupComponent from "@/components/Group/GroupComponent.vue";
import { storeToRefs } from "pinia";

const props = defineProps(["groupType"]);

const { allGroups } = storeToRefs(useGroupStore());
</script>

<template>
  <section class="scrollable">
    <GroupComponent v-for="group in allGroups" :group="group" :group-type="props.groupType" ></GroupComponent>
  </section>
</template>

<style scoped>
.scrollable {
  width: 100%;
  height: 100%;
  display: flex;
  column-gap: 1rem;
}
</style>