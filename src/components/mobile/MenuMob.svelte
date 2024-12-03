<script lang="ts">
  import LayoutDialog from "../dialogs/mobile/LayoutDialog.svelte";
  import { selectedNode } from "@/lib/stores";
  import { Bell, Mic, Podcast, RotateCcw } from "lucide-svelte";
  import { ImageDown, LayoutGrid, Save, Video } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  let user;
  let showSelection: string = "";

  export let landscape: boolean;
  export let showAlerts: boolean;
  export let activeStreamIndex: number | null;
</script>

{#if !landscape}
  <div
    class="flex items-center justify-evenly px-2 fixed w-screen bottom-[66px] z-30 pb-4 pt-2 backdrop-blur-xl"
  >
    <LayoutDialog orientation="">
      <button class="flex flex-col items-center justify-center gap-1">
        <LayoutGrid
          class={`p-[11px] w-[46px] h-[46px] rounded-full bg-[#e8e9ea] text-[#015a62]`}
        />
        <span
          class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
        >
          Layout
        </span>
      </button>
    </LayoutDialog>
    <button
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
          <button
            class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
            tabIndex={0}
          >
            Selected screen
          </button>
          <button
            class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
            tabIndex={1}
          >
            All screens
          </button>
        </div>
      {/if}
    </button>
    <button
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
          <button
            class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
            tabIndex={0}
          >
            Selected screen
          </button>
          <button
            class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
            tabIndex={1}
          >
            All screens
          </button>
        </div>
      {/if}
    </button>
    <button
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
          <button
            class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
            tabIndex={0}
            on:click={() => {
              console.log(activeStreamIndex);
              if (activeStreamIndex !== null) {
                console.log(activeStreamIndex);
              } else {
                toast.error(
                  "No Stream selected currently, tap on a stream to select it.",
                );
                showSelection = "";
              }
            }}
          >
            Selected screen
          </button>
          <button
            class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
            tabIndex={1}
            on:click={() => {
              console.log($selectedNode.camera.length);
              if ($selectedNode.camera.length > 0) {
                console.log("handle multi ss");
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
    <button
      class="flex flex-col items-center justify-center gap-1"
      on:click={() => {
        showAlerts = true;
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
  </div>
{:else}
  <div
    class="flex flex-row-reverse items-center justify-evenly px-2 fixed z-50 w-screen bottom-0 bg-black py-4"
  >
    <button
      class="flex flex-col items-center justify-center gap-1 rotate-90"
      on:click={() => (landscape = false)}
    >
      <RotateCcw
        class="p-[11px] w-[46px] h-[46px] rounded-full bg-[rgb(232,233,234)]/[.22] text-white"
      />
      <span
        class="text-xs text-white/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Rotate
      </span>
    </button>
    <span class="flex flex-col items-center justify-center gap-1 rotate-90">
      <Mic
        color="#fff"
        class="p-[11px] w-[46px] h-[46px] rounded-full bg-[rgb(232,233,234)]/[.22]"
      />
      <span
        class="text-xs text-white/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Unmute
      </span>
    </span>
    <button
      class="flex flex-col items-center justify-center gap-1 rotate-90 relative"
      on:click={() =>
        showSelection === "save"
          ? (showSelection = "")
          : (showSelection = "save")}
    >
      <Save
        class={`p-[11px] w-[46px] h-[46px] rounded-full ${
          showSelection === "save" ? "bg-white" : "bg-[rgb(232,233,234)]/[.22]"
        }`}
        color={showSelection === "save" ? "#015a62" : "#fff"}
      />
      <span
        class="text-xs text-white/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Save feed
      </span>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      {#if showSelection === "save" && landscape}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="w-[150px] h-[95px] rounded-md shadow-selection flex flex-col items-center justify-center absolute z-[100] bg-[#444] right-16"
          on:click={(e) => e.stopPropagation()}
        >
          <button
            class="text-white text-sm focus:bg-white/[.12] py-[11px] w-full flex items-center pl-2 gap-2"
            tabIndex={0}
            on:click={() => {
              if (activeStreamIndex) {
                console.log(activeStreamIndex);
                console.log("handlesingle ss");
              } else {
                toast.error(
                  "No Stream selected currently, tap on a stream to select it.",
                );
              }
            }}
          >
            <ImageDown />
            Snip screen
          </button>
          <button
            class="text-[white] text-sm focus:bg-white/[.12] py-[11px] w-full flex items-center pl-2 gap-2"
            tabIndex={1}
          >
            <Video />
            Record screen
          </button>
        </div>
      {/if}
    </button>
    <LayoutDialog orientation="landscape">
      <button class="flex flex-col items-center justify-center gap-1 rotate-90">
        <LayoutGrid
          class="p-[11px] w-[46px] h-[46px] rounded-full bg-[rgb(232,233,234)]/[.22] text-white"
        />
        <span
          class="text-xs text-white/[.6] tracking-[-0.12px] font-medium text-center"
        >
          Layout
        </span>
      </button>
    </LayoutDialog>
    <button
      class="flex flex-col items-center justify-center gap-1 rotate-90"
      on:click={() => {
        showAlerts = true;
      }}
    >
      <Bell
        class="p-[11px] w-[46px] h-[46px] rounded-full bg-[rgb(232,233,234)]/[.22] text-white"
      />
      <span
        class="text-xs text-white/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Alerts
      </span>
    </button>
  </div>
{/if}
