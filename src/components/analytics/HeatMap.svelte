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

  let dateRange = writable("1hr");
  export let allStores;
  export let aisleStoreData;
  export let token;
  let close = false;

  const fruits = allStores
    ?.filter((store: any) => store.id !== -1)
    ?.map((store: any) => ({
      value: store.id,
      label: store.name,
    }));

  $: console.log("fruits", fruits);
  $: console.log("daterange", $dateRange);

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
        `https://api.moksa.ai/store/getFloorMapByStoreid/${storeId}`,
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
  let floorMaps = writable([]);

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

    let hd = $heatMapData.data;
    if (!Array.isArray(hd) || !Array.isArray(hd[0])) {
      console.error("Heatmap data is not a 2D array:", hd);
      toast.error("Incorrect heatmap data");
      return;
    }

    const maxValue = Math.max(...hd.map((row) => Math.max(...row)));
    console.log(maxValue);
    for (let y = 0; y < hd.length; y++) {
      for (let x = 0; x < hd[y].length; x++) {
        const value = hd[y][x];
        const intensity = (value / maxValue) * 255;
        let color;

        if (intensity <= 10) {
          color = `rgb(0, 0, ${Math.floor(255 * (intensity / 10))})`;
        } else if (intensity <= 50) {
          const t = (intensity - 10) / 40;
          color = `rgb(${Math.floor(255 * t)}, ${Math.floor(255 * t)}, ${Math.floor(255 * (1 - t))})`;
        } else if (intensity <= 100) {
          const t = (intensity - 50) / 50;
          color = `rgb(255, ${Math.floor(255 * (1 - t))}, 0)`;
        } else if (intensity <= 200) {
          const t = (intensity - 100) / 100;
          color = `rgb(255, ${Math.floor(165 * (1 - t))}, 0)`;
        } else {
          color = `rgb(255, 0, 0)`;
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

  async function updateSelectedFloorMap() {
    console.log("updateSelectedFloorMap called", $dateRange);
    customDateLabel = "custom";

    loadingFloor = true;
    const selectedMap = $floorMaps.find(
      (map) => map.storeId === $selectedStore.value,
    );
    selectedFloorMap = selectedMap ? selectedMap.img : null;
    // console.log('Selected floor map:', selectedFloorMap);

    if (selectedFloorMap !== "" && selectedFloorMap !== null) {
      // console.log('selectedFloorMap',selectedFloorMap)
      const mapData = await fetch(
        `https://api.moksa.ai/heatmap/getHeatMapByTimeAndStoreId/${$dateRange}/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await mapData.json();
      console.log("mapData", data);
      heatMapData.set(data);
      const res = await fetch("https://api.moksa.ai/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: selectedFloorMap,
        }),
      });
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
      const mapData = await fetch(
        `https://api.moksa.ai/heatmap/getHeatMapByTimeAndStoreId/custom/${$selectedStore.value}`,
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
      heatMapData.set(data);
      const res = await fetch("https://api.moksa.ai/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: selectedFloorMap,
        }),
      });
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

  let fusiondevicedata = [];
  let fusiondevicecategories = [];
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
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "1hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("1hr")}>1hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "3hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("3hr")}>3hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "5hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("5hr")}>5hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("7hr")}>7hr</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "1" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("1")}>1 Day</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "3" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("3")}>3 Day</button
        >
        <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("7")}>7 Day</button
        >
        <!-- <button
          class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "live" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
          on:click={() => dateRange.set("live")}>live</button
        > -->
        <Popover.Root openFocus bind:open={close}>
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
          class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value
            placeholder={fruits.length > 0 ? $selectedStore.label : "No Stores"}
          />
        </Select.Trigger>
        <Select.Content class="max-h-[300px] overflow-y-auto">
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
    <span class="flex items-center gap-3">
      <!-- <Button variant="outline" class="flex items-center gap-1">
        <ListFilter size={18} /> Filters</Button
      > -->
      <!-- <Button
        class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      > -->
    </span>
  </div>
  <div class="grid grid-cols-8 grid-rows-8 gap-4 mt-4">
    <div
      class="col-span-8 row-span-2 flex items-center justify-center rounded-t-xl dark:border-white/[.7]"
    >
      <p class="text-lg font-semibold">Heat Map for {$selectedStore.label}</p>
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
          class="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
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

    <!-- <div
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
    </div> -->
    <!-- <div class="col-span-4 row-span-4 rounded-md dark:border-white/[.7]">
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
  </div> -->
  </div>
</section>
