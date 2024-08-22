<script lang="ts">
  import Switch from "@/components/ui/switch/switch.svelte";
  import * as Table from "@/components/ui/table";
  import {
    ChevronsUpDown,
    AlertTriangle,
    EditIcon,
    ScanFace,
    Expand,
    Filter,
    Search,
    CalendarDays,
    CameraIcon,
  } from "lucide-svelte";
  import type { PageServerData } from "./$types";
  import type { Event } from "@/types";
  import PocketBase from "pocketbase";
  import { page } from "$app/stores";
  import { events, selectedNode, otherEvents } from "@/lib/stores.js";
  import { onDestroy, onMount } from "svelte";
  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en";
  import RegisterDialog from "@/components/dialogs/RegisterDialog.svelte";
  import FrsModal from "@/components/modal/FrsModal.svelte";
  import RegisterEventDialog from "@/components/dialogs/RegisterEventDialog.svelte";
  import FrsMatchModal from "@/components/modal/FrsMatchModal.svelte";
  import AddCameraDialog from "@/components/dialogs/AddCameraDialog.svelte";
  import { writable } from "svelte/store";

  TimeAgo.addLocale(en);

  const timeAgo = new TimeAgo("en-US");
  let selectedEvent = null;
  let selectedMatchEvent = null;
  let eventType = false;

  function openEventDialog(eventData) {
    if (eventData.title.includes("Face")) {
      selectedEvent = eventData;
    } else {
      selectedMatchEvent = eventData;
    }
  }

  export let data: PageServerData;
  let batchedEvents: Event[] = [];
  const { session } = data;
  let nodes: Node[] = [];

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  async function getNodes(): Promise<Node[]> {
    if (session.node.length > 0) {
      const nodes = await PB.collection("node").getFullList(200, {
        sort: "-created",
        expand: "camera",
        filter: `session~"${session.id}"`,
      });
      return nodes.map(
        (node) =>
          ({
            ...node,
            camera:
              node.camera.length > 0
                ? (node.expand.camera.reverse().map((cam: Camera) => ({
                    name: cam.name,
                    id: cam.id,
                    url: cam.url,
                  })) as Camera[])
                : [],
          }) as unknown as Node,
      );
    }
    return [];
  }

  // function updateEvents() {
  //   if (batchedEvents.length !== $events.length) {
  //     events.set([...batchedEvents, ...$events].slice(0, 200));
  //     batchedEvents = [];
  //   }
  //   setTimeout(updateEvents, 1000);
  // }

    function updateEvents() {
    events.update(currentEvents => {
      if (batchedEvents.length !== currentEvents.length) {
        const updatedEvents = [...batchedEvents, ...currentEvents].slice(0, 200);
        batchedEvents = [];
        return updatedEvents;
      }
      return currentEvents;
    });
    setTimeout(updateEvents, 1000);
  }

  onMount(async () => {
       events.set([])
    batchedEvents=[]
    nodes = await getNodes();
    const s = nodes.find((n) => n.id === session.activeNode);
    selectedNode.set(s || nodes[0]);
    events.set(data.events);


      PB.collection("events").subscribe("*", async (e) => {
        console.log(e.record)
        batchedEvents.push({
          ...e.record,
          created: new Date(e.record.created),
        } as unknown as Event);
      });


    setTimeout(updateEvents, 1000);
  });

  onDestroy(() => {
    PB.collection("events").unsubscribe("*");
  });

  let showLC = true;
  let showD = true;
  let showM = true;
  const filteredEvents = writable([]);

  function filterEvents(events) {
    return events.filter((event) => {
      if (showLC && showD && showM) {
        return true;
      } else if (showLC && showD && !showM) {
        return event.matchScore === 0;
      } else if (showLC && !showD && showM) {
        return (
          event.title === "Line Crossed" ||
          (event.title !== "Line Crossed" && event.matchScore > 0)
        );
      } else if (!showLC && showM && showD) {
        return !event.title.includes("Line Crossed");
      } else if (showLC && !showD && !showM) {
        return event.title === "Line Crossed";
      } else if (showD && !showLC && !showM) {
        return event.matchScore === 0 && event.title.includes("Face");
      } else if (showM && !showLC && !showD) {
        return event.matchScore !== 0;
      } else {
        return false;
      }
    });
  }

  $: filteredEvents.set(filterEvents($events));
  $: console.log($events.length)
</script>

