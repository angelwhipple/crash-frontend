import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";
import { GroupDoc } from "../../server/concepts/grouping";
import { useUserStore } from "@/stores/user";
import { useLocationStore } from "@/stores/locate"
import { inRange } from "@/utils/locator";

type GroupFilter = {
  name?: string;
  meterRadius: number,
  lat: number;
  lng: number;
};

export const useGroupStore = defineStore(
  "group",
  () => {
    const locationStore = useLocationStore();
    const { currentUser } = storeToRefs(useUserStore());

    const allGroups = ref<GroupDoc[]>([]);

    const groupFilter = ref<GroupFilter>();

    const filteredGroups = ref<GroupDoc[]>([]);

    const groupView = ref("community")

    const isCreatingGroup = ref(false);

    const setGroupFilter =  (filter: GroupFilter) => {
      groupFilter.value = filter;
    }

    const filterGroups = async () => {
      if (groupFilter.value) {
        let matches: GroupDoc[];
        if (groupFilter.value.name) {
          matches = await fetchy(`/api/groups/query/${groupFilter.value.name}`, "GET", { alert: false });
          matches = matches.filter((group) => group.name === groupView.value);
        } else {
          matches = allGroups.value;
        }

        const inRangeGroups = await Promise.all(
          matches.map(async (group) => {
            let location = await locationStore.fetchLocation(group.location.toString());
            let from = new google.maps.LatLng(groupFilter.value!.lat, groupFilter.value!.lng);
            let to = new google.maps.LatLng(location.lat, location.lng);
            if (inRange(from, to, groupFilter.value!.meterRadius)) {
              return group;
            } else return null;
          })
        );
        filteredGroups.value = inRangeGroups.filter((group) => group !== null)
      } else {
        filteredGroups.value = allGroups.value;
      }
    }

    const searchGroupsByName = async (name: string) => {
      let groups: GroupDoc[] = await fetchy(`/api/groups/query/${name}`, "GET", { alert: false });
      allGroups.value = groups.filter((group) => group.category === groupView.value);
    }

    const setGroupView = async (view: string) => {
      groupView.value = view;
      await refreshAllGroups();
      await filterGroups();
    }

    const setIsCreatingGroup = (isCreating: boolean) => {
      isCreatingGroup.value = isCreating;
    }

    const refreshAllGroups = async () => {
      let groups: GroupDoc[] = await fetchy("/api/groups", "GET", { alert: false });
      allGroups.value = groups.filter((group) => group.category === groupView.value);
    }

    const loadGroup = async (id: string) => {
      return await fetchy(`/api/groups/${id}`, "GET", { alert: false });
    }

    const loadLivingOptions = async (id: string) => {
      return await fetchy(`/api/groups/roommates/${id}`, "GET", { alert: false });
    }

    const joinGroup = async (id: string, user: any) => {
      return await fetchy(`/api/groups/members/add/${id}`, "PUT", { body: { user }, alert: false });
    }

    const leaveGroup = async (id: string, member: any) => {
      return await fetchy(`/api/groups/members/remove/${id}`, "PUT", { body: { member }, alert: false });
    }

    const createGroup = async (name: string, category: string, privacy: string, capacity: number, location: string, moveIn: string, moveOut: string) => {
      const response = await fetchy("/api/groups", "POST", { body: { name, category, capacity, privacy, location, moveIn, moveOut } });
      await refreshAllGroups();
      return response;
    }

    const deleteGroup = async (id: ObjectId) => {
      const response = await fetchy(`/api/groups/${id}`, "DELETE", {});
      await refreshAllGroups();
      return response;
    }

    watch(groupFilter, filterGroups);

    return {
      allGroups,
      filteredGroups,
      groupView,
      isCreatingGroup,
      refreshAllGroups,
      searchGroupsByName,
      filterGroups,
      loadGroup,
      loadLivingOptions,
      joinGroup,
      leaveGroup,
      createGroup,
      deleteGroup,
      setGroupView,
      setGroupFilter,
      setIsCreatingGroup,
    }
  }
)