<script type="ts">
  import { selectedNode } from "@/lib/stores";
  import { onMount } from "svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import { Button } from "@/components/ui/button";

  let selected = 1;
  let delayOptions = [
    { id: 1, label: "No delay" },
    { id: 2, label: "Shortest delay" },
    { id: 3, label: "Best quality" },
  ];
  let delaytype = 1;
  let resoOptions = [
    { id: 1, label: "240p" },
    { id: 2, label: "360p" },
    { id: 3, label: "480p" },
    { id: 4, label: "720p" },
    { id: 5, label: "1080p" },
    { id: 6, label: "default" },
  ];
  let resoType = 6;
  let dimensions = {};

  function handleConfirm() {
    console.log(resoType);
    console.log(delaytype);
    if (selected === 1) {
    }
  }

  onMount(() => {
    if ($selectedNode !== undefined) {
      delaytype = $selectedNode.live_mode === 0 ? 1 : $selectedNode.live_mode;
      resoType =
        $selectedNode.live_resolution === 0 ? 6 : $selectedNode.live_resolution;
    }
  });
</script>

<div
  class="flex flex-col items-start h-[calc(100vh-75px)] w-full text-black dark:text-white"
>
  <div class="w-full border-b p-4 flex justify-end items-center gap-2">
    <span class="flex items-center gap-2 mr-[2rem]">
      <Button
        variant="outline"
        class="rounded-lg mr-auto flex bg-[#F8F8F8] text-black border-black border-opacity-[.23]"
        >Cancel</Button
      >
      <Button class="mr-auto flex bg-[#3D81FC] rounded-lg text-white"
        >Confirm</Button
      >
    </span>
  </div>

  <!-- Stream delay duration -->
  <div
    class=" w-[94.5%] my-4 pt-4 mx-6 shadow-md rounded-md border border-[#00000014]"
  >
    <h2 class="px-6 font-medium mb-4">Stream delay duration</h2>
    <div
      class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
    />
    <form class=" flex items-center justify-center w-[60%] mb-8 px-6">
      {#each delayOptions as { id, label }}
        <div class="flex gap-4 w-full">
          <label>
            <input
              type="radio"
              name="delayOption"
              class="cursor-pointer"
              bind:group={delaytype}
              value={id}
            />
            {label}</label
          >
        </div>
      {/each}
    </form>
    <p
      class={`px-6 mt-4 mb-8 text-sm opacity-90 animate-fade   ${
        delaytype === 1
          ? "text-[#3B7C26] "
          : delaytype === 2
            ? "text-[#FB8A2E] "
            : "text-[#EF4444] "
      } `}
    >
      <span class="dark:text-[#929292] text-black/[.8] text-sm mr-1">
        Note:
      </span>
      {delaytype === 1
        ? "Frame lag possible"
        : delaytype === 2
          ? "Frame consistent but quality issues can appear at times"
          : "Will run few seconds behind live but ensures consistent high quality stream"}
    </p>
  </div>

  <!-- Live stream resolution -->
  <div
    class=" w-[94.5%] my-4 pt-4 mx-6 shadow-md rounded-md border border-[#00000014]"
  >
    <h2 class="px-6 font-medium mb-4">Live stream resolution</h2>
    <div
      class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
    />
    <form class=" flex items-center justify-center w-[70%] mb-8 px-6">
      {#each resoOptions as { id, label }}
        <div class="flex gap-4 w-full">
          <label>
            <input
              type="radio"
              class="cursor-pointer"
              bind:group={resoType}
              value={id}
            />
            {label}</label
          >
        </div>
      {/each}
    </form>
    <p
      id="fadeElement"
      class={`px-6 mt-4 mb-8 text-sm opacity-90 ${
        resoType === 1
          ? "text-[#3B7C26]"
          : resoType === 2
            ? "text-[#FB8A2E]"
            : resoType === 3
              ? "text-[#FB8A2E]"
              : resoType === 4
                ? "text-[#EF4444]"
                : resoType === 5
                  ? "text-[#EF4444]"
                  : "text-[#3B7C26]"
      } `}
    >
      <span class="dark:text-[#929292] text-black/[.8] text-sm mr-1">
        Note:
      </span>
      {resoType === 1
        ? "For smooth lag, free streams"
        : resoType === 2
          ? "Frame consistent but quality issues"
          : resoType === 3
            ? "Minor lag could be there"
            : resoType === 4
              ? "Intermittent frames lag could be observed"
              : resoType === 5
                ? "Frame lag is expected frequently"
                : "Decided based on the number of cameras"}
    </p>
  </div>
  <!-- {/if} -->

  <!-- <button
    class="text-white bg-[#050F41] px-10 py-2 rounded-lg mx-6 my-4"
    on:click={handleConfirm}
  >
    Confirm
  </button> -->
</div>

<style>
  .shad {
    box-shadow: 0px 4px 4px 0px #0000000f;
  }
</style>
