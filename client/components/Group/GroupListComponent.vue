<script setup lang="ts">
import { ref, defineProps } from "vue";
import { useGroupStore } from "@/stores/group";
import GroupComponent from "@/components/Group/GroupComponent.vue";

const props = defineProps(["groupType"]);
const { loadAllGroups } = useGroupStore();

const groups = await loadAllGroups();

</script>

<template>
  <section class="list-view">
    <GroupComponent v-for="group in groups" :id="group._id"></GroupComponent>
  </section>
</template>

<style scoped>
.list-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
}
</style>