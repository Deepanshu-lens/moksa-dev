<script lang="ts">
  import { ListFilter, Upload } from "lucide-svelte";
  import { Button } from "../ui/button";
  import SafetyLiveDataTable from "./table/SafetyLiveDataTable.svelte";
  import SafetyDataTable from "./table/SafetyDataTable.svelte";
  import SafetyViolationsDataTable from "./table/SafetyViolationsDataTable.svelte";
  import type { DateRange } from "bits-ui";
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import * as Popover from "../ui/popover";
  import * as Select from "../ui/select";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import { writable } from "svelte/store";
  export let allStores;
  export let token: string;
  let safetyData = writable([]);

  const fruits = allStores
    ?.filter((store: any) => store.hasKitchen)
    .map((store: any) => ({
      value: store.id,
      label: store.name,
    }));

  let selectedStore = writable(fruits[0]);

  // $: console.log($selectedStore);

  let dateRange = writable("7 Days");
  let value: DateRange | undefined = undefined;
  let startValue: DateValue | undefined = undefined;
  let customDateLabel = "Custom";
  let close = false;

  export let user;

  // console.log("user", user);

  // $: console.log($selectedStore);
  // $: console.log('daterange',$dateRange);

  $: {
    if (value?.start && value?.end) {
      const start = new Date(
        value.start.year,
        value.start.month - 1,
        value.start.day,
      );
      const end = new Date(value.end.year, value.end.month - 1, value.end.day);
      customDateLabel = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      const dayDifference = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      console.log(dayDifference);
      dateRange.set("custom");
      setTimeout(() => {
        close = false;
      }, 200);
    } else {
      customDateLabel = "Custom";
    }
  }
  let safetyCount = 0;
  async function getSafetyDataByStoreId(time) {
    const today = new Date();
    let startDate = new Date(today);
    customDateLabel = "Custom";
    value = undefined;

    switch ($dateRange) {
      case "7 Days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "15 Days":
        startDate.setDate(today.getDate() - 15);
        break;
      case "30 Days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "12 Months":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    console.log(formatDate(startDate));
    console.log(formatDate(today));
    try {
      const [response, liveResponse] = await Promise.all([
        fetch(
          `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/1/100/${formatDate(startDate)}/${formatDate(today)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ),
        fetch(
          `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/1/100/${formatDate(startDate)}/${formatDate(today)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              live: "true",
            },
          },
        ),
      ]);
      const data = await response.json();
      const lData = await liveResponse.json();
      console.log(
        `recieved safety data for ${$selectedStore.value}, ${$dateRange}`,
        data,
      );
      console.log(
        `recieved live safety records for ${$selectedStore.value}, ${$dateRange}`,
        lData,
      );
      safetyData.set(data?.data?.data === undefined ? [] : data?.data);
      safetyCount = data?.data.total;
      liveData.set(lData?.data?.data === undefined ? [] : lData?.data?.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function getSafetyDataforCustomDate(time) {
    const start = value?.start
      ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
      : "";
    const end = value?.end
      ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
      : "";
    console.log(start);
    console.log(end);

    try {
      const response = await fetch(
        `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/1/100/${start}/${end}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      console.log(
        `recieved safety data for ${$selectedStore.value}, ${$dateRange}`,
        data,
      );
      safetyData.set(data?.data?.data === undefined ? [] : data?.data);
    } catch (error) {
      console.log(error);
    }
  }

  $: if ($selectedStore || $dateRange) {
    if ($dateRange.toLowerCase() === "custom") {
      getSafetyDataforCustomDate($dateRange);
    } else {
      getSafetyDataByStoreId($dateRange);
    }
  }

  // $: console.log("allStores kitchen", allStores);

  // let sockets: { [key: number]: any } = {};
  // let liveData = writable([]);

  // $: console.log("safetyCount", safetyCount);

  // function setupSocketForAllStores() {
  //   allStores
  //     .filter((store: any) => store.id !== -1)
  //     .filter((store: any) => store.hasKitchen === true)
  //     .forEach((store: any) => {
  //       setupSocket(store.id);
  //     });
  // }

  // function setupSocket(storeId: number) {
  //   const userID = user?.moksaId;
  //   if (sockets[storeId]) {
  //     sockets[storeId].disconnect();
  //   }

  //   sockets[storeId] = io("https://dev.api.moksa.ai", {
  //     withCredentials: true,
  //     extraHeaders: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //     transports: ["websocket", "polling"],
  //   });

  //   const socket = sockets[storeId];

  //   socket.on("error", (err) => {
  //     console.log(`error for store ${storeId}:`, err);
  //   });

  //   socket.on("connect", () => {
  //     console.log(`connected for store ${storeId}`);
  //     socket.emit("joinUser", userID);
  //     socket.emit("joinStore", storeId);
  //   });

  //   socket.on(`employee_safety_store_${storeId}`, (data) => {
  //     console.log(`Received employee_safety for store ${storeId}:`, data);
  //     // if($selectedStore.value === -1) {
  //     liveData.update((currentData) => {
  //       return [{ storeId, ...data }, ...currentData].slice(0, 100);
  //     });
  //     // } else {

  //     // }
  //   });

  //   socket.on("disconnect", () => {
  //     console.log(`disconnected for store ${storeId}`);
  //   });
  // }

  // onMount(() => {
  //   setTimeout(() => {
  //     setupSocketForAllStores();
  //   }, 500);
  // });

  // // $: console.log($liveData)

  // onDestroy(() => {
  //   Object.values(sockets).forEach((socket) => {
  //     console.log("disconnecting socket");
  //     socket.disconnect();
  //   });
  // });

  let sockets: { [key: number]: any } = {};
  let liveData = writable([]);

  // function setupSocketForAllStores() {
  //   disconnectAllSockets();
  //   allStores
  //     .filter((store: any) => store.id !== -1)
  //     .filter((store: any) => store.hasKitchen === true)
  //     .forEach((store: any) => {
  //       setupSocket(store.id);
  //     });
  // }

  function setupSocketForSingleStore(storeId: number) {
    disconnectAllSockets();
    // liveData.set([]); // Clear live data
    setupSocket(storeId);
  }

  function disconnectAllSockets() {
    Object.values(sockets).forEach((socket) => {
      console.log("disconnecting socket");
      socket.disconnect();
    });
    sockets = {};
  }

  function setupSocket(storeId: number) {
    const userID = user?.moksaId;
    if (sockets[storeId]) {
      sockets[storeId].disconnect();
    }

    sockets[storeId] = io("https://dev.api.moksa.ai", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });

    const socket = sockets[storeId];

    socket.on("error", (err) => {
      console.log(`error for store ${storeId}:`, err);
    });

    socket.on("connect", () => {
      console.log(`connected for safety socket ${storeId}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeId);
    });

    socket.on(`employee_safety_store_${storeId}`, (data) => {
      console.log(`Received employee_safety for store ${storeId}:`, data);
      liveData.update((currentData) => {
        return [{ storeId, ...data }, ...currentData].slice(0, 100);
      });
    });

    socket.on("disconnect", () => {
      console.log(`disconnected for store ${storeId}`);
    });
  }
  // $: console.log($selectedStore);
  $: if ($selectedStore) {
    // if ($selectedStore.value === -1) {
    //   setupSocketForAllStores();
    // } else {
    setupSocketForSingleStore($selectedStore.value);
    // }
  }

  function cleanValue(value: string | number): string {
    const stringValue = String(value);
    // Enclose values containing commas or quotes in double quotes
    if (stringValue.includes(",") || stringValue.includes('"')) {
      // Escape any double quotes inside the value by doubling them
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
  function convertArrToCSV(
    arr: any[],
    fileName: string,
    excludeKeys: string[] = [],
  ): void {
    // Extract the headers
    const headers = Object.keys(arr[0])
      .filter((key) => !excludeKeys.length || !excludeKeys.includes(key)) // Filter out excluded keys
      .join(",");
    // Extract the data rows with value cleaning
    const rows = arr
      .map((obj) => {
        return Object.keys(obj)
          .filter((key) => !excludeKeys.length || !excludeKeys.includes(key)) // Filter out excluded keys
          .map((key) => cleanValue(obj[key]))
          .join(",");
      })
      .join("\n");
    // Combine headers and rows
    const csvContent = headers + "\n" + rows;
    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    // Create a link element to download the CSV
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; //file name after download
    document.body.appendChild(link);
    // Programmatically click the link to trigger the download
    link.click();
    // Clean up the link after download
    document.body.removeChild(link);
  }

  import { Input } from "../ui/input";
  import { createEventDispatcher } from "svelte";

  // ... existing code ...

  let filterText = "";
  $: filteredFruits = fruits.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  const dispatch = createEventDispatcher();

  function handleSelect(fruit) {
    liveData.set([]);
    selectedStore.set(fruit);
    dispatch("select", fruit);
  }

  // $: console.log('safety Data',$safetyData)
</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar"
>
  <div class="flex items-center justify-between">
    <span
      class="flex items-center border-black h-[40px] border-opacity-[18%] border-[1px] rounded-md dark:border-white"
    >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7 Days" ? "bg-[#0BA5E9] rounded-l-md text-white" : "text-black dark:text-white dark:border-white"}`}
        on:click={() => dateRange.set("7 Days")}>7 Days</button
      >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "15 Days" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
        on:click={() => dateRange.set("15 Days")}>15 Days</button
      >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "30 Days" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
        on:click={() => dateRange.set("30 Days")}>30 Days</button
      >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "12 Months" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
        on:click={() => dateRange.set("12 Months")}>12 Months</button
      >
      <Popover.Root openFocus bind:open={close}>
        <Popover.Trigger asChild let:builder>
          <Button
            on:click={() => (value = undefined)}
            builders={[builder]}
            class={`2xl:py-2 2xl:px-3 py-1 px-2  text-sm hover:bg-[#0BA5E9] hover:text-white ${$dateRange === "custom" ? "bg-[#0BA5E9] rounded-r-md text-white" : "text-black dark:text-white bg-transparent dark:border-white"}`}
          >
            {customDateLabel}</Button
          >
        </Popover.Trigger>
        <Popover.Content class="w-auto p-0 " align="start">
          <RangeCalendar
            bind:value
            bind:startValue
            initialFocus
            numberOfMonths={2}
            placeholder={value?.start}
          />
        </Popover.Content>
      </Popover.Root>
    </span>
    <span class="flex items-center gap-3">
      <!-- <Button variant="outline" class="flex items-center gap-1">
        <ListFilter size={18} /> Filters</Button
      > -->
      <Select.Root portal={null}>
        <Select.Trigger
          class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value
            placeholder={fruits.length > 0
              ? $selectedStore?.label
              : "No Stores"}
          />
        </Select.Trigger>

        <Select.Content class="max-h-[200px] overflow-y-auto">
          <div class="p-2">
            <Input
              type="text"
              placeholder="Search stores..."
              bind:value={filterText}
              class="mb-2"
            />
          </div>
          <Select.Group>
            {#if filteredFruits.length > 0}
              {#each filteredFruits as fruit}
                <Select.Item
                  on:click={() => handleSelect(fruit)}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            {:else}
              <Select.Item disabled>N/A</Select.Item>
            {/if}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <Button
        class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        on:click={() => {
          const date = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          convertArrToCSV($safetyData, `safety_${date}.csv`, [
            "floormap",
            "logo",
            "updatedAt",
          ]);
        }}
      >
        <Upload size={18} />
        Export Reports
      </Button>
    </span>
  </div>
  <div class="grid grid-cols-8 grid-rows-4 gap-4 mt-4">
    <div
      class="col-span-8 row-span-4 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] bg-[#050F40] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-white text-lg font-semibold flex items-center gap-2">
          Safety Procedures for {$selectedStore.label}
          <span class="text-xs text-white bg-pink-500 rounded-md p-1">
            Live
          </span>
        </p>
      </span>
      <div
        class="h-full w-full min-h-[350px] max-h-[350px] overflow-y-scroll overflow-x-clip"
      >
        {#if $liveData.length > 0}
          <SafetyLiveDataTable data={$liveData} {token} />
        {:else}
          <p class="text-center text-gray-500 min-h-[350px] py-4">
            No Live Data found
          </p>
        {/if}
      </div>
    </div>
    <div
      class="col-span-8 row-span-4 border rounded-md flex flex-col min-h-[200px] dark:border-white/[.7]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class=" text-lg font-semibold flex items-center gap-2">
          Safety Procedures
        </p>
      </span>
      <div class="h-full w-full">
        <!-- {#if $safetyData !== [] && $safetyData?.data?.data.length > 0}
        <SafetyDataTable safetyData={$safetyData?.data?.data}/>
        {:else}
<p class='text-center text-gray-500'>No data found</p>
{/if} -->
        {#if $safetyData.data && $safetyData.data.length > 0}
          <SafetyDataTable
            {token}
            safetyData={$safetyData}
            {dateRange}
            {selectedStore}
            {value}
          />
        {:else}
          <p class="text-center text-gray-500">
            No data found for the selected store
          </p>
        {/if}
        <!-- {:else}
          <p class="text-center text-gray-500">No data available</p>
        {/if} -->
      </div>
    </div>
    <!-- <div class='col-span-3 row-span-4 border rounded-md flex flex-col min-h-[200px] dark:border-white/[.7]'>
         <span class='rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4 flex-shrink-0'>
<p class=' text-lg font-semibold flex items-center gap-2'>
  Employee With SOP Violations
</p>
      </span>
      <div class='h-full w-full'>
{#if $safetyData.length > 0}
    {#if $safetyData.find(store => store.storeId === $selectedStore.id)?.employees.data.data.length > 0}
      <SafetyViolationsDataTable safetyData={$safetyData.find(store => store.storeId === $selectedStore.id).employees.data.data}/>
    {:else}
      <p class='text-center text-gray-500'>No data found for the selected store</p>
    {/if}
  {:else}
    <p class='text-center text-gray-500'>No data available</p>
  {/if}

      </div>
    </div> -->
  </div>
</section>
