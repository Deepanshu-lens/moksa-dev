<script lang="ts">
  //   import LayoutDialog from "../dialogs/mobile/LayoutDialog.svelte";
  import { selectedNode } from "@/stores";
  import { ImageDown, LayoutGrid, Video } from "lucide-svelte";
  import { Bell, Podcast } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  let showSelection: string = "";
  import AlertsDrawerMobile from "./AlertsDrawerMobile.svelte";
  import { isAlertMobileOpen } from "@/stores/ui";

  export let showAlerts: boolean;
  export let activeStreamIndex: number | null;
</script>

<div
  class="flex items-center justify-evenly px-2 fixed w-screen bottom-[66px] z-30 pb-4 pt-2 backdrop-blur-xl"
>
  <!-- <LayoutDialog orientation=""> -->
  <button class="flex flex-col items-center justify-center gap-1" disabled>
    <LayoutGrid
      class={`p-[11px] w-[46px] h-[46px] rounded-full bg-[#e8e9ea] text-[#015a62]`}
    />
    <span
      class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
    >
      Layout
    </span>
  </button>
  <!-- </LayoutDialog> -->
  <button
    disabled
    class="flex flex-col items-center justify-center gap-1 relative"
    on:click={() =>
      showSelection === "announce"
        ? (showSelection = "")
        : (showSelection = "announce")}
  >
    <Podcast
      class={`p-[11px] w-[46px] h-[46px] rounded-full ${
        showSelection === "announce"
          ? "bg-[#015a62] text-white"
          : "bg-[#e8e9ea] text-[#015a62]"
      }`}
    />
    <span
      class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
    >
      Announce
    </span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if showSelection === "announce"}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="w-[150px] h-[95px] rounded-md bg-[f5f6f7] shadow-selection flex flex-col items-center justify-center absolute z-20 bg-white bottom-[4.5rem]"
        on:click={(e) => e.stopPropagation()}
      >
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={0}
        >
          Selected screen
        </button>
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={1}
        >
          All screens
        </button>
      </div>
    {/if}
  </button>
  <button
    disabled
    class="flex flex-col items-center justify-center gap-1 relative"
    on:click={() =>
      showSelection === "record"
        ? (showSelection = "")
        : (showSelection = "record")}
  >
    <Video
      class={`p-[11px] w-[46px] h-[46px] rounded-full ${
        showSelection === "record"
          ? "bg-[#015a62] text-white"
          : "bg-[#e8e9ea] text-[#015a62]"
      }`}
    />
    <span
      class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
    >
      Record
    </span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if showSelection === "record"}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="w-[150px] h-[95px] rounded-md bg-[f5f6f7] shadow-selection flex flex-col items-center justify-center absolute z-20 bg-white bottom-[4.5rem]"
        on:click={(e) => e.stopPropagation()}
      >
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={0}
        >
          Selected screen
        </button>
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={1}
        >
          All screens
        </button>
      </div>
    {/if}
  </button>
  <button
    disabled
    class="flex flex-col items-center justify-center gap-1 relative"
    on:click={() =>
      showSelection === "snip"
        ? (showSelection = "")
        : (showSelection = "snip")}
  >
    <ImageDown
      class={`p-[11px] w-[46px] h-[46px] rounded-full ${
        showSelection === "snip"
          ? "bg-[#015a62] text-white"
          : "bg-[#e8e9ea] text-[#015a62]"
      }`}
    />
    <span
      class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
    >
      Snip
    </span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if showSelection === "snip"}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="w-[150px] h-[95px] rounded-md bg-[f5f6f7] shadow-selection flex flex-col items-center justify-center absolute z-20 bg-white bottom-[4.5rem]"
        on:click={(e) => e.stopPropagation()}
      >
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={0}
          on:click={() => {
            if (activeStreamIndex !== null) {
            } else {
              toast.error(
                "No Stream selected currently, tap on a stream to select it."
              );
              showSelection = "";
            }
          }}
        >
          Selected screen
        </button>
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={1}
          on:click={() => {
            if ($selectedNode?.camera.length > 0) {
            } else {
              toast.error("number of streams = 0");
            }
          }}
        >
          All screens
        </button>
      </div>
    {/if}
  </button>
  <AlertsDrawerMobile>
    <button
      class="flex flex-col items-center justify-center gap-1"
      on:click={() => {
        isAlertMobileOpen.update((value) => !value);
      }}
    >
      <Bell
        class={`p-[11px] w-[46px] h-[46px] rounded-full ${
          showAlerts ? "bg-[#015a62] text-white" : "bg-[#e8e9ea] text-[#015a62]"
        }`}
      />
      <span
        class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Alerts
      </span>
    </button>
  </AlertsDrawerMobile>
</div>
