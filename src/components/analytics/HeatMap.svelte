<script lang="ts">
  import { ListFilter, Upload } from "lucide-svelte";
  import { Button } from "../ui/button";
  import HeatMapDataTable from "./table/HeatMapDataTable.svelte";
  import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";
  import { onDestroy, onMount } from "svelte";
  import FusionChart from "./FusionChart.svelte";
  import * as Select from "../ui/select";
  import { toast } from "svelte-sonner";
  import * as Popover from "../ui/popover";
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import { writable } from "svelte/store";
  import { io } from "socket.io-client";
  import type { DateRange } from "bits-ui";

  let dateRange = writable("7 Days");
  export let allStores;
  export let aisleStoreData;
  export let token;
  let fusiondevicedata = [];
  let fusiondevicecategories = [];
  let selectedStore = writable({
    value: allStores?.[0]?.id,
    label: allStores?.[0]?.name,
  });
  let isInitialLoad = true;
  let isLoading = writable(false);
  const fruits = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let selectedStoreData: any = null;
  let chartData: any = null;
  let value: DateRange | undefined = undefined;
  let startValue: DateValue | undefined = undefined;
  let customDateLabel = "Custom";
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
    } else {
      customDateLabel = "Custom";
    }
  }

  function createChart() {
    if (chartCanvas) {
      if (chart) {
        chart.destroy();
      }
      const ctx = chartCanvas.getContext("2d");

      if (ctx) {
        Chart.register(PieController, ArcElement, Tooltip, Legend);

        const data = chartData.map((item) => item.value);
        const labels = chartData.map((item) => item.label);
        const colors = [
          "#1E40AF",
          "#1D4ED8",
          "#2563EB",
          "#3B82F6",
          "#60A5FA",
          "#93C5FD",
          "#BFDBFE",
        ];

        chart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.label}: ${context.parsed}%`;
                  },
                },
              },
            },
          },
        });
      }
    }
  }

  $: {
    if ($selectedStore && $aisleStoreData) {
      selectedStoreData = $aisleStoreData.find(
        (store) => store.storeId === $selectedStore.value,
      )?.data;
      console.log("Selected store data:", selectedStoreData);
      // createChart();
    }
  }

  $: console.log(selectedStoreData)

  $: {
    if (selectedStoreData) {
      chartData = Object.entries(selectedStoreData.data.aisle_details).map(
        ([key, value]) => ({
          label: key,
          value: value.percentage,
          count: value.count,
        }),
      );
      setTimeout(() => {
        createChart();
        updateFusionChartData();
      }, 500);
    }
  }

  function updateFusionChartData() {
    if (selectedStoreData && chartData) {
      fusiondevicedata = [
        {
          seriesname: "AisleData",
          data: chartData.map((item) => ({
            value: item.value,
            color: "#07E1A4",
          })),
        },
        {
          seriesname: "RemainingData",
          data: chartData.map((item) => ({
            value: 100 - item.value,
            color: "#9DFFFF",
          })),
        },
      ];

      fusiondevicecategories = [
        {
          category: chartData.map((item) => ({ label: item.label })),
        },
      ];
    }
  }

  async function fetchDataForDateRange() {
    if (isInitialLoad) {
      isInitialLoad = false;
      return; // Skip the first call
    }
    isLoading.set(true);

    const today = new Date();
    let startDate = new Date(today);

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
      const responses = await Promise.all(
        allStores.map(async (store: any) => {
          const response = await fetch(
            `https://api.moksa.ai/people/aisleCount/getAisleCountbyStoreid/${store.id}/${formatDate(startDate)}/${formatDate(today)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
          if (!response.ok) {
            console.error(
              `Failed to fetch aisle count for store ${store.id}: ${response.status} ${response.statusText}`,
            );
            throw new Error(
              `Failed to fetch aisle count for store ${store.id}`,
            );
          }
          const data = await response.json();
          return { storeId: store.id, data };
        }),
      );

      const combinedResponse = responses.flat();
      console.log(combinedResponse);
      aisleStoreData.set(combinedResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  async function fetchCustomDateData() {
    console.log("fetching custom date data");
    const start = value?.start
      ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
      : "";
    const end = value?.end
      ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
      : "";
    console.log(start);
    console.log(end);
    try {
      // Call the three APIs
      const responses = await Promise.all(
        allStores.map(async (store: any) => {
          // console.log(`Fetching aisle count for store ${store.id}`);
          const response = await fetch(
            `https://api.moksa.ai/people/aisleCount/getAisleCountbyStoreid/${store.id}/${start}/${end}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
          if (!response.ok) {
            console.error(
              `Failed to fetch aisle count for store ${store.id}: ${response.status} ${response.statusText}`,
            );
            throw new Error(
              `Failed to fetch aisle count for store ${store.id}`,
            );
          }
          const data = await response.json();
          return { storeId: store.id, data };
        }),
      );

      const combinedResponse = responses.flat();
      console.log(combinedResponse);
      aisleStoreData.set(combinedResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  $: {
    if ($dateRange !== "custom") {
      fetchDataForDateRange();
    }
  }
  $: if ($dateRange === "custom" && (value?.start || value?.end)) {
    fetchCustomDateData();
  }

  let sockets: { [key: number]: any } = {};
  let liveData = writable([]);

  function setupSocketForAllStores() {
    allStores?.forEach((store: any) => {
      setupSocket(store.id);
    });
  }

  function setupSocket(storeId: number) {
    const userID = 8
    if (sockets[storeId]) {
      sockets[storeId].disconnect();
    }

    sockets[storeId] = io("https://api.moksa.ai", {
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
      console.log(`connected for store ${storeId}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeId);
    });

    socket.on(`heatmap_2d_store_${storeId}`, (data) => {
      console.log(`Received heatmap data for store ${storeId}:`, data);
      toast(`Received heatmap data for store ${storeId}:`, {
        description: `Store: ${storeId}, Heatmap Data: ${data}`
      });
      liveData.update((currentData) => {
        return [{ storeId, ...data }, ...currentData].slice(0, 100);
      });
    });

    socket.on("disconnect", () => {
      console.log(`disconnected for store ${storeId}`);
    });
  }

  onMount(() => {
    setTimeout(() => {
      setupSocketForAllStores();
    }, 500);
  });

  $: console.log($liveData)

  onDestroy(() => {
    Object.values(sockets)?.forEach((socket) => {
      console.log('disconnecting socket')
      socket.disconnect();
    });
  });

  $: console.log('c',chartData)
  $: console.log('s',selectedStoreData)
  $: console.log('f',fruits)
</script>

<section
  class="w-full p-4 flex flex-col overflow-y-auto max-h-[calc(100vh-75px)] hide-scrollbar"
>
  <div class="flex items-center justify-between">
    <span class="flex items-center gap-4">
      <span
        class="flex items-center border-black h-[40px] border-opacity-[18%] border-[1px] rounded-md dark:border-white"
      >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7 Days" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
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
        <Popover.Root openFocus>
          <Popover.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              class={`2xl:py-2 2xl:px-3 py-1 px-2  text-sm hover:bg-[#0BA5E9] hover:text-white ${$dateRange === "custom" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white bg-transparent dark:border-white"}`}
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
      <Select.Root portal={null}>
        <Select.Trigger
          class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value placeholder={fruits.length > 0 ?$selectedStore.label: 'No Stores'} />
        </Select.Trigger>
        <Select.Content class="max-h-[200px] overflow-y-auto">
          <Select.Group>
            {#if fruits.length > 0}
            {#each fruits as fruit}
              <Select.Item
                on:click={() => selectedStore.set(fruit)}
                class="px-1"
                value={fruit.value}
                label={fruit.label}>{fruit.label}</Select.Item
              >
            {/each}
            {:else}
            <Select.Item
            class="px-1"
            >
            No Stores
            </Select.Item>
            {/if}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </span>
    <span class="flex items-center gap-3">
      <Button variant="outline" class="flex items-center gap-1">
        <ListFilter size={18} /> Filters</Button
      >
      <Button
        class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      >
    </span>
  </div>
  <div class="grid grid-cols-8 grid-rows-12 gap-4 mt-4">
    <!-- <div
      class="col-span-8 row-span-4 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] bg-[#050F40] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-white text-lg font-semibold flex items-center gap-2">
          Store Name
          <span class="text-xs text-white bg-pink-500 rounded-md p-1">
            Live
          </span>
        </p>
      </span>
      <div class="h-full w-full">
        <HeatMapDataTable />
      </div>
    </div> -->

    <div
      class="col-span-4 row-span-3 border rounded-md flex flex-col dark:border-white/[.7]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-lg font-semibold flex items-center gap-2">
          People Count on each aisle
        </p>
      </span>
      <span class="h-full w-full">
        {#if selectedStoreData !== undefined && selectedStoreData?.totalCount !==0}
        <FusionChart
          data={fusiondevicedata}
          categoriesdata={fusiondevicecategories}
        />
        {:else}
        <p class='px-4'>No data available</p>
        {/if}
      </span>
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md flex flex-col dark:border-white/[.7]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-lg font-semibold flex items-center gap-2">
          Customers Concentration
        </p>
      </span>
      <div class="h-full w-full flex items-start justify-between p-3">
        {#if selectedStoreData !== undefined && selectedStoreData?.totalCount !==0}
        <span class="w-1/4 flex flex-col gap-3">
            {#each chartData as item, index}
              <p class="flex items-center gap-2">
                <span
                  class="flex-shrink-0 size-2 rounded-full"
                  style="background-color: {[
                    '#1E40AF',
                    '#1D4ED8',
                    '#2563EB',
                    '#3B82F6',
                    '#60A5FA',
                    '#93C5FD',
                    '#BFDBFE',
                  ][index % 7]};"
                />
                {item?.label}
                <span class="bg-blue-500 text-white text-sm px-2 rounded">
                  {item?.value.toFixed(2)}%
                </span>
              </p>
            {/each}
          </span>
          <span class="w-3/4">
            <canvas bind:this={chartCanvas}></canvas>
          </span>
          {:else}
          <p class='px-2'>No data available</p>
          {/if}
      </div>
    </div>
    <div class="col-span-4 row-span-4 rounded-md dark:border-white/[.7]">
      <img
        src="/images/heat1.png"
        alt="heat1"
        class="object-cover w-full h-full rounded-md"
      />
    </div>
    <div class="col-span-4 row-span-4 grid-rows-4">
      <img
        src="/images/heat2.png"
        alt="heat2"
        class="object-cover w-full h-full rounded-md"
      />
    </div>
  </div>
</section>
