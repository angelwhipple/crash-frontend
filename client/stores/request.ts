import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useRequestStore = defineStore(
  "request",
  () => {

    const getRequestsByUser = async () => {
      return await fetchy("/api/requests", "GET", {});
    }

    const getRequestsByResource = async (resourceId: string, category: string) => {
      return await fetchy(`/api/requests/${category}/${resourceId}`, "GET", {});
    }

    const makeRequest = async (resourceId: string, category: string) => {
      return await fetchy(`/api/requests/${category}/${resourceId}`, "POST", {});
    }

    const withdrawRequest = async (requestId: string)  => {
      return await fetchy(`/api/requests/${requestId}`, "DELETE", {});
    }


    return {
      getRequestsByUser,
      getRequestsByResource,
      makeRequest,
      withdrawRequest,
    }
  },
  { persist: true },
)