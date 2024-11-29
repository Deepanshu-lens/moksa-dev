<script lang="ts">
  // Imports
  import { onMount } from "svelte";
  import { Filter, Loader2, Search } from "lucide-svelte";
  import { user } from "@/stores";
  import * as Tabs from "@/components/ui/tabs";
  import Checkbox from "@/components/ui/checkbox/checkbox.svelte";
  import NodesTable from "./users/nodes-table.svelte";
  import UserTable from "./users/user-table.svelte";
  import LiveTable from "./permissions/live-table.svelte";
  import Policies from "./policies.svelte";

  // Type Definitions
  interface PermissionItem {
    collectionId: string;
    collectionName: string;
    created: string;
    feature: string;
    id: string;
    permission: string;
    updated: string;
  }

  interface PermissionsTabItem {
    id: string;
    value: string;
    label: string;
    features: PermissionItem[];
  }

  interface NavItem {
    id: number;
    label: string;
    logMessage?: string;
  }

  // Constants
  const BASE_URL = "https://license.lenscorp.cloud/api";
  // const BASE_URL = "https://license.lenscorp.cloud/test";

  const navItems: NavItem[] = [
    {
      id: 1,
      label: "User details",
      logMessage: "user clicked on user details button, user panel",
    },
    {
      id: 2,
      label: "Permissions",
      logMessage: "user clicked on permissions button, user panel",
    },
    {
      id: 3,
      label: "Policies",
      logMessage: "user clicked on policies button, user panel",
    },
  ];

  // State Variables
  let selected = 2;
  let permissionTab: "permissions" | "nodes" = "permissions";
  let permissionTabs: PermissionsTabItem[] = [];
  let userChildrenData: any[] = [];
  let userData: any;
  let isLoading = false;
  let userFeatures: any[] = [];
  let permissions: PermissionItem[] = [];

  // Functions
  async function fetchUserData(userId: string) {
    isLoading = true;
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}/details`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const childrenData = $user ? await fetchUserChildrenData($user.id) : [];
      userData = data;
      userChildrenData = childrenData;
      isLoading = false;

      // Fetch user features and permissions after fetching user data
      await fetchUserFeatures(userData.id);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function fetchUserFeatures(userId: string) {
    try {
      const features_response = await fetch(
        `${BASE_URL}/user/${userId}/featuresPermission`
      );
      const features_data = await features_response.json();

      userFeatures = features_data.features;

      permissionTabs = userFeatures.map((feature) => ({
        id: feature.id,
        value: feature.features.toLowerCase(),
        label: feature.features,
        features: features_data.permissions.filter(
          (permission: any) => permission.feature === feature.id
        ),
      }));
    } catch (error) {
      console.error("Error fetching feature API:", error);
    }
  }

  async function fetchUserChildrenData(userId: string) {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}/children`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function fetchUserChildrenDataByFeature(featureId: string) {
    try {
      const response = await fetch(
        `${BASE_URL}/user/${userData.id}/feature/${featureId}/subusers`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function assignPermissions(
    userId: string,
    featureId: string,
    permissions: string[]
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/user/feature-permission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          featureId,
          featurePermissionIds: permissions,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return { success: true, message: responseData.message };
    } catch (error: any) {
      console.error("Error assigning permissions:", error);
      return {
        success: false,
        error: error.error,
      };
    }
  }

  onMount(() => {
    if ($user && $user.id) {
      fetchUserData($user.id);
    }
  });
</script>

<div
  class="flex flex-col items-start lg:mt-12 mt-2 h-[calc(100vh-75px)] w-full text-black dark:text-white"
>
  <div
    class="flex w-full justify-start items-center lg:gap-20 gap-10 font-bold mb-4 px-8"
  >
    {#each navItems as item}
      {#if selected === item.id}
        <div class="relative">
          <span class="font-bold text-[#015A62] dark:text-white">
            {item.label}
          </span>
          <span
            class="h-[3px] rounded-full bg-[#015A62] w-full absolute left-0 -bottom-4"
          ></span>
        </div>
      {:else}
        <button
          class="cursor-pointer text-[#212427] dark:text-[rgba(255,255,255,.6)] font-medium"
          on:click={() => {
            selected = item.id;
            //if (item.logMessage) addUserLog(item.logMessage);
          }}
        >
          {item.label}
        </button>
      {/if}
    {/each}
  </div>
  {#if isLoading}
    <div class="flex justify-center items-center w-full h-full">
      <Loader2 size={32} class="animate-spin" />
    </div>
  {:else}
    {#if selected === 1}
      <div
        class="h-[1px] dark:bg-[#292929] w-[96%] lg:mb-8 mb-2 bg-[#e0e0e0]"
      ></div>
      <!-- User Table -->
      <UserTable {userData} {userChildrenData} />
    {/if}
    {#if selected === 2}
      <div
        class="h-[1px] dark:bg-[#292929] w-[96%] lg:mb-8 mb-3 bg-[#e0e0e0]"
      ></div>
      <!-- Header Container -->
      <div
        class="w-[96%] mx-auto justify-between flex items-start lg:items-center lg:flex-row flex-col px-6 mb-4 border border-gray-300 rounded-lg mt-5"
      >
        <div class="py-3">
          <div class="flex-cb">
            <h2 class="font-medium text-lg">Permission</h2>
          </div>
          <p class="text-xs font-normal text-[#667085]">
            Select & modify permissions to users
          </p>
        </div>
        <span
          class="flex items-center justify-center rounded-lg border-black/[.13] border-solid border-[1px] p-1 w-[270px] h-[40px] -mx-2"
        >
          <button
            on:click={() => (permissionTab = "permissions")}
            class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${permissionTab === "permissions" ? "text-white bg-[#015A62]" : "bg-transparent"}`}
            >Permissions</button
          >
          <button
            on:click={() => (permissionTab = "nodes")}
            class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${permissionTab === "nodes" ? "text-white bg-[#015A62]" : "bg-transparent"}`}
            >Nodes</button
          >
        </span>
        <span class="flex items-center gap-4">
          <span
            class="text-xs font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
            ><Filter size={18} /> Filters</span
          >
          <span
            class="relative rounded-lg border-2 border-solid border-[#d0d5dd]/10"
          >
            <input
              disabled
              type="text"
              placeholder="Search"
              class="border-none text-black outline-none pr-2 pl-8 py-2 text-sm placeholder:text-black bg-transparent"
            />
            <Search
              class="absolute top-1/2 -translate-y-1/2 left-2 opacity-50"
              size={18}
            />
          </span>
        </span>
      </div>
      {#if permissionTab === "permissions"}
        <Tabs.Root
          class="lg:mx-auto lg:w-full overflow-x-auto px-6 pb-0 bg-transparent"
        >
          <div class="lg:w-full w-[90vw] lg:px-2 overflow-auto">
            <Tabs.List
              class="flex flex-wrap lg:flex-nowrap items-center w-full"
            >
              {#each permissionTabs as tab (tab.id)}
                <Tabs.Trigger
                  bind:value={tab.value}
                  class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full"
                >
                  <Checkbox class="rounded-full" />
                  {tab.label}
                </Tabs.Trigger>
              {/each}
            </Tabs.List>
          </div>

          {#each permissionTabs as tab (tab.id)}
            <Tabs.Content value={tab.value} class="mt-0">
              <LiveTable
                permissions={tab.features}
                featureId={tab.id}
                fetchSubUsers={fetchUserChildrenDataByFeature}
                {assignPermissions}
              />
            </Tabs.Content>
          {/each}
        </Tabs.Root>
      {:else}
        <div
          class="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] max-w-[calc(100vw-5.5rem)] hide-scrollbar pb-10 pt-4 px-6"
        >
          <NodesTable />
        </div>
      {/if}
    {/if}
    {#if selected === 3}
      <Policies />
    {/if}
  {/if}
</div>

<style>
  .shad {
    box-shadow: 0px 4px 4px 0px #0000000f;
  }
</style>
