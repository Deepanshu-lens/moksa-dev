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
  import Spinner from "../ui/spinner/Spinner.svelte";
  const userID = 8;

  let dateRange = writable("7");
  let floorMaps = writable([]);
  let aisleData = writable(["Fetching"]);

  export let allStores;
  export let token;

  let close = false;

  const fruits = allStores
    ?.filter((store: any) => store.id !== -1)
    ?.map((store: any) => ({
      value: store.id,
      label: store.name,
    }));

  // $: console.log("fruits", fruits);
  // $: console.log("daterange", $dateRange);

  import { Input } from "../ui/input";
  import { createEventDispatcher } from "svelte";

  // ... existing code ...

  let filterText = "";
  $: filteredFruits = fruits.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  const dispatch = createEventDispatcher();

  function handleSelect(fruit) {
    selectedStore.set(fruit);
    dispatch("select", fruit);
  }
  // $:console.log(allStores)

  const getFloorMap = async (storeId) => {
    try {
      const res = await fetch(
        `https://dev.api.moksa.ai/store/getFloorMapByStoreid/${storeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log(`Floor map for store ${storeId}:`, data);
      floorMaps.update((maps) => [
        ...maps,
        { storeId: storeId, img: data.data },
      ]);
      return data;
    } catch (error) {
      console.error(`Error fetching floor map for store ${storeId}:`, error);
    }
  };

  const getAllFloorMaps = async () => {
    await Promise.all(
      allStores
        ?.filter((store: any) => store.id !== -1)
        ?.map((store: any) => getFloorMap(store.id)),
    );
    // console.log('All floor maps:', $floorMaps);
  };

  let selectedFloorMap: string | null = null;
  let storeFloorImg: string | null = null;
  let loadingFloor = true;
  let heatMapData = writable(null);
  let socket: any;
  onMount(async () => {
    await getAllFloorMaps();
    setTimeout(async () => {
      // console.log($floorMaps);
      await updateSelectedFloorMap();
    }, 1000);
  });

  function drawHeatmap() {
    const canvas = document.getElementById(
      "heatmapCanvas",
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // console.log($heatMapData);
    const image = document.querySelector("img") as HTMLImageElement;
    canvas.width = image.width;
    canvas.height = image.height;

    let hd = $heatMapData;
    if (!Array.isArray(hd) || !Array.isArray(hd[0])) {
      console.error("Heatmap data is not a 2D array:", hd);
      toast.error("Incorrect heatmap data");
      return;
    }

    const maxValue = Math.max(...hd.map((row) => Math.max(...row)));
    console.log("maxvalue", maxValue);

    for (let y = 0; y < hd.length; y++) {
      for (let x = 0; x < hd[y].length; x++) {
        const value = hd[y][x];
        // const intensity = (value / maxValue) * 10;
        const intensity = (value / maxValue) * 255;
        // const maxValue = Math.max(...hd.map((row) => Math.max(...row)));
        let color;

        if (intensity <= 10) {
          color = `rgba(0, 0, 0, 0)`;
        } else if (intensity <= 50) {
          color = `rgba(0,0,255,1)`;
        } else if (intensity <= 100) {
          color = `rgba(255, 255, 0, 1)`;
        } else if (intensity <= 150) {
          color = `rgba(255, 165, 0, 1)`;
        } else if (intensity <= 200) {
          color = `rgba(255, 0, 0,1)`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(
          (x / hd[y].length) * canvas.width,
          (y / hd.length) * canvas.height,
          canvas.width / hd[y].length,
          canvas.height / hd.length,
        );
      }
    }
  }

  function setupSocket() {
    if (socket) {
      socket.disconnect();
    }

    socket = io("https://api.moksa.ai", {
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

    socket.on(`aisle_count_store_${$selectedStore?.value}`, (data) => {
      console.log(
        `Received aisle data for store ${$selectedStore.value}:`,
        data,
      );
      aisleData.update((currentData) => {
        console.log(currentData[0], "current data");

        let existingStoreIndex = 0;
        if (typeof currentData !== "object") {
          existingStoreIndex = currentData?.findIndex(
            (store) => store?.store_id == data?.store_id,
          );
          let arr = [];
          arr[0] = { ...data };
          console.log(arr, "data in arr");
          return arr[0];
        } else {
          let temp = { ...data };
          temp["store_id"] = data["store_id"]?.toString();
          temp["total_people_count"] = data["total_people_count"]?.toString();
          return [{ ...temp }];
        }
      });
    });

    // New heatmap data listener
    socket.on(`heatmap_2d_store_${$selectedStore?.value}`, async (data) => {
      console.log(
        `Received heatmap data for store ${$selectedStore.value}:`,
        data,
      );

      if (data?.heatmapValues) {
        heatMapData.set(data?.heatmapValues); // Update heatMapData with the received data
        const res = await fetch(
          `https://dev.api.moksa.ai/stream?key=${selectedFloorMap}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        // selectedImage = imageUrl;
        // console.log('data',data)
        storeFloorImg = imageUrl;
        loadingFloor = false;
        setTimeout(() => {
          drawHeatmap($heatMapData);
        }, 100);
      } else {
        toast.error("heat map data issue in socket");
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  }

  $: {
    if ($selectedStore.value !== undefined && token !== "") {
      setupSocket();
    }
  }

  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  async function updateSelectedFloorMap() {
    console.log("updateSelectedFloorMap called", $dateRange);
    aisleData.set(["Fetching"]);
    customDateLabel = "custom";
    value = undefined;

    loadingFloor = true;
    const selectedMap = $floorMaps.find(
      (map) => map.storeId === $selectedStore.value,
    );
    selectedFloorMap = selectedMap ? selectedMap?.img : null;
    // console.log('Selected floor map:', selectedFloorMap);

    if (selectedFloorMap !== "" && selectedFloorMap !== null) {
      console.log("selectedFloorMap", selectedFloorMap);

      const aData = await fetch(
        `https://dev.api.moksa.ai/people/aisleCount/getAisleCountbyStoreid/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            datetype: $dateRange,
          },
        },
      );

      if (aData.ok) {
        console.log("aData", aData);
        const aiData = await aData.json();

        if (aiData?.data?.length > 0) {
          aisleData.set(aiData?.data);
          setTimeout(() => {
            createChart();
          }, 1000);
        } else {
          aisleData.set([]);
        }
      } else {
        aisleData.set([]);
      }

      const mapData = await fetch(
        `https://dev.api.moksa.ai/heatmap/getHeatMapByTimeAndStoreId/${$dateRange}/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            datetype: $dateRange,
          },
        },
      );
      const data = await mapData.json();
      console.log("mapData", data);
      heatMapData.set(data?.data);
      const res = await fetch(
        `https://dev.api.moksa.ai/stream?key=${selectedFloorMap}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      // selectedImage = imageUrl;
      // console.log('data',data)
      storeFloorImg = imageUrl;
      loadingFloor = false;
      setTimeout(() => {
        drawHeatmap($heatMapData);
      }, 100);
    } else {
      storeFloorImg = null;
      loadingFloor = false;
    }
  }

  async function updateSelectedFloorMapCustom() {
    console.log("updateSelectedFloorMap  custom called", $dateRange);
    loadingFloor = true;
    const start = value?.start
      ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
      : "";
    const end = value?.end
      ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
      : "";
    console.log(start);
    console.log(end);
    const selectedMap = $floorMaps.find(
      (map) => map.storeId === $selectedStore.value,
    );
    selectedFloorMap = selectedMap ? selectedMap.img : null;
    // console.log('Selected floor map:', selectedFloorMap);

    if (selectedFloorMap !== "" && selectedFloorMap !== null) {
      // console.log('selectedFloorMap',selectedFloorMap)

      const aData = await fetch(
        `https://dev.api.moksa.ai/people/aisleCount/getAisleCountbyStoreid/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            datetype: "custom",
            startdate: start,
            enddate: end,
          },
        },
      );

      if (aData.ok) {
        console.log("aData", aData);
        const aiData = await aData.json();

        console.log(
          "aisleData for store",
          $selectedStore.value,
          aiData?.data?.data,
        );

        if (aiData?.data?.length > 0) {
          aisleData.set(aiData?.data);
          setTimeout(() => {
            createChart();
          }, 1000);
        } else {
          aisleData.set([]);
        }
      } else {
        aisleData.set([]);
      }

      const mapData = await fetch(
        `https://dev.api.moksa.ai/heatmap/getHeatMapByTimeAndStoreId/custom/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            startdate: start,
            enddate: end,
          },
        },
      );
      const data = await mapData.json();
      console.log("mapData", data);
      heatMapData.set(data?.data);
      const res = await fetch(
        `https://dev.api.moksa.ai/stream?key=${selectedFloorMap}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      // selectedImage = imageUrl;
      // console.log('data',data)
      storeFloorImg = imageUrl;
      loadingFloor = false;
      setTimeout(() => {
        drawHeatmap($heatMapData);
      }, 100);
    } else {
      storeFloorImg = null;
      loadingFloor = false;
    }
  }

  // Update selectedFloorMap whenever selectedStore changes
  $: if ($selectedStore || $dateRange) {
    if (value?.start || value?.end) {
      updateSelectedFloorMapCustom();
    } else {
      updateSelectedFloorMap();
    }
  }

  // $: transformedFusionData = transformApiDataForFusionChart($aisleData);
  let transformedFusionData;

  $: if ($aisleData[0] === "Fetching" || $aisleData.length === 0) {
    transformedFusionData = {
      data: [],
      categories: [],
    };
  } else {
    transformedFusionData = transformApiDataForFusionChart($aisleData);
  }

  function transformApiDataForFusionChart(data) {
    console.log("data", data);

    if (!data || !data[0]?.aisle_details) return { data: [], categories: [] };

    const aisleDetails = data[0].aisle_details;
    const categories = [{ category: [] }];
    const seriesData = [
      { seriesname: "AisleData", data: [] },
      { seriesname: "RemainingData", data: [] },
    ];

    for (const [aisle, details] of Object.entries(aisleDetails)) {
      categories[0].category.push({ label: aisle });
      seriesData[0].data.push({ value: details.count, color: "#07E1A4" });
      seriesData[1].data.push({
        value: data[0].total_people_count - details.count,
        color: "#9DFFFF",
      });
    }

    return {
      data: seriesData,
      categories: categories,
    };
  }

  const fusiondevicedata = [
    {
      seriesname: "DevicesData",
      data: [
        { value: 40, color: "#07E1A4" },
        { value: 50, color: "#07E1A4" },
        { value: 44, color: "#07E1A4" },
        { value: 89, color: "#07E1A4" },
        { value: 90, color: "#07E1A4" },
        { value: 60, color: "#07E1A4" },
        { value: 90, color: "#07E1A4" },
      ],
    },
    {
      seriesname: "DevicesData",
      data: [
        {
          value: 100 - 40,
          color: "#9DFFFF",
        },
        {
          value: 100 - 50,
          color: "#9DFFFF",
        },
        {
          value: 100 - 44,
          color: "#9DFFFF",
        },
        {
          value: 100 - 89,
          color: "#9DFFFF",
        },
        {
          value: 100 - 90,
          color: "#9DFFFF",
        },
        {
          value: 100 - 60,
          color: "#9DFFFF",
        },
        {
          value: 100 - 90,
          color: "#9DFFFF",
        },
      ],
    },
  ];
  const fusiondevicecategories = [
    {
      category: [
        { label: "vegetables" },
        { label: "fruits" },
        { label: "toys" },
        { label: "books" },
        { label: "liquor" },
        { label: "bread" },
        { label: "washing" },
      ],
    },
  ];

  const colors = [
    "#1E40AF",
    "#1D4ED8",
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#BFDBFE",
    // Add more colors if needed
  ];

  function createChart() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    if (chartCanvas && !chart) {
      const ctx = chartCanvas.getContext("2d");

      if (ctx) {
        Chart.register(PieController, ArcElement, Tooltip, Legend);

        const aisleDetails = $aisleData[0].aisle_details;
        const data = [];
        const labels = [];

        for (const [aisle, details] of Object.entries(aisleDetails)) {
          labels.push(aisle);
          data.push(details.percentage);
        }

        chart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Aisle Data",
                data: data,
                backgroundColor: colors,
                borderWidth: 1,
              },
              {
                label: "Remaining Data",
                data: [0],
                backgroundColor: "transparent",
                borderWidth: 0,
                hidden: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
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

  // onMount(() => {
  //   // chartLoading = false;
  //   setTimeout(() => {
  //     createChart();
  //   }, 1000);
  // });

  let selectedStore = writable({
    value: fruits?.[0]?.value,
    label: fruits?.[0]?.label,
  });
  let isInitialLoad = true;
  let isLoading = writable(false);

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
      setTimeout(() => {
        close = false;
      }, 200);
    } else {
      customDateLabel = "Custom";
    }
  }

  $: console.log("aisleData", $aisleData);
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
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "1hr" ? "bg-[#0BA5E9] rounded-l-md text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("1hr");
            value = undefined;
          }}>1hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "3hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("3hr");
            value = undefined;
          }}>3hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "5hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("5hr");
            value = undefined;
          }}>5hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("7hr");
            value = undefined;
          }}>7hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "1" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("1");
            value = undefined;
          }}>1 Day</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "3" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("3");
            value = undefined;
          }}>3 Day</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => {
            dateRange.set("7");
            value = undefined;
          }}>7 Day</button
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
          <Popover.Content class="w-auto p-0 z-[600000000]" align="start">
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
          class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value
            placeholder={fruits.length > 0 ? $selectedStore.label : "No Stores"}
          />
        </Select.Trigger>
        <Select.Content class="max-h-[300px] z-[50000000000] overflow-y-auto">
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
              <Select.Item disabled>No matching stores</Select.Item>
            {/if}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </span>
    <!-- <span class="flex items-center gap-3">
      <Button variant="outline" class="flex items-center gap-1">
        <ListFilter size={18} /> Filters</Button
      >
      <Button
        class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      >
    </span> -->
  </div>
  <div class="grid grid-cols-8 gap-4 mt-4">
    <div
      class="col-span-8 row-span-2 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7] max-h-[200px]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] bg-[#050F40] flex items-center justify-between px-4"
      >
        <p class="text-white text-lg font-semibold flex items-center gap-2">
          {$selectedStore.label}
          <span class="text-xs text-white bg-pink-500 rounded-md p-1">
            Live
          </span>
        </p>
      </span>
      {#if $aisleData.length > 0 && $aisleData[0] !== "Fetching"}
        <div class="h-full w-full">
          <HeatMapDataTable {aisleData} />
        </div>
      {:else if $aisleData.length === 0}
        <div
          class="h-full w-full flex items-center justify-center min-h-[150px]"
        >
          <p class="text-lg">No data found</p>
        </div>
      {:else if $aisleData[0] === "Fetching"}
        <div
          class="h-full w-full flex items-center justify-center min-h-[150px]"
        >
          <Spinner />
        </div>
      {/if}
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md flex flex-col dark:border-white/[.7] min-h-[300px]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-lg font-semibold flex items-center gap-2">
          People Count on each aisle
        </p>
      </span>
      <span class="h-full w-full relative">
        <FusionChart
          data={transformedFusionData?.data}
          categoriesdata={transformedFusionData?.categories}
        />
        <span
          class="absolute bottom-0 left-0 w-[150px] h-[30px] bg-white z-[200]"
        ></span>
      </span>
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md flex flex-col dark:border-white/[.7] min-h-[300px]"
    >
      {#if $aisleData.length > 0 && $aisleData[0] !== "Fetching"}
        <span
          class="rounded-t-xl w-full h-[50px] flex items-center justify-between px-4 flex-shrink-0"
        >
          <p class="text-lg font-semibold flex items-center gap-2">
            Customers Concentration
          </p>
        </span>
        <div class="h-full w-full flex items-center justify-between p-3">
          <span class="w-1/4 flex flex-col gap-3">
            {#each Object.entries($aisleData[0].aisle_details) as [aisle, details], index}
              <p class="flex items-center gap-2">
                <span
                  class=" capitalize flex-shrink-0 size-2 rounded-full"
                  style="background-color: {colors[index % colors.length]};"
                />{aisle}
                <span class="bg-blue-500 text-white text-sm px-2 rounded">
                  {details.percentage.toFixed(2)}%
                </span>
              </p>
            {/each}
          </span>
          <span class="w-3/4">
            <canvas bind:this={chartCanvas}></canvas>
          </span>
        </div>
      {:else if $aisleData[0] === "Fetching"}
        <div
          class="h-full w-full flex items-center justify-center min-h-[150px]"
        >
          <Spinner />
        </div>
      {:else if $aisleData.length === 0}
        <div class="h-full w-full flex items-center justify-center">
          <p class="text-lg">No data found</p>
        </div>
      {/if}
    </div>
    <div
      class="col-span-8 row-span-2 flex items-center justify-between rounded-t-xl dark:border-white/[.7]"
    >
      <p class="text-lg font-semibold">Heat Map</p>
      <div class="flex flex-col items-end">
        <div class="w-[200px] h-6 flex">
          <div
            class="w-1/3 h-full flex-shrink-0"
            style="background: linear-gradient(to right, rgb(0, 0, 255), rgb(255, 255, 0))"
          ></div>
          <div
            class="w-1/3 h-full flex-shrink-0"
            style="background: linear-gradient(to right, rgb(255, 255, 0), rgb(255, 165, 0))"
          ></div>
          <div
            class="w-1/3 h-full flex-shrink-0"
            style="background: linear-gradient(to right, rgb(255, 165, 0), rgb(255, 0, 0))"
          ></div>
        </div>
        <div class="flex justify-between w-[200px] text-xs mt-1">
          <span>low</span>
          <span>medium</span>
          <span>high</span>
          <span>very high</span>
        </div>
      </div>
    </div>
    {#if storeFloorImg !== null && loadingFloor === false}
      <div
        class="col-span-8 row-span-6 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7] relative"
      >
        <img
          src={storeFloorImg}
          alt="storeFloorImg"
          class=" w-full h-full max-h-[400px] rounded-md"
        />
        <canvas
          id="heatmapCanvas"
          class="absolute top-0 left-0 w-full h-full opacity-70 pointer-events-none z-[20000000]"
        ></canvas>
      </div>
    {:else if loadingFloor === true}
      <div
        class="col-span-8 row-span-6 border rounded-md flex flex-col justify-center items-center rounded-t-xl dark:border-white/[.7]"
      >
        <Spinner />
      </div>
    {:else}
      <div
        class="col-span-8 row-span-6 border rounded-md flex flex-col justify-center items-center rounded-t-xl dark:border-white/[.7]"
      >
        <p class="text-lg font-semibold">
          Floor map not available for this store
        </p>
      </div>
    {/if}
  </div>
</section>
