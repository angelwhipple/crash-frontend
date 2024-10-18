<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { useGroupStore } from "@/stores/group";
import { storeToRefs } from "pinia";

const props = defineProps(["groupType"]);
const emit = defineEmits(["createNew"])

const groupStore = useGroupStore();
const { subscribedGroups } = storeToRefs(groupStore);

const handleSelect = (event: any) => {
  if (event.target.value === `New ${props.groupType}`) {
    emit("createNew");
  }
}
</script>

<template>
    <select @change="handleSelect">
      <option id="group._id" v-for="group of subscribedGroups">{{group.name}}</option>
      <option>New {{props.groupType}}</option>
    </select>
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