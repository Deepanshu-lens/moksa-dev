<script lang="ts">
  import Separator from "@/components/ui/separator/separator.svelte";
  import * as Accordion from "@/components/ui/accordion/index";
  import { ListFilter, Ticket } from "lucide-svelte";

  export let tickets: any[];
</script>

<div class="py-2 px-3 h-[80vh] max-h-[calc(100vh-170px)] overflow-y-auto">
  <!-- <button
    class="w-full flex justify-end items-center gap-1 text-gray-500 text-sm cursor-not-allowed"
  >
    <ListFilter size={20} />
    Filter by store
  </button> -->

  <!-- accordion -->
  {#if tickets?.length > 0}
    <Accordion.Root class="w-full mt-4 flex flex-col gap-4">
      {#each tickets as ticket}
        <Accordion.Item
          value={ticket.id}
          class="border-none bg-[#E8EEFB] rounded-lg px-2 drop-shadow-lg"
        >
          <Accordion.Trigger>
            <span class="flex items-center gap-3">
              <span class="rounded-full p-3 text-blue-500 bg-white">
                <Ticket />
              </span>
              {ticket.name}
            </span>
          </Accordion.Trigger>
          <Accordion.Content>
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">ID:</p>
              <span class="text-sm text-black">#{ticket.id}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Severity:</p>
              <span class="text-sm text-black flex items-center">
                <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"
                ></span>
                {ticket.severity}
              </span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Created At:</p>
              <span class="text-sm text-black">{ticket.createdAt}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Created By:</p>
              <span class="text-sm text-black">{ticket.createdBy}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Location:</p>
              <span class="text-sm text-black">{ticket.location}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Assigned To:</p>
              <span class="text-sm text-black">{ticket.assignedTo}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Status:</p>

              <span class="text-sm text-black flex items-center">
                <span
                  class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"
                ></span>
                {ticket.status}</span
              >
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Resolved At:</p>
              <span class="text-sm text-black">{ticket.resolvedAt}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Resolved By:</p>
              <span class="text-sm text-black">{ticket.resolvedBy}</span>
            </div>
            <Separator class="mb-2 bg-gray-300 px-3" />
            <div class="flex justify-between px-2 pb-1">
              <p class="text-md text-gray-500">Comments:</p>
              <span class="text-sm text-black max-w-[50%]"
                >{ticket.comments}</span
              >
            </div>
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  {:else}
    <div class="flex justify-center items-center h-full">
      <p class="text-gray-500">No Current Tickets</p>
    </div>
  {/if}
</div>
