<script lang="ts">
  // Imports
  import { Label } from "@/components/ui/label";
  import {
    ChevronRight,
    Eye,
    EyeClosed,
    Loader2,
    Plus,
    Search,
  } from "lucide-svelte";
  import Input from "@/components/ui/input/input.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import Doors from "@/components/atlas/doors.svelte";
  import EventTable from "@/components/atlas/tables/events.svelte";
  import UserTable from "../atlas/tables/users.svelte";
  import { toast } from "svelte-sonner";
  import PanelCard from "@/components/atlas/panel-card.svelte";
  import { Switch } from "@/components/ui/switch";
  import { writable } from "svelte/store";
  import AddPanel from "@/components/atlas/dialoges/add-panel.svelte";
  import { panels, activePanel, user, isPanelLoading } from "@/stores";
  import pb from "@/lib/pb";
  import * as Tabs from "@/components/ui/tabs";
  import { addUserLogs } from "@/lib/logs/userLogs";

  // Variables
  let searchDoor = writable("");
  let showRightPanel = true;
  let serverIp = "";
  let serverPort = "";
  let username = "";
  let password = "";
  let doorList: never[] = [];
  let userList: never[] = [];
  let name = "";
  let ssl = false;
  let isLoading = false;
  let isPassVisible = false;

  // Functions
  async function handleSubmit(addPanelData = null) {
    try {
      isLoading = true;
      // Use form data if addPanelData is not provided
      const panelDataToSubmit = addPanelData || {
        name,
        username,
        password,
        ip_addr: serverIp,
        httpPort: serverPort,
        ssl,
        session: $user?.session[0],
      };
      await pb.collection("atlas").create(panelDataToSubmit);
      addUserLogs(`User added panel ${name}`, $user?.email || "", $user?.id || "");
      showRightPanel = false;
      toast.success("Panel added successfully");
      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error adding panel:", error);
      toast.error("Failed to add panel");
    } finally {
      isLoading = false;
    }
  }

  $: if ($activePanel) {
    const activePanelData = $panels.find(
      (panel: any) => panel.id === $activePanel
    );
    if (activePanelData) {
      doorList = activePanelData.expand?.doors || [];
      userList = activePanelData.expand?.users || [];
    }
  }
</script>

