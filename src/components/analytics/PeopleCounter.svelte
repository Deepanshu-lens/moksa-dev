<script lang="ts">
  import PeopleCountDataTable from "./table/PeopleCountDataTable.svelte";
  import { Store, Upload } from "lucide-svelte";
  import { Button } from "../ui/button";
  import * as Select from "@/components/ui/select";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import { writable } from "svelte/store";
  import LivePeopleCountDataTable from "./table/LivePeopleCountDataTable.svelte";
  import * as Popover from "../ui/popover";
  import type { DateRange } from "bits-ui";
  import { type DateValue } from "@internationalized/date";
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import Input from "../ui/input/input.svelte";
  export let allStores;
  export let token;
  let storeData: any = writable([]);
  let liveData = writable([]);
  let dateRange = writable("7");
  let value: DateRange | undefined = undefined;
  let startValue: DateValue | undefined = undefined;
  let customDateLabel = "Custom";
  let close = false;
  const userID = 8;
  const fruits = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  export let curruser;
  let loadingLive = writable(false);

  let selectedStore = writable({ value: -1, label: "All Stores" });

  let filterText = "";
  $: filteredFruits = fruits.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  // let allS = writable(fruits);

  let socket: any;

  onMount(async () => {
    if (allStores.length > 0) {
      getLiveData($selectedStore.value);
    }
  });

  $: {
    if ($selectedStore) {
      getLiveData($selectedStore?.value);
    }
  }

  function setupSocket() {
    if (socket) {
      socket.disconnect();
    }

    socket = io("https://dev.api.moksa.ai", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });

    socket.on("error", (err) => {
      console.log("error", err);
    });

    socket.on("connect", () => {
      console.log(`connected for ${$selectedStore.value}, ${userID}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", $selectedStore.value);
    });

    socket.on(`people_count_store_${$selectedStore.value}`, (data) => {
      console.log(
        `Received live people count for store ${$selectedStore.value}:`,
        data,
      );
      liveData.update((currentData) => {
        console.log(currentData);
        const existingStoreIndex = currentData.data.findIndex(
          (store) => store.store_id === data.store_id,
        );

        const storeExists = fruits.some(
          (store) => store?.value === data?.store_id,
        );

        // if store doesn't exist and user is not super-admin
        if (curruser?.role !== "superAdmin" && !storeExists) {
          return { data: currentData?.data };
        }

        if (existingStoreIndex !== -1) {
          // Update existing store data
          const updatedData = [...currentData.data];
          updatedData[existingStoreIndex] = {
            ...updatedData[existingStoreIndex],
            noofcustomers: data.noofcustomers.toString(),
            going_out_count: data.noofcustomersgoingout.toString(),
          };
          return { ...currentData, data: updatedData };
        } else {
          // Add new store data
          console.log(data);
          const newStoreData = {
            store_id: data.store_id,
            store:
              data.store_name ||
              allStores.find((store) => store.id === data.store_id)?.name ||
              data.store_id, // Assuming the socket message includes store_name
            noofcustomers: data.noofcustomers.toString(),
            going_out_count: data.noofcustomersgoingout.toString(),
            busyhour: data.busyhour,
            predictedmean: 0,
            predicted_percentage: 0,
            total_count: data.going_in.toString(),
          };
          return { ...currentData, data: [...currentData.data, newStoreData] };
          console.log("recieved data from unknow store");
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
      // liveData.set([]);
    });
  }

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

  $: {
    if ($selectedStore.value !== undefined && token !== "") {
      if ($dateRange === "7 Days") {
        console.log("called week data");
        getWeekData($selectedStore.value);
      } else if (value === undefined && $dateRange.toLowerCase() !== "custom") {
        console.log("called date range function");
        fetchDataForDateRange();
      } else if ($dateRange.toLowerCase() === "custom" && value) {
        console.log("called custom date data");
        fetchCustomDateData();
      }
      setupSocket();
    }
  }

  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  async function getLiveData(storeId: number) {
    loadingLive.set(true);
    const response = await fetch(
      `https://dev.api.moksa.ai/people/getPeopleCountLive/${storeId}/1/30`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    console.log("live 30 min data", storeId, data);
    liveData.set(data?.data);
    loadingLive.set(false);
  }

  async function getWeekData(storeId: number) {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0];
    const weekData = await fetch(
      `https://dev.api.moksa.ai/people/getPeopleCount/${storeId}/${weekAgo}/${today}`,
      {
        headers:
          $selectedStore.value !== -1
            ? {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                datetype: 7,
                pagenumber: 1,
                pagepersize: 100,
              }
            : {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                pagenumber: 1,
                pagepersize: 100,
              },
        method: "GET",
      },
    );
    const d = await weekData.json();
    console.log("week data people count", d);
    if (d.status === 200) {
      storeData.set(d.data.data);
    }
  }

  async function fetchDataForDateRange() {
    customDateLabel = "Custom";
    console.log(token);
    console.log("called date range function");
    const today = new Date();
    let startDate = new Date(today);

    switch ($dateRange) {
      case "7":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "yesterday":
        startDate.setDate(today.getDate() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    console.log(formatDate(startDate));
    console.log(formatDate(today));
    console.log($dateRange);
    const storeId = $selectedStore.value;
    console.log(storeId);
    // console.log(token);
    try {
      // Call the three APIs
      const d = await fetch(
        `https://dev.api.moksa.ai/people/getPeopleCount/${storeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            datetype: $dateRange,
            pagenumber: 1,
            pagepersize: 100,
          },
        },
      );
      console.log(d);
      const peopleCount = await d.json();

      console.log("poeplecount", peopleCount);
      if (peopleCount.status === 200) {
        storeData.set(peopleCount?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchCustomDateData() {
    console.log("fetching custom date data", $selectedStore.value);
    const start = value?.start
      ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
      : "";
    const end = value?.end
      ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
      : "";
    console.log(start);
    console.log(end);
    const storeId = $selectedStore.value;
    try {
      // console.log("fetching custom date data");
      // console.log(token);
      // Call the three APIs
      const d = await fetch(
        `https://dev.api.moksa.ai/people/getPeopleCount/${storeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            datetype: "custom",
            pagenumber: 1,
            pagepersize: 100,
            startdate: start,
            enddate: end,
          },
        },
      );
      console.log(d);
      const peopleCount = await d.json();

      console.log("poeplecount", peopleCount);
      if (peopleCount.status === 200) {
        storeData.set(peopleCount?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function convertArrToCSV(
    arr: any[],
    fileName: string,
    excludeKeys: string[] = [],
  ): void {
    const filteredArr = arr.filter(
      (item) => item !== null && item !== undefined,
    );

    // Extract the headers

    const headers = Object.keys(filteredArr[0])
      .filter((key) => !excludeKeys.includes(key))
      .join(",");

    // Extract the data rows with value cleaning
    const rows = filteredArr
      .map((obj) => {
        return Object.keys(obj)
          .filter((key) => !excludeKeys.includes(key))
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

  function cleanValue(value: string | number): string {
    const stringValue = String(value);

    // Enclose values containing commas or quotes in double quotes
    if (stringValue.includes(",") || stringValue.includes('"')) {
      // Escape any double quotes inside the value by doubling them
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }
</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar"
>
  <div class="">
    <div class="flex items-center justify-between w-full mb-4">
      <div
        class="w-[20rem] border rounded-md bg-gradient-to-r from-[#00FEA3] to-[#007077] p-2 flex items-center gap-3 h-[85px] mx-1"
      >
        <span
          class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
        >
          <Store size={40} />
        </span>
        <span>
          <p class="text-white text-xl font-bold">{allStores.length}</p>
          <p class="text-sm font-semibold text-white">stores registered</p>
        </span>
      </div>
      <div class="flex items-center justify-end gap-x-3">
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg bg-transparent"
          >
            <Select.Value placeholder={$selectedStore.label} />
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
                {#each filteredFruits as fruit, index}
                  <Select.Item
                    on:click={() => {
                      selectedStore.set(fruit);
                      // fetchDataStoreWise();
                    }}
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
        <span class="flex items-center gap-3">
          <Button
            on:click={() => {
              const date = new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              convertArrToCSV($liveData?.data, `live_people_count_${date}.csv`);
              convertArrToCSV($storeData, `people_count_${date}.csv`);
            }}
            class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
            ><Upload size={18} /> Export Reports</Button
          >
        </span>
      </div>
    </div>
    <div
      class="col-span-8 row-span-4 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7] max-h-[400px]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] bg-[#050F40] flex items-center justify-between px-4"
      >
        <p class="text-white text-lg font-semibold flex items-center gap-2">
          People Count: {$selectedStore.label}
          <span class="text-xs text-white bg-pink-500 rounded-md p-1">
            Live
          </span>
        </p>
      </span>
      <div class="h-full w-full max-h-[300px] overflow-y-auto">
        {#if $liveData?.data?.length > 0}
          <LivePeopleCountDataTable
            liveData={$liveData || []}
            selectedStore={$selectedStore}
            {allStores}
            {token}
            {dateRange}
            {value}
            loading={$loadingLive}
          />
        {:else}
          <p class="flex items-center justify-center py-10">
            No live data available
          </p>
        {/if}
      </div>
    </div>

    <div
      class="col-span-8 row-span-4 border rounded-md p-2 flex flex-col dark:border-white/[.7] relative min-h-[450px] mt-10"
    >
      <span
        class="flex gap-4 items-center absolute left-1/2 -translate-x-1/2 top-3"
      >
        <span
          class="flex items-center border-black border-opacity-[18%] h-[40px] border-[1px] rounded-md dark:border-white"
        >
          <button
            class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "yesterday" ? " rounded-l-md bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
            on:click={() => {
              dateRange.set("yesterday");
              value = undefined;
            }}>Yesterday</button
          >
          <button
            class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7" ? " bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
            on:click={() => {
              dateRange.set("7");
              value = undefined;
            }}>Last Week</button
          >
          <button
            class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "30" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
            on:click={() => {
              dateRange.set("30");
              value = undefined;
            }}>Last Month</button
          >

          <button
            class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "year" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
            on:click={() => {
              dateRange.set("year");
              value = undefined;
            }}>Last Year</button
          >
          <Popover.Root openFocus bind:open={close}>
            <Popover.Trigger asChild let:builder>
              <Button
                on:click={() => {
                  dateRange.set("Custom");
                  value = undefined;
                }}
                builders={[builder]}
                class={`2xl:py-2 2xl:px-3 py-1 px-2  text-sm hover:bg-[#0BA5E9] hover:text-white ${$dateRange === "custom" ? "bg-[#0BA5E9] text-white rounded-r-md" : "text-black dark:text-white bg-transparent dark:border-white"}`}
              >
                {customDateLabel}</Button
              >
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" align="start">
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
      </span>
      <div class="h-full w-full">
        <!-- {#if $storeData.length > 0} -->
        <PeopleCountDataTable
          {storeData}
          {selectedStore}
          {token}
          {dateRange}
          {value}
        />
        <!-- {:else}
          <span
            class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4"
          >
            <p class=" text-xl font-semibold flex items-center gap-2">
              {$selectedStore.label}
            </p>
          </span>
          <p class="flex items-center justify-center">No data</p>
        {/if} -->
      </div>
    </div>
  </div>
</section>
