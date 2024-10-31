import { defineStore } from "pinia";
import { ref, watch } from "vue";

import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";
import { GroupDoc } from "../../server/concepts/grouping";
import { LocationDoc } from "../../server/concepts/locating";
import { useLocationStore } from "@/stores/locate"
import { inRange } from "@/utils/locator";

type SearchFilter = {
  category: string;
  name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
}

export const useGroupStore = defineStore(
  "group",
  () => {
    const locationStore = useLocationStore();

    const allGroups = ref<GroupDoc[]>([]);

    const groupCategory = ref("community")

    const searchFilter = ref<SearchFilter>({ category: groupCategory.value  });

    const filteredGroups = ref<GroupDoc[]>([]);

    const isCreatingGroup = ref(false);

    const setSearchFilter =  (filter: SearchFilter) => {
      searchFilter.value = filter;
    }

    // TODO: revise
    const filterGroups = async (byLocation: boolean) => {
      const matches: GroupDoc[] = await fetchy(
        `/api/groups/filter/${groupCategory.value}/${searchFilter.value.name}`,
        "GET",
        {}
      );

      if (byLocation) {
        const inRangeGroups = await Promise.all(
          matches.map(async (group) => {
            let location: LocationDoc = await locationStore.fetchLocation(group.location.toString());
            if (location.city == searchFilter.value.city || location.state == searchFilter.value.state
              || location.postal_code == searchFilter.value.postal_code) {
              return group;
            } else return null;
          })
        );
        filteredGroups.value = inRangeGroups.filter((group) => group !== null)
      } else {
        filteredGroups.value = matches;
      }
    }

    // const searchGroupsByName = async (name: string) => {
    //   let groups: GroupDoc[] = await fetchy(`/api/groups/query/${name}`, "GET", { alert: false });
    //   allGroups.value = groups.filter((group) => group.category === groupCategory.value);
    // }

    const setGroupCategory = async (view: string) => {
      groupCategory.value = view;
      await refreshAllGroups();
      await filterGroups(false);
    }

    const setIsCreatingGroup = (isCreating: boolean) => {
      isCreatingGroup.value = isCreating;
    }

    const refreshAllGroups = async () => {
      allGroups.value = await fetchy("/api/groups", "GET", { alert: false });
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

    // TODO: revise
    watch(searchFilter, async () => {
      if (searchFilter.value.city || searchFilter.value.state || searchFilter.value.postal_code) {
        await filterGroups(true);
      } else {
        await filterGroups(false);
      }
    });

    return {
      allGroups,
      filteredGroups,
      groupCategory,
      isCreatingGroup,
      refreshAllGroups,
      filterGroups,
      loadGroup,
      loadLivingOptions,
      joinGroup,
      leaveGroup,
      createGroup,
      deleteGroup,
      setGroupCategory,
      setSearchFilter,
      setIsCreatingGroup,
    }
  }
)