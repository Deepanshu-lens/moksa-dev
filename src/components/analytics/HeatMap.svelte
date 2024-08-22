<script lang="ts">
  import { ListFilter, Upload } from "lucide-svelte";
  import { Button } from "../ui/button";
  import HeatMapDataTable from "./table/HeatMapDataTable.svelte";
  import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";
  import { onMount } from "svelte";
  import FusionChart from "./FusionChart.svelte";
  import * as Select from "../ui/select";

export let allStores;
export let aisleStoreData;

  const datadevicevalue = { Active: 5000, Inactive: 1000, Faulty: 400 };
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

    const fruits = allStores.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let chartLoading = true;

  function createChart() {
    if (chartCanvas && !chart) {
      const ctx = chartCanvas.getContext("2d");

      if (ctx) {
        Chart.register(PieController, ArcElement, Tooltip, Legend);

        const data = [50, 13, 10, 10, 12, 3, 2];
        const labels = [
          "vegetables",
          "fruits",
          "toys",
          "books",
          "liquor",
          "bread",
          "washing",
        ];
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
                backgroundColor: colors,
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

  onMount(() => {
    chartLoading = false;
    setTimeout(() => {
      createChart();
    }, 100);
  });

  $:console.log($aisleStoreData[0].data)
  $:console.log($aisleStoreData)
</script>

<section
  class="w-full p-4 flex flex-col overflow-y-auto max-h-[calc(100vh-75px)] hide-scrollbar"
>
  <div class="flex items-center justify-between">
    <span class='flex items-center gap-2'>
    <span
      class="flex items-center border-black border-opacity-[18%] border-[1px] rounded-md dark:border-white dark:text-white"
    >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:border-white dark:text-white"
        >1 Hour</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:border-white dark:text-white"
        >24 Hours</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:border-white dark:text-white"
        >7 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:border-white dark:text-white"
        >30 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:border-white dark:text-white"
        >12 Months</button
      >
      <button class="2xl:py-2 2xl:px-3 py-1 px-2 text-black text-sm dark:border-white dark:text-white"
        >Custom</button
      >
    </span>
     <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={allStores[0].name} />
          </Select.Trigger>
               <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              {#each fruits as fruit}
                <Select.Item
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root>
    </span>
    <span class="flex items-center gap-3">
      <Button variant="outline" class="flex items-center gap-1">
        <ListFilter size={18} /> Filters</Button
      >
      <Button class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      >
    </span>
  </div>
  <div class="grid grid-cols-8 grid-rows-12 gap-4 mt-4">
    <div
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
    </div>
    <!-- <div class='flex items-center justify-end'>

    </div> -->
    <div class="col-span-4 row-span-3 border rounded-md flex flex-col dark:border-white/[.7]">
      <span
        class="rounded-t-xl w-full h-[50px] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-lg font-semibold flex items-center gap-2">
          People Count on each aisle
        </p>
      </span>
      <span class="h-full w-full">
        <FusionChart
          data={fusiondevicedata}
          categoriesdata={fusiondevicecategories}
        />
      </span>
    </div>
    <div class="col-span-4 row-span-3 border rounded-md flex flex-col dark:border-white/[.7]">
      <span
        class="rounded-t-xl w-full h-[50px] flex items-center justify-between px-4 flex-shrink-0"
      >
        <p class="text-lg font-semibold flex items-center gap-2">
          Customers Concentration
        </p>
      </span>
      <div class="h-full w-full flex items-center justify-between p-3">
        <span class="w-1/4 flex flex-col gap-3">
          <p class="flex items-center gap-2">
            <span
              class="flex-shrink-0 size-2 rounded-full bg-[#1E40AF]"
            />vegetables
            <span class="bg-blue-500 text-white text-sm px-2 rounded">
              50%
            </span>
          </p>
          <p class="flex items-center gap-2">
            <span
              class="flex-shrink-0 size-2 rounded-full bg-[#1D4ED8]"
            />fruits
            <span class="bg-blue-500 text-white text-sm px-2 rounded">13%</span>
          </p>
          <p class="flex items-center gap-2">
            <span class="flex-shrink-0 size-2 rounded-full bg-[#2563EB]" />toys
            <span class="bg-blue-500 text-white text-sm px-2 rounded">10%</span>
          </p>
          <p class="flex items-center gap-2">
            <span class="flex-shrink-0 size-2 rounded-full bg-[#3B82F6]" />books
            <span class="bg-blue-500 text-white text-sm px-2 rounded">10%</span>
          </p>
          <p class="flex items-center gap-2">
            <span
              class="flex-shrink-0 size-2 rounded-full bg-[#60A5FA]"
            />liquor
            <span class="bg-blue-500 text-white text-sm px-2 rounded">12%</span>
          </p>
          <p class="flex items-center gap-2">
            <span class="flex-shrink-0 size-2 rounded-full bg-[#93C5FD]" />bread
            <span class="bg-blue-500 text-white text-sm px-2 rounded">3%</span>
          </p>
          <p class="flex items-center gap-2">
            <span
              class="flex-shrink-0 size-2 rounded-full bg-[#BFDBFE]"
            />washing
            <span class="bg-blue-500 text-white text-sm px-2 rounded">2%</span>
          </p>
        </span>
        <span class="w-3/4">
          <canvas bind:this={chartCanvas}></canvas>
        </span>
      </div>
    </div>
    <div class="col-span-4 row-span-4 rounded-md  dark:border-white/[.7]">
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
