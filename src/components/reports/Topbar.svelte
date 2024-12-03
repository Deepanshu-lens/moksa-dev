<script lang="ts">
  import { Calendar } from "@/components/ui/calendar";
  import { addUserLog } from "@/lib/addUserLog";
  import { CalendarDays, X, Shrink, Expand, ListFilter } from "lucide-svelte";

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
</script>

<section class="flex items-center w-full justify-between pl-0 p-4">
  <div class="left">
    <h2 class="font-medium text-xl text-[#323232]">
      {selectedScreen === 1
        ? "Analytics"
        : selectedScreen === 2
          ? "Reports"
          : selectedScreen === 3
            ? "Access Control"
            : selectedScreen === 4
              ? "Parking Management"
              : "System Health"}
    </h2>
    <h5 class="text-sm text-black/.5">
      {selectedScreen === 1
        ? "Find reports based on detected events and saved information lorem Ipsum"
        : selectedScreen === 2
          ? "Find reports based on detected events and saved information lorem Ipsum"
          : selectedScreen === 3
            ? "Find reports based on detected events and saved information lorem Ipsum"
            : "Find reports based on detected events and saved information lorem Ipsum"}
    </h5>
  </div>
  {#if selectedScreen === 2}
    <div class="flex items-center gap-4">
      <button
        on:click={() => (sb = 1)}
        class={sb !== 1
          ? "text-base font-semibold text-[#4f4f4f]"
          : "text-base font-semibold text-[#015a62] bg-[#015a62] bg-opacity-25 px-2 py-1 rounded-md"}
        >All</button
      >
      <button
        on:click={() => (sb = 2)}
        class={sb !== 2
          ? "text-base font-semibold text-[#4f4f4f]"
          : "text-base font-semibold text-[#015a62] bg-[#015a62] bg-opacity-25 px-2 py-1 rounded-md"}
        >Access control</button
      >
      <button
        on:click={() => (sb = 3)}
        class={sb !== 3
          ? "text-base font-semibold text-[#4f4f4f]"
          : "text-base font-semibold text-[#015a62] bg-[#015a62] bg-opacity-25 px-2 py-1 rounded-md"}
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
          on:click={() => addUserLog("user clicked on date input playback")}
        >
          <input
            id="search-input"
            type="text"
            class="bg-transparent border border-gray-300 text-gray-900 dark:text-white capitalize text-sm sm:text-[8px] md:text-[10px] lg:text-sm xl:text-md rounded-lg block px-10 py-2 box-border dark:focus:border-black dark:active:border-black w-[260px]"
            placeholder="Enter Date  DD/MM/YYYY"
            bind:value={searchDate}
            on:input={handleDateInput}
          />
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
        <button class="bg-[#015a62] rounded-md text-white px-6 py-1.5">
          Export
        </button>
      </div>
    </div>
  {/if}
</section>