<section class="h-full w-full flex items-center justify-center">
  <div class="w-full h-full p-6">
    <div class="px-4 w-full flex items-center justify-between pb-4">
      <h1 class="text-xl font-semibold">
        FRS {!eventType ? "Detected" : "Matched"}
      </h1>
      <span class="flex items-center gap-4">
        <p class="text-sm font-bold"> Event Type: </p>
        <span class="flex items-center gap-2">

          <p class="font-medium text-sm">Line Crossed</p>
          <input type="checkbox" bind:checked={showLC} />
        </span>
        <span class="flex items-center gap-2">


          <p class="font-medium text-sm">Detected</p>
          <input type="checkbox" bind:checked={showD} />
        </span>
        <span class="flex items-center gap-2">


          <p class="font-medium text-sm">Matched</p>
          <input type="checkbox" bind:checked={showM} />
        </span>
        <AddCameraDialog nodes={data.nodes} sNode="">
          <button
            class="px-2 py-1 rounded-xl ml-4 bg-[#FBF4EC] text-[#D28E3D] text-sm font-medium flex items-center gap-1"
            ><CameraIcon size={16} />Add camera</button
          >
        </AddCameraDialog>
      </span>
    </div>
    <Table.Root class="mx-auto w-[98%] flex flex-col pb-10">
      <Table.Header
        class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9] dark:bg-black"
      >
        <Table.Row class="bg-transparent flex items-center justify-between p-3">
          <Table.Head class="text-[#727272] dark:text-slate-100 w-full h-full">
            <span class="flex items-center gap-1">
              Alert
              <!-- <ChevronsUpDown class="scale-75" /> -->
            </span>
          </Table.Head>
          <Table.Head class="text-[#727272] w-full h-full dark:text-slate-100">
            <span class="flex items-center gap-1"> Image </span>
          </Table.Head>
          <Table.Head class="text-[#727272] w-full h-full dark:text-slate-100">
            <span class="flex items-center gap-1">
              Camera <ChevronsUpDown class="scale-75" />
            </span>
          </Table.Head>
          <Table.Head class="text-[#727272] w-full h-full dark:text-slate-100">
            <span class="flex items-center gap-1">
              Date <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head class="text-[#727272] w-full h-full dark:text-slate-100">
            <span class="flex items-center gap-1">
              Time <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head class="text-[#727272] w-full h-full dark:text-slate-100">
            <span class="flex items-center gap-1">
              Last Seen <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head
            class="text-[#727272] w-full h-full whitespace-nowrap dark:text-slate-100"
          >
            <span class="flex items-center gap-1 flex-shrink-0">
              Detection Score <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head
            class="text-[#727272] w-full h-full whitespace-nowrap dark:text-slate-100"
          >
            <span class="flex items-center gap-1">
              Similarity Score <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head class="text-[#727272] dark:text-slate-100 w-full h-full"
            >Actions</Table.Head
          >
        </Table.Row>
      </Table.Header>
      <Table.Body class="overflow-y-scroll max-h-[calc(100vh-205px)]">
        {#if $events.length > 0}
        {#if $filteredEvents.length > 0}
        {#each $filteredEvents as event}
          {@const date = new Date(event.created)}
          <Table.Row
            on:click={() => {
              openEventDialog(event);
            }}
            class="bg-transparent cursor-pointer flex items-center justify-between gap-4 mt-4 px-2 rounded-lg  border-2 border-solid border-[#e4e4e4] dark:border-[#727272]"
          >
            <Table.Cell class="text-black dark:text-slate-100 w-full h-full"
              ><span class="flex items-center gap-2 capitalize">
                {event.title}
              </span>
            </Table.Cell>
            <Table.Cell class="text-[#727272] w-full h-full text-sm ml-2">
              <img
                src={"data:image/jpeg;base64," + event.frameImage}
                alt="alert-img"
                class="aspect-square"
                width="40"
                height="40"
              /></Table.Cell
            >
            <Table.Cell
              class="text-[#727272] w-full h-full text-sm whitespace-nowrap"
              ><span>
                Camera {$selectedNode.camera.filter(
                  (c) => c.id === event.camera,
                )[0] &&
                  $selectedNode.camera.filter((c) => c.id === event.camera)[0]
                    .name}</span
              ></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span>
                {date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}</span
              ></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span
                >{date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}</span
              ></Table.Cell
            >
            <Table.Cell
              class="text-[#727272] w-full h-full text-sm whitespace-nowrap"
              ><span>
                {timeAgo?.format(new Date(event?.updated))}</span
              ></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span class="ml-8">{event?.score?.toFixed(3)}</span></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span class="ml-8">{event?.matchScore?.toFixed(3)}</span
              ></Table.Cell
            >

            <Table.Cell
              on:click={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              class="text-[#727272] w-full h-full text-sm flex gap-2 items-center whitespace-nowrap"
            >
              <button
                disabled
                class="px-2 py-1 rounded-xl bg-[#E9EFFE] text-[#4976F4] text-sm font-medium flex items-center gap-1 disabled:cursor-not-allowed"
                ><EditIcon size={16} />
                Edit</button
              >
              <RegisterEventDialog
                data={event}
                registrationImages={event.frameImage}
              >
                <button
                  class="px-2 py-1 rounded-xl bg-[#FBF4EC] text-[#D28E3D] text-sm font-medium flex items-center gap-1"
                  ><ScanFace size={16} />Add face</button
                >
              </RegisterEventDialog>
            </Table.Cell>
          </Table.Row>
        {/each}
        {:else}
          <p class="text-[#727272] w-full h-full text-sm p-4">No events found with current filters, select filters to see events</p>
        {/if}
        {:else}
          <p class="text-[#727272] w-full h-full text-sm p-4">No events found</p>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
  <div
    class="flex flex-col gap-4 items-center justify-center px-2 h-[calc(100vh-76px)]"
  >
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <RegisterDialog>
        <button
          class={`text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
          ><ScanFace class="h-[22px] w-[22px]" /></button
        >
      </RegisterDialog>
      <p
        class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
      >
        Register
      </p>
    </span>
    <span
      class="group flex flex-col gap-0.5 items-center justify-center relative"
    >
      <button
        class={`text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
        ><Search class="h-[22px] w-[22px]" />
      </button>
      <p
        class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
      >
        Search
      </p>
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        class={`text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
        ><CalendarDays class="h-[22px] w-[22px]" />
      </button>
      <p
        class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
      >
        Duration
      </p>
    </span>
  </div>
</section>

{#if selectedEvent}
  <FrsModal {selectedEvent} on:close={() => (selectedEvent = null)} />
{/if}
{#if selectedMatchEvent}
  <FrsMatchModal
    {selectedMatchEvent}
    on:close={() => (selectedMatchEvent = null)}
  />
{/if}
