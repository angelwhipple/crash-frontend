import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";
import { GroupDoc } from "../../server/concepts/grouping";
import { useUserStore } from "@/stores/user";


export const useGroupStore = defineStore(
  "group",
  () => {
    // TODO: Add active community

    const { currentUser } = storeToRefs(useUserStore());

    const allGroups = ref<GroupDoc[]>([]);

    const groupView = ref("community")

    const isCreatingGroup = ref(false);

    const subscribedGroups = computed<GroupDoc[]>(() => {
      if (currentUser.value) {
        return allGroups.value.filter((group: GroupDoc) => {
          return currentUser.value!.groups.some((groupId) => groupId === group._id);
        });
      }
      return [];
    })

    const setGroupView = (view: string) => {
      groupView.value = view;
    }

    const setIsCreatingGroup = (isCreating: boolean) => {
      isCreatingGroup.value = isCreating;
    }

    const refreshAllGroups = async () => {
      allGroups.value = await fetchy("/api/groups", "GET", {});
    }

    const loadGroup = async (id: string) => {
      return await fetchy(`/api/groups/${id}`, "GET", {});
    }

    const joinGroup = async (id: string, user: any) => {
      return await fetchy(`/api/groups/members/add/${id}`, "PUT", { body: { user } });
    }

    const leaveGroup = async (id: string, member: any) => {
      return await fetchy(`/api/groups/members/remove/${id}`, "PUT", { body: { member } });
    }

    const createGroup = async (name: string, category: string, privacy: string, capacity: number) => {
      const response = await fetchy("/api/groups", "POST", { body: { name, category, capacity, privacy } });
      await refreshAllGroups();
      return response;
    }

    const deleteGroup = async (id: ObjectId) => {
      const response = await fetchy(`/api/groups/${id}`, "DELETE", {});
      await refreshAllGroups();
      return response;
    }

    return {
      allGroups,
      subscribedGroups,
      groupView,
      isCreatingGroup,
      refreshAllGroups,
      loadGroup,
      joinGroup,
      leaveGroup,
      createGroup,
      deleteGroup,
      setGroupView,
      setIsCreatingGroup,
    }
  },
  { persist: true },
)