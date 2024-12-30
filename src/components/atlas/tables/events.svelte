<script lang="ts">
  // Imports
  import * as Table from "@/components/ui/table/index";
  import { writable } from "svelte/store";
  import {
    ArrowDown01,
    ArrowDown10,
    ArrowDownWideNarrow,
    Search,
  } from "lucide-svelte";
  import EventMedia from "../dialoges/event-media.svelte";
  import Input from "@/components/ui/input/input.svelte";
  import { events } from "@/stores";
  import Button from "@/components/ui/button/button.svelte";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";

  // Props & Stores
  export let search = writable<string>("");
  let selectedEvents = writable<string[]>([]);
  let allEventsSelected = false;
  export const filteredData = writable([]);

  // Selection logic
  $: allEventsSelected = $selectedEvents.length === $events.length;

  const toggleEventSelection = (eventId: string) => {
    if ($selectedEvents.includes(eventId)) {
      selectedEvents.update((events) => events.filter((id) => id !== eventId));
    } else {
      selectedEvents.update((events) => [...events, eventId]);
    }
  };

  const toggleAllEventsSelection = () => {
    if (allEventsSelected) {
      selectedEvents.set([]);
    } else {
      selectedEvents.set($events.map((event: any) => event.id));
    }
  };

  // Update filteredData whenever events or search changes
  $: {
    events.subscribe((currentEvents) => {
      const searchValue = $search.toLowerCase();
      const filtered = currentEvents.filter((event: any) =>
        event.expand.user.username.toLowerCase().includes(searchValue)
      );
      filteredData.set(filtered); // Update the writable store
    });
  }

  function sortByDate(order: string) {
    let baseData = [...$filteredData];

    if (order === "asc") {
      baseData.sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
      );
    } else if (order === "dsc") {
      baseData.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );
    }
    filteredData.set(baseData);
  }
</script>

<div class="top-bar py-4 flex justify-between items-center">
  <span class="flex flex-col gap-1">
    <span class="flex items-center gap-2">
      <p class="text-xl font-medium">Events</p>
      <p
        class="text-[#0070FF] bg-[#0070FF]/[.2] text-sm rounded-full px-2 py-.5 font-medium mt-1"
      >
        Super Admin
      </p>
    </span>
  </span>
  <div class="flex items-center gap-4">
    <span class="relative">
      <Input
        placeholder="Search by user name"
        class="w-[250px] pl-8"
        bind:value={$search}
      />
      <Search size={18} class="absolute top-1/2 -translate-y-1/2 left-2" />
    </span>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          class="text-xs h-10"
          variant="outline"
          size="sm"
        >
          <ArrowDownWideNarrow size={17} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-36 mr-8">
        <DropdownMenu.Group>
          <DropdownMenu.Item
            class="flex items-center justify-between gap-2"
            on:click={() => sortByDate("asc")}
          >
            Descending<ArrowDown10 size={16} />
          </DropdownMenu.Item>
          <DropdownMenu.Item
            class="flex items-center justify-between gap-2"
            on:click={() => sortByDate("dsc")}
          >
            Ascending
            <ArrowDown01 size={16} />
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</div>
{#if $filteredData.length === 0}
  <div class="flex justify-center items-center h-full">
    <p class="text-xl font-medium">No events to display</p>
  </div>
{:else}
  <Table.Root class="mx-auto w-full flex flex-col pb-10">
    <Table.Header
      class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9] dark:bg-[#e4e4e4]/[.25] dark:border-none"
    >
      <Table.Row
        class="bg-transparent flex items-center justify-between p-3 gap-4"
      >
        <Table.Head class="text-[#727272] h-full text-sm text-medium"
          ><input
            type="checkbox"
            checked={allEventsSelected}
            on:change={toggleAllEventsSelection}
          /></Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >Event Category</Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >Description</Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >Device Name</Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >User</Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >Media</Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >Priority</Table.Head
        >
        <Table.Head
          class="text-[#727272] dark:text-[#FFFFFF]/70 h-full text-sm text-medium w-full"
          >Created At</Table.Head
        >
      </Table.Row>
    </Table.Header>
    <Table.Body
      class="overflow-y-scroll max-h-[calc(100vh-285px)] hide-scrollbar pb-10"
    >
      {#each $filteredData.reverse() as event, i}
        {@const event_typed = event as any}
        {@const color = event_typed.bgColor}
        {@const eventSelected = $selectedEvents.includes(event_typed.id)}

        <Table.Row
          class="bg-transparent cursor-pointer flex items-center justify-between gap-4 mt-4 px-3 rounded-lg  border-2 border-solid border-[#e4e4e4] dark:border-none dark:bg-[#e4e4e4]/[.13]"
          style="background-color: rgb({color?.red}, {color?.green}, {color?.blue});"
        >
          <Table.Cell class="text-[#727272] dark:text-white h-full">
            <input
              type="checkbox"
              checked={eventSelected}
              on:change={() => toggleEventSelection(event_typed.id)}
            />
          </Table.Cell>
          <Table.Cell class="text-black h-full w-full dark:text-white"
            ><span class="flex items-center capitalize font-semibold">
              {event_typed?.event_category}
            </span>
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] dark:text-white h-full w-full text-sm "
          >
            {event_typed?.description ? event_typed?.description : "N/A"}
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] dark:text-white h-full w-full text-sm"
          >
            {event_typed.deviceName}
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] dark:text-white h-full w-full text-sm "
          >
            {event_typed?.expand?.user?.username
              ? event_typed?.expand.user.username
              : "N/A"}
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] dark:text-white h-full w-full text-sm pl-6"
          >
            {#if (event_typed?.imageUrl && typeof event_typed.imageUrl === "object" && Object.keys(event_typed.imageUrl).length > 0) || event_typed?.videoPath}
              <EventMedia
                imageUrls={Object.values(event_typed.imageUrl)}
                videoPath={event_typed.videoPath}>View</EventMedia
              >
            {:else}
              N/A
            {/if}
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] dark:text-white h-full w-full text-sm"
          >
            {event_typed?.priority}
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] dark:text-white h-full w-full text-sm"
          >
            {new Date(event_typed?.created).toLocaleString()}
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
{/if}
