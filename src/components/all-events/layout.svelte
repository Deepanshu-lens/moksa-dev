<script lang="ts">
  import EventGrid from "./component/event-grid.svelte";
  import NodeSelection from "../node/NodeSelection.svelte";
</script>

<div class="w-52 ml-8 mt-3 flex justify-end">
  <NodeSelection />
</div>

<section class="right flex-1 flex h-screen w-full justify-between">
  <div class="w-full h-full px-4">
    <EventGrid />
  </div>
  <!-- 
  <div
    class={`relative h-[calc(100vh-75px)] ${showRightPanel ? "w-1/4 max-w-72 " : " w-0"} transition-width ease-in-out duration-500 dark:border-[#292929] border-x-[1px]`}
  >
    <button
      on:click={() => (showRightPanel = !showRightPanel)}
      class={`absolute -left-6 py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800  top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500 z-[99999]`}
    >
      <ChevronRight
        class={`${showRightPanel ? "rotate-0" : "rotate-180"} transition-transform ease-in-out duration-700`}
      />
    </button>
    <div
      class={`${showRightPanel ? "opacity-100" : "opacity-0"} transtion-opacity ease-in-out duration-500 `}
    >
      <div class="relative w-full p-1 bg-[#f9f9f9] dark:bg-[#333333]">
        <input
          id="search-input"
          type="text"
          class="bg-transparent text-[#020202] font-medium dark:text-white capitalize text-sm sm:text-[8px] md:text-[10px] lg:text-sm xl:text-md rounded-lg block px-10 py-2 box-border dark:focus:border-black dark:active:border-black w-full"
          placeholder="Enter Date  DD MONTH YY"
          bind:value={searchDate}
          on:input={handleDateInput}
        />
        <span
          class="absolute top-1/2 -translate-y-1/2 left-[10px] cursor-pointer z-20"
        >
          <LucideCalendarDays class="text-[#727272] h-4 w-4 dark:text-white" />
        </span>
        <span
          class="absolute top-1/2 -translate-y-1/2 right-[10px] cursor-pointer scale-90"
        >
          <X class="text-[#727272] h-4 w-4 dark:text-white" />
        </span>
        {#if showCalendar}
          <Calendar
            bind:value
            class=" bg-white dark:bg-black absolute top-14 z-40 px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
          />
        {/if}
      </div>
      <span
        class="text-black dark:text-white font-semibold text-base leading-tight w-[90%] mx-auto flex items-center justify-between py-4"
        >Live Alerts
        <span class="flex items-center gap-4"
          ><FilterIcon
            class="h-6 w-6 p-1 bg-[#f9f9f9] rounded-full text-[#727272] dark:bg-[#333] dark:text-white"
          />
          <Settings
            class="h-6 w-6 p-1 bg-[#f9f9f9] rounded-full text-[#727272] dark:bg-[#333] dark:text-white"
          /></span
        >
      </span>
      <EventList />
    </div>
  </div>
  <div
    class="flex flex-col gap-4 items-center justify-center px-2 h-[calc(100vh-76px)]"
  >
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        class={`text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
        ><Search class="h-[22px] w-[22px]" /></button
      >
      <p
        class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
      >
        Search
      </p>
    </span>
    <span
      class="group flex flex-col gap-0.5 items-center justify-center relative"
    >
      <button
        on:click={() => (showFilters = !showFilters)}
        class={!showFilters
          ? `text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
          : `relative border-none rounded-full shadow-md h-[40px] w-[40px] text-white bg-[#015a62] grid place-items-center dark:bg-[#258d9d]`}
        ><Filter class="h-[22px] w-[22px]" />
      </button>
      <p
        class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
      >
        Filter
      </p>
      {#if showFilters}
        <div
          id="dropdownDefaultCheckbox"
          class="z-20 flex w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-md dark:bg-[#242424] dark:divide-gray-600 absolute right-14"
        >
          <ul
            class="p-3 space-y-3 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownCheckboxButton"
          >
            <li>
              <label
                for="checkbox-item-1"
                class=" text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-1"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                Object Detection
              </label>
            </li>
            <li>
              <label
                for="checkbox-item-2"
                class="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-2"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                Fire Detection
              </label>
            </li>
            <li>
              <label
                for="checkbox-item-3"
                class=" text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center"
              >
                <input
                  id="checkbox-item-3"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                24 hour feed
              </label>
            </li>
            <li>
              <label
                class=" flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-4"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                Action Detection
              </label>
            </li>
            <li>
              <label
                for="checkbox-item-5"
                class="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-5"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                All
              </label>
            </li>
          </ul>
        </div>
      {/if}
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => handleEventFullscreen()}
        class={`text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
        ><Expand class="h-[22px] w-[22px]" />
      </button>
      <p
        class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
      >
        Fullscreen
      </p>
    </span>
  </div> -->
</section>
