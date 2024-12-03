<script lang="ts">
  import { EditIcon, Expand, PlusCircle, RefreshCwOff } from "lucide-svelte";
  import { page } from "$app/stores";
  import AddCameraDialog from "../dialogs/AddCameraDialog.svelte";
  import { selectedNode } from "@/lib/stores";

  export let displayIcons: boolean;
  export let editMode: boolean;
  export let liveFullscreen: boolean;
  export let landscape: boolean;
</script>

<div class="flex flex-row justify-between w-full items-center py-4 px-6">
  <img alt="add-vector" src="/images/green.svg" class="h-[40px] w-[98px]" />

  {#if displayIcons !== false}
    <span class="flex flex-row items-center gap-2">
      <button
        disabled={$selectedNode.camera.length === 0}
        on:click={() => (editMode = !editMode)}
        class={`h-[32px] w-[32px] grid place-items-center disabled:opacity-70 ${
          editMode ? "bg-[#015a62]" : "bg-[#e8e9ea]"
        } rounded-full`}
      >
        <EditIcon class="scale-90" color={editMode ? "white" : "#015a62"} />
      </button>
      <AddCameraDialog sNode="">
        <button
          class="h-[32px] w-[32px] grid place-content-center rounded-full bg-[#e8e9ea]"
        >
          <PlusCircle color={"#015a62"} class="scale-90" />
        </button>
      </AddCameraDialog>
      <button
        disabled={$selectedNode.camera.length === 0}
        on:click={() => {
          landscape = true;
        }}
        class="h-[32px] w-[32px] bg-[#e8e9ea] rounded-full grid place-items-center disabled:opacity-70"
      >
        <RefreshCwOff color="#015a62" class="scla-90" />
      </button>
      <button
        disabled={$selectedNode.camera.length === 0}
        on:click={() => {
          if (!liveFullscreen && $page.url.pathname.includes("/session")) {
            liveFullscreen = true;
          }
        }}
        class="h-[32px] w-[32px] bg-[#e8e9ea] rounded-full grid place-items-center disabled:opacity-70"
      >
        <Expand color="#015a62" class="scale-90" />
      </button>
    </span>
  {/if}
</div>
