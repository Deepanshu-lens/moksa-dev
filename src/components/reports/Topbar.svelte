<script lang="ts">
  import { Calendar } from "@/components/ui/calendar";
  import {
    CalendarDays,
    X,
    Shrink,
    Expand,
    ListFilter,
    Calendar1Icon,
  } from "lucide-svelte";
  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { cn } from "@/lib/utils.js";
  import { Button } from "@/components/ui/button/index.js";
  import * as Popover from "@/components/ui/popover/index.js";
  export let selectedScreen: number;

  function handleDateInput() {
    const formattedInput = new Date(searchDate);
    if (searchDate.length === 0) queryDate = "";
    // console.log(searchDate);
    // console.log(queryDate);
    if (!isNaN(formattedInput)) {
      const inputDate = formattedInput.toString().slice(0, 15);
      queryDate = inputDate;
    }
  }
  let showCalendar: boolean = false;
  let value = null;
  let searchDate: string = "";
  let queryDate = "";
  let sb = 1;
  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });
</script>

<section class="flex items-center w-full justify-between pl-0 p-4">
  <div class="left pl-5">
    <h2 class="font-medium text-xl">
      {selectedScreen === 1
        ? "Analytics"
        : selectedScreen === 2
          ? "Reports"
          : selectedScreen === 3
            ? "Access Control"
            : selectedScreen === 4
              ? "Parking Management"
              : selectedScreen === 5
                ? "System Health"
              : "Events Management"}
    </h2>
    <h5 class="text-sm text-neutral-500">
      {selectedScreen === 1
        ? "Find reports based on detected events and saved information."
        : selectedScreen === 2
          ? "Find reports based on detected events and saved information."
          : selectedScreen === 3
            ? "Find reports based on detected events and saved information."
            : "Find reports based on detected events and saved information."}
    </h5>
  </div>
  {#if selectedScreen === 2}
    <div class="flex items-center gap-4">
      <button
        on:click={() => (sb = 1)}
        class={sb !== 1
          ? "text-base font-semibold text-[#4f4f4f]"
          : "text-base font-semibold text-[#015a62] border border-primary bg-opacity-25 px-2 py-1 rounded-md"}
        >All</button
      >
      <button
        on:click={() => (sb = 2)}
        class={sb !== 2
          ? "text-base font-semibold text-[#4f4f4f]"
          : "text-base font-semibold text-[#015a62] border border-primary bg-opacity-25 px-2 py-1 rounded-md"}
        >Access control</button
      >
      <button
        on:click={() => (sb = 3)}
        class={sb !== 3
          ? "text-base font-semibold text-[#4f4f4f]"
          : "text-base font-semibold text-[#015a62] border border-primary bg-opacity-25 px-2 py-1 rounded-md"}
        >Parking</button
      >
    </div>
  {/if}
  {#if selectedScreen !== 5}
    <div class="right">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="flex items-center gap-4">
        <span
          class="relative"
        >
          <Popover.Root>
            <Popover.Trigger asChild let:builder>
              <Button
                variant="outline"
                class={cn(
                  "w-[240px]  text-left font-normal",
                  !value && "text-muted-foreground",
                )}
                builders={[builder]}
              >
                <!-- <Calendar1Icon class="mr-2 h-4 w-4" /> -->
                {value
                  ? df.format(value.toDate(getLocalTimeZone()))
                  : "Pick a date"}
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" align="start">
              <Calendar bind:value />
            </Popover.Content>
          </Popover.Root>
          <!-- <input
            id="search-input"
            type="text"
            class="bg-transparent border border-gray-300 text-gray-900 dark:text-white capitalize text-sm sm:text-[8px] md:text-[10px] lg:text-sm xl:text-md rounded-lg block px-10 py-2 box-border dark:focus:border-black dark:active:border-black w-[260px]"
            placeholder="Enter Date  DD/MM/YYYY"
            bind:value={searchDate}
            on:input={handleDateInput}
          /> -->
          <span
            class="absolute top-1/2 -translate-y-1/2 left-[10px] text-[#4f4f4f] dark:text-white cursor-pointer scale-90 z-20"
            on:click={() => {
              showCalendar = !showCalendar;
            }}
          >
            <CalendarDays />
          </span>
          <span
            on:click={() => ((searchDate = ""), (queryDate = ""))}
            class="absolute top-1/2 -translate-y-1/2 right-[10px] text-[#4f4f4f] dark:text-white cursor-pointer scale-75"
          >
            <X />
          </span>
          {#if showCalendar}
            <Calendar
              bind:value
              class=" bg-white dark:bg-black absolute top-14 z-40 px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
            />
          {/if}
        </span>
        <button
          class="bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] rounded-md text-white px-6 py-1.5"
        >
          Export
        </button>
      </div>
    </div>
  {/if}
</section>
