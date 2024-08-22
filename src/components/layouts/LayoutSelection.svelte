<script>
  import { ChevronDown, ChevronUp } from "lucide-svelte";
  import LayoutDialog from "../dialogs/LayoutDialog.svelte";
  import { addUserLog } from "@/lib/addUserLog";

  let displayLayouts = false;
  let nodeCameras = false;
  export let sessionId;

  function toggleDisplayLayouts() {
    displayLayouts = !displayLayouts;
  }
</script>

<div class={`absolute bottom-[58px] w-72 border-t `}>
  <button
    class="flex w-64 cursor-pointer relative py-4 font-semibold px-4 outline-none capitalize bg-background select min-h-[57px]"
    on:click={() => {
      displayLayouts = !displayLayouts;
      nodeCameras = false;
      addUserLog("user clicked display and layouts, left pane");
    }}
  >
    Display & Layouts
    <span class="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronUp size={18} />
    </span>
  </button>

  {#if displayLayouts}
    <span
      class="z-40 w-[200px] border flex items-center justify-center bg-background divide-y divide-gray-100 shadow-dropdown rounded-lg shadow absolute bottom-12 left-1/2 -translate-x-1/2"
    >
      <ul class="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
        <li class="w-full">
          <LayoutDialog {toggleDisplayLayouts}>
            <button
              class="block rounded-md px-4 py-2 text-center hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
            >
              Manage Screen layouts
            </button>
          </LayoutDialog>
        </li>
        <li class="w-full">
          <button
            class="rounded-md cursor-not-allowed text-center block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
          >
            Manage Displays
          </button>
        </li>
      </ul>
    </span>
  {/if}
</div>

<div class={`absolute bottom-0 w-72 border-t `}>
  <button
    class="flex w-64 cursor-pointer relative py-4 font-semibold px-4 outline-none capitalize bg-background select min-h-[57px]"
    on:click={() => {
      nodeCameras = !nodeCameras;
      displayLayouts = false;
      addUserLog("user clicked nodes and cameras, left pane");
    }}
  >
    Node & Cameras
    <span class="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronUp size={18} class="" />
    </span>
  </button>
  {#if nodeCameras}
    <span
      class="z-40 border w-[200px] flex items-center justify-center bg-background divide-y divide-gray-100 shadow-dropdown rounded-lg shadow absolute bottom-12 left-1/2 -translate-x-1/2"
    >
      <ul class="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
        <li class="w-full">
          <button
            on:click={() =>
              (window.location.href = `/configuration/${sessionId}?section=Camera`)}
            class="rounded-md block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
          >
            Manage existing Nodes
          </button>
        </li>
        <li class="w-full">
          <button
            on:click={() =>
              (window.location.href = `/configuration/${sessionId}?section=Camera`)}
            class="rounded-md block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
          >
            Manage existing Cameras
          </button>
        </li>
      </ul>
    </span>
  {/if}
</div>
