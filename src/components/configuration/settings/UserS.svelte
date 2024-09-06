<script lang="ts">
  import { Check, Filter, ListFilter, Pencil, Search, X } from "lucide-svelte";
  import type { LoginEvent, User, UserLog } from "@/types";
  import * as Tabs from "@/components/ui/tabs";
  import type { PageServerData } from ".svelte-kit/types/src/routes/$types";
  import LiveTable from "./users/LiveTable.svelte";
  import PlaybackTable from "./users/PlaybackTable.svelte";
  import EventsTable from "./users/EventsTable.svelte";
  import GalleryTable from "./users/GalleryTable.svelte";
  import ConfigurationTable from "./users/ConfigurationTable.svelte";
  import ReportsTable from "./users/ReportsTable.svelte";
    import NodesTable from "./nodes/NodesTable.svelte";
    import NavbarTable from "./users/NavbarTable.svelte";
    import { onMount } from "svelte";
    import { Button } from "@/components/ui/button";
  export let data: PageServerData;
  let selectedP = 1;
  let allUsers = [];
  let liveFeatures = []
  let searchtext= '';



  async function fetchAllUsers() {
          try {
      const response = await fetch("/api/user/getMany");
      // console.log(response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      allUsers = data.records;
      // console.log(allUsers)

      const live = await fetch('/api/features/live')
      if (!live.ok) {
        throw new Error(`HTTP error! status: ${live.status}`);
      }
      const d = await live.json()
      // console.log(d)
      liveFeatures= d?.features?.items;
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  onMount(() => {
    fetchAllUsers()
  })

  
</script>

<div
  class="flex flex-col items-start h-[calc(100vh-75px)] max-w-[calc(100vw-75px)] w-full text-black dark:text-white"
>
    <div class="h-[1px] dark:bg-[#292929] w-[96%] mb-8 bg-[#e0e0e0]" />
    <div class="w-full justify-between flex items-center px-6 mb-4">
      <span
        class="flex items-center justify-center rounded-lg border-black/[.13] border-solid border-[1px]  w-[270px] h-[40px] -mx-2"
      >
        <button
          on:click={() => (selectedP = 1)}
          class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${selectedP === 1 ? "text-white bg-[#050F41]" : "bg-transparent"}`}
          >Permissions</button
        >
        <button
          on:click={() => (selectedP = 2)}
          class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${selectedP === 2 ? "text-white bg-[#050F41]" : "bg-transparent"}`}
          >Stores</button
        >
      </span>
      <span class="flex items-center gap-4">
        <Button variant='outline' class="text-xs font-medium flex items-center gap-2"
          ><ListFilter size={18} /> Filter</Button
        >
        <span
          class="relative rounded-lg border-2 border-solid border-[#d0d5dd]"
        >
          <input
            type="text"
            placeholder="Search"
            class="border-none text-black outline-none pr-2 pl-8 py-2 text-sm placeholder:text-black bg-transparent"
          />
          <Search class="absolute top-1/2 -translate-y-1/2 left-2" size={18} />
        </span>
      </span>
    </div>
    {#if selectedP === 1}
<div class='px-6 p-4 w-[96%] flex flex-col gap-2 mx-auto shadow-md rounded-md border border-[#00000014]'>
  <p class='text-lg text-[#323232] dark:text-white/[.7] font-semibold '>Permissions</p>
  <p class='text-sm text-[#323232] dark:text-white/[.7] '>Select and assign permissions to users</p>
      <Tabs.Root class="mx-auto w-full pb-0 bg-transparent mt-2">
        <Tabs.List class="flex items-center w-full bg-white dark:bg-black ">
          <Tabs.Trigger
            value="live"
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8]"
            ><input type="checkbox" />Live</Tabs.Trigger
          >
          <Tabs.Trigger
            value="playback"
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8]"
            ><input type="checkbox" /> Playback</Tabs.Trigger
          >
          <!-- <Tabs.Trigger
            value="events"
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8]"
            ><input type="checkbox" /> Events</Tabs.Trigger
          > -->
          <!-- <Tabs.Trigger
            value="gallery"
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8]"
            ><input type="checkbox" /> Gallery</Tabs.Trigger
          > -->
          <Tabs.Trigger
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8]"
            value="config"><input type="checkbox" /> Settings</Tabs.Trigger
          >
          <!-- <Tabs.Trigger
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8] "
            value="reports"><input type="checkbox" /> Reports</Tabs.Trigger
          > -->
          <Tabs.Trigger
            class="rounded-t-md flex items-center justify-start px-2 gap-4 border-[#eaecf0] border-[1px] border-solid border-b-0 w-full data-[state=active]:bg-[#f8f8f8] "
            value="navbar"><input type="checkbox" /> Navbar</Tabs.Trigger
          >
        </Tabs.List>
        <Tabs.Content value="live" class='-mt-1'>
          <LiveTable {liveFeatures} {allUsers} />
          <!-- live content -->
        </Tabs.Content>
        <Tabs.Content value="playback" class='-mt-1'>
          <PlaybackTable {allUsers}/>
          <!-- playback content -->
        </Tabs.Content>
        <Tabs.Content value="events" class='-mt-1'>
          <EventsTable {allUsers}/>
          <!-- events content -->
        </Tabs.Content>
        <Tabs.Content value="gallery" class='-mt-1'>
          <GalleryTable {allUsers}/>
          <!-- gallery content -->
        </Tabs.Content>
        <Tabs.Content value="config" class='-mt-1'>
          <ConfigurationTable {allUsers}/>
          <!-- config content -->
        </Tabs.Content>
        <Tabs.Content value="reports" class='-mt-1'>
          <ReportsTable {allUsers}/>
          <!-- reports content -->
        </Tabs.Content>
        <Tabs.Content value="navbar" class='-mt-1'>
          <NavbarTable {allUsers}/>
          <!-- navbar content -->
        </Tabs.Content>
      </Tabs.Root>
</div>

    {:else}
<div class='px-6 p-4 max-w-[96%] flex flex-col gap-2 mx-auto shadow-md rounded-md border border-[#00000014] overflow-clip'>
 <p class='text-lg text-[#323232] dark:text-white/[.7] font-semibold '>Store Permissions</p>
  <p class='text-sm text-[#323232] dark:text-white/[.7] '>Select and assign permissions to users</p>
      <div class="w-[calc(100vw-5rem)] overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] max-w-[calc(100vw-5.5rem)] hide-scrollbar">
       <NodesTable {data} {allUsers} searchText={searchtext}/>
       <!-- nodes table -->
      </div>
    </div>
    {/if}
</div>

<style>
  .shad {
    box-shadow: 0px 4px 4px 0px #0000000f;
  }
</style>