{#if $isPanelLoading}
  <div class="w-full h-full flex items-center justify-center">
    <Loader2 size={32} class="animate-spin" />
  </div>
{:else}
  <section
    class="h-full w-full flex justify-between relative items-center max-h-[calc(100vh-75px)]"
  >
    {#if $panels?.length > 0 && $activePanel}
      <div class="w-full h-[calc(100vh-75px)] relative">
        <Tabs.Root value="doors" class="px-4">
          <Tabs.List
            class="flex items-center justify-center gap-4 max-w-[500px] mx-auto mt-4 rounded-lg"
          >
            <!-- <Tabs.Trigger value="users" class="w-1/3 rounded-lg">Users</Tabs.Trigger> -->
            <Tabs.Trigger value="doors" class="w-1/2 rounded-lg"
              >Doors</Tabs.Trigger
            >
            <Tabs.Trigger value="events" class="w-1/2 rounded-lg"
              >Events</Tabs.Trigger
            >
          </Tabs.List>
          <Tabs.Content value="users">
            <UserTable data={userList || []} />
          </Tabs.Content>
          <Tabs.Content value="doors">
            <div class="top-bar py-4 flex justify-between items-center">
              <span class="flex items-center justify-between gap-4 py-4 w-full">
                <span class="flex flex-col gap-1">
                  <span class="flex items-center gap-2">
                    <p class="text-xl font-medium">Doors</p>
                    <p
                      class="text-[#0070FF] bg-[#0070FF]/[.2] text-sm rounded-full px-2 py-.5 font-medium mt-1"
                    >
                      Super Admin
                    </p>
                  </span>
                </span>
                <span class="relative">
                  <Input
                    placeholder="Search"
                    class="w-[250px] pl-8 active:border-brand"
                    on:input={(e: any) => searchDoor.set(e.target.value)}
                  />
                  <Search
                    size={18}
                    class="absolute top-1/2 -translate-y-1/2 left-2"
                  />
                </span>
              </span>
            </div>
            <div class="max-h-[70vh] overflow-y-auto">
              <Doors data={doorList} search={searchDoor} />
            </div>
          </Tabs.Content>
          <Tabs.Content value="events">
            <EventTable />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    {:else if $panels?.length > 0 && !$activePanel}
      <div
        class="w-full h-[calc(100vh-75px)] flex flex-col justify-center items-center p-4 bg-gray-100 dark:bg-black"
      >
        <div class="text-center">
          <h1
            class="text-2xl font-bold text-brand-foreground dark:text-brand mb-4"
          >
            Welcome to Atlas Panel
          </h1>
          <p class="text-lg text-gray-60 mb-8 dark:text-slate-200">
            Please select a panel to access the system features.
          </p>
        </div>
      </div>
    {:else}
      <div
        class="w-full h-[calc(100vh-75px)] flex flex-col justify-center items-center p-4 bg-gray-100 dark:bg-black"
      >
        <div class="text-center">
          <h1
            class="text-2xl font-bold text-brand-foreground dark:text-brand mb-4"
          >
            Welcome to Atlas Panel
          </h1>
          <p class="text-lg text-gray-600 mb-8 dark:text-slate-200">
            Please add a panel to access the features.
          </p>
        </div>
      </div>
    {/if}
    <button
      on:click={() => (showRightPanel = !showRightPanel)}
      class={`absolute ${showRightPanel ? `right-[20%] xl:right-[18rem]` : "right-0"} py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800 top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500`}
    >
      <ChevronRight
        class={`${showRightPanel ? "rotate-0 " : "rotate-180"} transition-transform ease-in-out duration-700`}
      />
    </button>
    <div
      id="infopanel"
      class={`h-[calc(100vh-75px)] border-solid
     border-x-[1px]
     transition-width ease-in-out duration-500 overflow-y-scroll flex flex-col gap-6
    ${showRightPanel ? "w-1/4 p-4" : " p-0 w-0"} relative max-w-72`}
    >
      {#if showRightPanel}
        {#if $panels?.length === 0}
          <p
            class="text-center text-xl font-bold text-brand-foreground dark:text-brand"
          >
            Connect Panel
          </p>
          <Label class="flex flex-col gap-2">
            Name
            <Input
              id="name"
              name="name"
              placeholder="Panel name"
              bind:value={name}
              autocapitalize="off"
              autocomplete="off"
            />
          </Label>
          <Label class="flex flex-col gap-2">
            Username
            <Input
              id="username"
              name="username"
              placeholder="Username"
              bind:value={username}
              autocapitalize="off"
              autocomplete="off"
            />
          </Label>
          <Label class="flex flex-col gap-2">
            Password
            <div class="relative">
              <Input
                id="password"
                name="password"
                placeholder="password"
                type={isPassVisible ? "text" : "password"}
                bind:value={password}
                autocapitalize="off"
                autocomplete="off"
              />
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span
                class="text-white/60 absolute inset-y-3 right-2"
                on:click={() => {
                  isPassVisible = !isPassVisible;
                }}
              >
                {#if isPassVisible}
                  <Eye size={16} class="transition-all ease-in-out" />
                {:else}
                  <EyeClosed size={16} class="transition-all ease-in-out" />
                {/if}
              </span>
            </div>
          </Label>
          <Label class="flex flex-col gap-2">
            Server IP
            <Input
              id="serverIp"
              name="serverIp"
              placeholder="serverIP"
              bind:value={serverIp}
            />
          </Label>
          <Label class="flex flex-col gap-2">
            Server Port
            <Input
              id="serverPort"
              name="serverPort"
              placeholder="Server Port"
              bind:value={serverPort}
            />
          </Label>
          <Label class="flex flex-row items-center gap-4">
            SSL
            <Switch bind:checked={ssl} />
          </Label>
          <Button
            type="button"
            on:click={() => handleSubmit()}
            disabled={!serverIp ||
              !serverPort ||
              !username ||
              !password ||
              isLoading}
            class="disabled:cursor-not-allowed flex items-center gap-2"
          >
            {#if isLoading}
              <Loader2 class="animate-spin" /> <i>Adding Panel...</i>
            {:else}
              <Plus class="size-4" />
              Add
            {/if}
          </Button>
        {:else}
          <div class="flex flex-col h-[calc(100vh-75px)]">
            <p
              class="text-center text-xl font-bold mb-4 text-brand-foreground dark:text-brand"
            >
              Atlas panels
            </p>
            <div
              class="flex flex-col gap-4 h-full pb-10 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {#each $panels as panel}
                <PanelCard panelData={panel} />
              {/each}
            </div>
            <AddPanel>
              <Button class="mt-auto flex items-center gap-1 w-full">
                <Plus size={16} />
                Add Panel
              </Button>
            </AddPanel>
          </div>
        {/if}
      {/if}
    </div>
  </section>
{/if}
