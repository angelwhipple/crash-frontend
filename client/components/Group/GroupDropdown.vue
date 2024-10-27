<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { useGroupStore } from "@/stores/group";
import { storeToRefs } from "pinia";

const props = defineProps(["groupType", "activeCommunity"]);
const emit = defineEmits(["changeCommunity"])

const groupStore = useGroupStore();

const handleSelect = (event: any) => {
  emit("changeCommunity", event.target.options[event.target.selectedIndex].id);
}
</script>

<template>
  <select @change="handleSelect"></select>
</template>

<style scoped>
select {
  align-self: center;
  width: 60%;
}

option {
  text-align: center;
}
</style>