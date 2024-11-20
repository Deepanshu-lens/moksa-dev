<script lang='ts'>
  import { getContext, onDestroy, onMount } from "svelte";
  import PocketBase from "pocketbase";
  export let item;
  export let index;
  import * as Table from "@/components/ui/table/index";
  import { CircleSlash, User } from "lucide-svelte";
  let hide = false
   let downtime = "-";
   let lastTrue;
   let lastFalse;


  const PB: PocketBase = getContext("pb");


  // onMount( async () => {
  //   PB.autoCancellation(false);
  //    PB.collection("camera_ping_status").subscribe("*", async (event) => {
  //     console.log(event);
  //     if (event.record.id === item.id) {
  //       if (event.record.status === false) {
  //    downtimeStart = Date.now(); // Store start time as a timestamp
  //  } else if (event.record.status === true && downtimeStart !== null) {
  //    let now = Date.now();
  //    downtime = `${(now - downtimeStart) / 1000} seconds`;
  //    downtimeStart = null; // Reset start time
  //  }
  //     }
  //   });
  // });

  // onDestroy(() => {
  //   PB.collection("camera_ping_status").unsubscribe("*");
  // });
  onMount(async () => {
    // console.log(item.status);
    if(item.status === false){
      lastFalse = new Date(item.event_timestamp);
      const response = await PB.collection('camera_ping_status').getFirstListItem(`url="${item.url}"`,{
        sort: '-created',
        filter: `status=true`
      })
      // console.log(response);
      if (response) {
        lastTrue = new Date(response.event_timestamp);
        downtime = calculateDowntime(lastTrue, lastFalse);
      }
    }
  });

  function calculateDowntime(lastTrue, lastFalse) {
    if (!lastTrue || !lastFalse) return '-';
    // console.log('f',lastFalse)
    // console.log('t',lastTrue)
    let diff = lastFalse - lastTrue;
    let seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hours`;
    }
  }
</script>

<Table.Row
  class={`bg-transparent items-center justify-between mt-4 rounded-lg  border-2 border-solid border-[#e4e4e4] px-3 ${hide ? 'hidden' : 'flex'}`}
>
  <Table.Cell class="text-black dark:text-slate-50 w-[10%] h-full"
    >#{index + 1}</Table.Cell
  >
  <Table.Cell class="text-[#727272] w-[12%]  h-full text-sm ml-2"
    >{item?.expand?.camera?.name}</Table.Cell
  >
  <Table.Cell class="text-[#727272] w-[12%]  h-full text-sm"
    >severity</Table.Cell
  >
  <Table.Cell class="text-[#727272] w-[12%] h-full text-sm"
    >{downtime}</Table.Cell
  >
  <Table.Cell class="text-[#727272] w-[12%] h-full text-sm"
    >{#if item.status}
      <span
        class="bg-[#EDF2FE] dark:bg-transparent dark:border-[#EDF2FE] text-[#4976F4] px-2 py-1 rounded-md font-medium text-sm"
        >Active</span
      >
    {:else}
      <span
        class="bg-[#F7F7E8] dark:bg-transparent dark:border-[#F7F7e8] text-[#F16522] px-2 py-1 rounded-md font-medium text-sm"
        >Inactive</span
      >
    {/if}</Table.Cell
  >
  <Table.Cell class="text-[#727272] w-[12%] h-full text-sm"
    >exiting alert</Table.Cell
  >
  <Table.Cell
    class="text-[#727272] w-[20%] h-full text-sm flex items-center gap-2"
  >
    <button
      class="text-[#4976F4] bg-[#4976F4] flex items-center gap-1 rounded-xl py-1 px-2 text-xs bg-opacity-15 whitespace-nowrap"
      ><User size={16} /> Assign Technician</button
    >
    <button on:click={() => hide =true}
      class="text-[#FB8A2ECC] bg-[#FB8A2E] flex items-center gap-1 rounded-xl py-1 px-2 text-xs bg-opacity-15 whitespace-nowrap"
    >
      <CircleSlash size={16} /> Hide</button
    >
  </Table.Cell>
</Table.Row>
