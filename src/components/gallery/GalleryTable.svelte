<script lang="ts">
  import * as Table from "@/components/ui/table";
  import type { Gallery } from "@/types";
  import { ChevronsUpDown } from "lucide-svelte";

  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en";
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");

  export let data: Gallery[];

  let tableData = writable();

  onMount(() => {
    tableData.set(data);
  });

  let sortKey = "sno"; // Default sort key
  let sortOrder = "desc"; // Default sort order

  function sortData(key: string) {
    let temp = [...$tableData];
    // Toggle sort order if the same key is clicked
    if (sortKey === key) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortOrder = "asc"; // Reset to ascending order for new key
    }

    // Sort the events based on the current sortKey and sortOrder
    temp.sort((a, b) => {
      let comparison = -1;

      if (key === "created" || key === "updated") {
        // Compare dates
        const dateA = new Date(a[sortKey]);
        const dateB = new Date(b[sortKey]);
        comparison = dateA.getTime() - dateB.getTime();
      } else {
        // Compare other fields (string or number)
        comparison = a[sortKey] > b[sortKey] ? 1 : -1;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    tableData?.set(temp);
  }
</script>

<div class="max-h-[calc(100vh-160px)] h-full w-full overflow-y-scroll">
  <Table.Root class="mx-auto w-[100%] flex flex-col pb-10">
    <Table.Header
      class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9]"
    >
      <Table.Row class="bg-transparent flex items-center justify-between p-3">
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1"> S.No </span>
        </Table.Head>
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Name
            <button on:click={() => sortData("name")}>
              <ChevronsUpDown class="scale-75" />
            </button>
          </span>
        </Table.Head>
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1"> Images </span>
        </Table.Head>
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Created on
            <button on:click={() => sortData("created")}>
              <ChevronsUpDown class="scale-75" />
            </button>
          </span></Table.Head
        >
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Last Updated <button on:click={() => sortData("created")}>
              <ChevronsUpDown class="scale-75" />
            </button>
          </span></Table.Head
        >
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
          >Update</Table.Head
        >
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#if $tableData && $tableData?.length > 0}
        {#each $tableData as person, index}
          <Table.Row
            class="bg-transparent flex items-center justify-between mt-4 rounded-lg  border-2 border-solid border-[#e4e4e4]"
          >
            <Table.Cell
              class="text-[#727272] w-full h-full flex items-center justify-center"
            >
              <span> {index + 1} </span>
            </Table.Cell>
            <Table.Cell
              class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
              ><span>{person?.name}</span></Table.Cell
            >
            <Table.Cell
              class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
            >
              <span class="flex -space-x-2 overflow-hidden my-2">
                {#if person?.images?.length > 0}
                  {#each person?.images as img}
                    <img
                      class={`inline-block h-10 w-10 rounded-full ring-2 ring-white 3xl:w-16 3xl:h-16`}
                      src={"data:image/jpeg;base64," + img}
                      alt="registered-imgs"
                    />
                  {/each}
                {/if}
              </span></Table.Cell
            >
            <Table.Cell
              class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
              ><span
                >{new Date(person?.created).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                })}</span
              ></Table.Cell
            >
            <Table.Cell
              class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
              ><span>
                {timeAgo?.format(new Date(person?.updated))}
              </span></Table.Cell
            >
            <Table.Cell
              class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
            >
              <button
                class="text-[#D28E3D] bg-[#D28E3D] bg-opacity-15 font-medium text-sm rounded-xl flex items-center p-2 gap-2"
              >
                <!-- svelte-ignore element_invalid_self_closing_tag -->
                <span class="h-2 w-2 rounded-full bg-[#D28E3D]" /> updated now
              </button>
            </Table.Cell>
          </Table.Row>
        {/each}
      {:else}
        <div class="flex flex-col h-full p-4 my-auto z-10 relative">
          <p class="text-center text-xl font-medium">
            No registered people found, Register to add people to your gallery
          </p>
        </div>
      {/if}
    </Table.Body>
  </Table.Root>
</div>
