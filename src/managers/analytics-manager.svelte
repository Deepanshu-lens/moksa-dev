<script lang="ts">
  import { analyticsData } from "@/stores/analytics-data";
  import { moksaToken } from "@/stores/moksa-token";
  import { onMount } from "svelte";
  const mToken = $moksaToken;

  const safeExecute = async (fn, fallbackValue) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 10000)
      );
      const result = await Promise.race([fn(), timeoutPromise]);
      // console.log(result);
      return result !== null && result !== undefined ? result : fallbackValue;
    } catch (error) {
      console.error(`Error executing function: ${error}`);
      return fallbackValue;
    }
  };

  const today = new Date();
  const oneYearAgo = new Date(today);
  const oneWeekAgo = new Date(today);

  oneYearAgo.setFullYear(today.getFullYear() - 1);
  oneWeekAgo.setDate(today.getDate() - 7);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const dropwdown = async () => {
    const response = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/getAllStoresForDropdown`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
          enableallstores: "true",
        },
      }
    );
    return response.json();
  };

  const allStoreData = async () => {
    const allstoreData = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/getAllStoresTotals/-1/${formatDate(oneWeekAgo)}/${formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return allstoreData.json();
  };

  const aisleData = async () => {
    const aisleData = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/getAllStoresWithAisleDetails/1/100/${formatDate(oneYearAgo)}/${formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return aisleData.json();
  };

  const alltheftandcamera = async () => {
    const theftandcamera = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/getAllStoresWithTheftAndCameraDetails/1/100/${formatDate(oneYearAgo)}/${formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return theftandcamera.json();
  };

  const theftDetectionDetails = async () => {
    const theftDetectionDetails = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/theft/theftDetectionDetailsByStoreid/-1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
          "Content-Type": "application/json",
          datetype: "7",
          startDate: formatDate(oneWeekAgo),
          endDate: formatDate(today),
        },
      }
    );

    const data = await theftDetectionDetails?.json();
    return data;
  };

  const busyness = async () => {
    const busyness = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/storeBusyHour/getStoreBusyHourDataForThisWeek/-1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return busyness.json();
  };

  const efficiency = async () => {
    const efficiency = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/-1/${formatDate(oneWeekAgo)}/1/100/${formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return efficiency.json();
  };

  const safetyDetails = async () => {
    const safetyDetails = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/-1/1/100/${formatDate(oneWeekAgo)}/${formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return safetyDetails.json();
  };

  const storePeopleCount = async () => {
    const spc = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/people/getPeopleCount/-1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
          "Content-Type": "application/json",
          datetype: "7",
          Pagepersize: "100",
          Pagenumber: "1",
        },
      }
    );
    return spc.json();
  };

  const allUsers = async () => {
    const allUsers = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/getAllUsers/1/100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
        },
      }
    );
    return allUsers.json();
  };

  const apiCalls = {
    theftData: () => theftDetectionDetails(),
    stores: () => dropwdown(),
    allstoreData: () => allStoreData(),
    aisleData: () => aisleData(),
    theftandcamera: () => alltheftandcamera(),
    busyness: () => [],
    efficiency: () => efficiency(),
    safetyDetails: () => safetyDetails(),
    usersData: () => allUsers(),
    storePeopleCount: () => storePeopleCount(),
    // userStoreDetails: async () => {
    //   const res = await fetch(
    //     `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`,
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${mToken}`,
    //       },
    //     }
    //   );
    //   return res.json();
    // },
  };

  onMount(async () => {
    const results = await Promise.all(
      Object.entries(apiCalls).map(async ([key, fn]) => {
        const value = await safeExecute(fn);
        return [key, value];
      })
    );
    const data = Object.fromEntries(results);
    if (!!data) {
      analyticsData.set(data);
    } else {
      analyticsData.set({});
    }
  });
</script>
