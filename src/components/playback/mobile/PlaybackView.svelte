<script lang="ts">
  import { Calendar } from "@/components/ui/calendar";
  import { selectedNode } from "@/lib/stores";
  import { CalendarRange, ChevronRight, Search } from "lucide-svelte";
  import Records from "./Records.svelte";
  import * as Select from "@/components/ui/select";
  import { cn } from "@/lib";

  let showCalendar: boolean = false;
  let selectedDate = "";
  let automated: boolean = true;
  export let webmFiles;

  const selectOption = [
    { value: "Motion Detection", label: "Motion Detection" },
    { value: "Object Detection", label: "Object Detection" },
    { value: "Fire Detection", label: "Fire Detection" },
    { value: "Face Detection", label: "Face Detection" },
    { value: "Action Detection", label: "Action Detection" },
    { value: "default", label: "default" },
  ];
</script>

<section class="text-black w-full min-h-screen flex flex-col">
  <div class="top px-6 my-6 flex items-center justify-between">
    <span class="flex items-center gap-4">
      <button
        on:click={() => (automated = true)}
        class={automated
          ? "text-white font-medium px-2.5 py-1.5 bg-[#015a62] rounded-full"
          : "text-[#505050] font-semibold"}
      >
        Automated
      </button>
      <button
        class={!automated
          ? "text-white font-medium px-2.5 py-1.5 bg-[#015a62] rounded-full"
          : "text-[#505050] font-semibold"}
        on:click={() => (automated = false)}
      >
        Manual
      </button>
    </span>
    <span class="flex items-center gap-2">
      <Search />
      <span class="relative">
        <button on:click={() => (showCalendar = !showCalendar)}>
          <CalendarRange />
        </button>
        {#if showCalendar}
          <Calendar
            class="absolute w-[350px] bg-white top-10 -right-1 z-40 px-4 py-2 flex flex-col items-center justify-center rounded-md dark:bg-[#333333] border border-solid border-[#929292] text-black dark:text-white"
          />
        {/if}
      </span>
    </span>
  </div>
  <div
    class="second-top px-2 flex items-center justify-between border-b-2 border-solid border-[#e0e0e0] pb-2 mx-4"
  >
    <!-- <Select
      options={selectOption}
      class="w-1/2 text-sm"
      defaultValue={selectOption[0]}
    /> -->
    <Select.Root portal={null}>
      <Select.Trigger class="w-1/2 text-sm bg-transparent border-none">
        <Select.Value placeholder={selectOption[5].label} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Types</Select.Label>
          {#each selectOption as option}
            <Select.Item value={option.value} label={option.label}
              >{option.label}</Select.Item
            >
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>

    <p class="text-medium text-sm">
      {selectedDate ? selectedDate : "Selected Date"}
    </p>
  </div>
  <div class="flex flex-col py-8 gap-2 mb-20">
    <!-- {#if $selectedNode && $selectedNode.camera.length > 0}
      {#each $selectedNode.camera as cam}
        <Records {cam} />
      {/each}
    {/if} -->
    <span
      class="text-base flex items-center gap-2 font-medium dark:text-[#e0e0e0] text-[#212427] px-6 mb-2"
    >
      Files that got converted
      <ChevronRight />
    </span>
    <div
      class={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 mb-6",
      )}
    >
      {#if webmFiles.length > 0}
        <Records {webmFiles} />
      {:else}
        <span
          class="text-sm font-medium dark:text-[#e0e0e0] text-[#212427] px-6 py-4"
        >
          No items found
        </span>
      {/if}
    </div>
  </div>
</section>
