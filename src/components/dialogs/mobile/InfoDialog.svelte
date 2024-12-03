<script lang="ts">
  import CameraTooltip from "./../../tooltip/CameraTooltip.svelte";
  import { PlusCircle, Search, X } from "lucide-svelte";
  import { onMount } from "svelte";
  import { selectedNode } from "@/lib/stores";
  import * as Dialog from "@/components/ui/dialog";
  import AddCameraDialog from "../AddCameraDialog.svelte";
  import AddNodeDialog from "../AddNodeDialog.svelte";

  export let data;

  let view = 1;
  let searchInput = "";
  let nodeSearchInput = "";
  let active;

  let filteredCameras = [];
  let filteredNodes = [];

  $: {
    filteredNodes = data.nodes.filter((value) =>
      value.name.toLowerCase().includes(nodeSearchInput.toLowerCase()),
    );
  }

  $: {
    filteredCameras = $selectedNode?.camera?.filter((value) =>
      value?.name?.toLowerCase()?.includes(searchInput?.toLowerCase()),
    );
  }
</script>

<Dialog.Root>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    class="z-[60] flex flex-col bg-white scale-90 rounded-lg w-[90%] h-[350px] shadow-big gap-2 p-1"
  >
    <Dialog.Header>
      <Dialog.Title
        class="flex items-center justify-center relative border-b border-solid border-[rgb(145,158,171)]/[.46] mt-2"
      >
        <button
          class={`px-4 py-2 text-base shrink-0 ${
            view === 1
              ? " text-black font-medium"
              : "text-black/[.4] font-medium"
          }`}
          on:click={() => {
            view = 1;
            searchInput = "";
          }}
        >
          Select Node
        </button>
        <button
          class={`px-4 py-2 text-base shrink-0  ${
            view === 2
              ? " text-black font-medium"
              : "text-black/[.4] font-medium"
          }`}
          on:click={() => {
            view = 2;
            nodeSearchInput = "";
          }}
        >
          Select Camera
        </button>
      </Dialog.Title>
    </Dialog.Header>
    <div
      class="flex items-center justify-between px-6 relative h-[35px] w-full my-2"
    >
      <input
        type="text"
        class=" px-10 border-[1px] border-solid border-[#e0e0e0] rounded-md text-[#979797] text-base h-full w-full"
        placeholder={view === 1 ? "Search node" : "Search camera"}
        value={view === 1 ? nodeSearchInput : searchInput}
        on:input={(e) => {
          if (view === 1) {
            nodeSearchInput = e.target.value;
          } else {
            searchInput = e.target.value;
          }
        }}
      />

      <Search
        class="absolute top-1/2 -translate-y-1/2 left-8 text-[#777777] scale-90"
      />

      <button
        class="absolute top-1/2 -translate-y-1/2 right-8 text-[#777] scale-90"
        on:click={() => {
          searchInput = "";
          nodeSearchInput = "";
        }}
      >
        <X />
      </button>
    </div>

    <button class="flex items-center justify-between px-6">
      <p class="text-lg text-[#333] font-medium">
        {view === 2 ? "Add New Camera" : "Add New Node"}
      </p>
      {#if view === 2}
        <AddCameraDialog>
          <PlusCircle class="text-[#015a62] scale-90 h-[24px] w-[24px]" />
        </AddCameraDialog>
      {:else}
        <AddNodeDialog>
          <PlusCircle class="text-[#015a62] scale-90 h-[24px] w-[24px]" />
        </AddNodeDialog>
      {/if}
    </button>
    {#if view === 2}
      <div class="overflow-y-scroll overflow-x-clip max-h-[200px] py-2 px-6">
        {#if filteredCameras !== null && filteredCameras.length > 0}
          {#each filteredCameras as value, index}
            <CameraTooltip
              icon=""
              name={value.name}
              url={value.url}
              id={value.id}
              active={active === value.id}
            />
          {/each}
        {:else}
          <div class="text-black text-sm flex flex-row items-center gap-1">
            No cameras found with that name.
          </div>
        {/if}
      </div>
    {/if}
    {#if view === 1}
      <div
        class="overflow-y-scroll overflow-x-clip max-h-[200px] py-2 px-6 my-4"
      >
        {#if filteredNodes !== null && filteredNodes.length > 0}
          {#each filteredNodes as value, index}
            <CameraTooltip
              icon="node"
              name={value?.name}
              url={value?.url}
              id={value.id}
              active={$selectedNode.id === value.id}
            />
          {/each}
        {:else}
          <div class="text-black text-sm flex flex-row items-center gap-1">
            No nodes found with that name.
          </div>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
