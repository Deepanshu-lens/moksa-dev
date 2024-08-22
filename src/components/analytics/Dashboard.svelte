<script lang="ts">
  import { Plus, Upload } from "lucide-svelte";
  import { Button } from "../ui/button";
  export let allStores;
  export let allStoresData;
  export let aisleData;
  export let theftandcamera;
  export let busyness;
  export let efficiency;
  export let safetyDetails;
  export let theftData;

  // console.log(theftData)

  const fruits = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  import * as Select from "../ui/select";
  import { BarController, BarElement } from "chart.js";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import { onMount } from "svelte";
  import DashboardStoresOverviewtable from "./table/DashboardStoresOverviewtable.svelte";
  import DashboardStoreCard from "../cards/DashboardStoreCard.svelte";
  import DashboardEfficiencyDataTable from "./table/DashboardEfficiencyDataTable.svelte";
  import DashboardSaftetyDataTable from "./table/DashboardSaftetyDataTable.svelte";

  let chartLoading = true;
  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let barChart: Chart | null = null;
  let barChartCanvas: HTMLCanvasElement;

  function createBarChart() {
  if (barChartCanvas && !barChart) {
    const ctx = barChartCanvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 400, 0, 0);
        gradient.addColorStop(0, "#357DFF");
        gradient.addColorStop(1, "#053895");

    const gradient2 = ctx.createLinearGradient(0, 400, 0, 0);
        gradient2.addColorStop(0, "#FFB156");
        gradient2.addColorStop(1, "#FF007A");

    if (ctx) {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale);

      const labels = theftData?.data.map(item => item.day_of_week.trim());
      const theftDetectedData = theftData?.data.map(item => parseInt(item.theft_detected));
      const theftPreventedData = theftData?.data.map(item => parseInt(item.theft_prevented));

      barChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Theft Detected",
              data: theftDetectedData,
              backgroundColor: gradient,
              borderColor: gradient,
              borderWidth: 1,
              borderRadius: 10,
            },
            {
              label: "Theft Prevented",
              data: theftPreventedData,
              backgroundColor: gradient2,
              borderColor: gradient2,
              borderWidth: 1,
              borderRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
                drawBorder: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y;
                  }
                  return label;
                },
              },
            },
          },
        },
      });
    }
  }
}

  function createChart() {
    if (chartCanvas && !chart) {
      const ctx = chartCanvas.getContext("2d");
      const gradient = ctx.createLinearGradient(400, 0, 0, 0);
      gradient.addColorStop(0, "rgba(235, 230, 11, 1)");
      gradient.addColorStop(1, "rgba(7, 225, 164, 1)");

      if (ctx) {
        Chart.register(
          LineController,
          LineElement,
          PointElement,
          LinearScale,
          CategoryScale,
        );

        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const onlineData = [65, 59, 80, 81, 56, 55, 40];

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Online",
                borderColor: gradient,
                backgroundColor: gradient,
                borderWidth: 2,
                data: onlineData,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: gradient,
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  color: "rgba(0,0,0,.05)",
                },
                ticks: {
                  maxRotation: 0,
                },
              },
              y: {
                display: true,
                title: {
                  display: false,
                  text: "Activity Percentage",
                },
                grid: {
                  display: false,
                },
                beginAtZero: true,
                suggestedMax: 100,
                ticks: {
                  stepSize: 20,
                  callback: function (value) {
                    return value + "%";
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
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
      createBarChart();
      createChart();
    }, 100);
  });
</script>

<section
  class="w-full p-4 flex flex-col hide-scrollbar overflow-y-auto max-h-[calc(100vh-75px)]"
>
  <div class="flex items-center justify-between">
    <span
      class="flex items-center border-black border-opacity-[18%] border-[1px] rounded-md h-[40px] dark:border-white"
    >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >1 Hour</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >24 Hours</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >7 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >30 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >12 Months</button
      >
      <button class="2xl:py-2 2xl:px-3 py-1 px-2 text-black text-sm dark:text-white "
        >Custom</button
      >
    </span>
    <span class="flex items-center gap-3">
      <Button variant="outline" class="flex items-center gap-1"
        ><Upload size={18} /> Export</Button
      >
      <Button
        class="flex items-center flex-row-reverse justify-between px-2 gap-1 font-medium text-white rounded-xl bg-[#00A569] hover:text-[#00A569] hover:bg-white"
        ><img src="/images/money.svg" alt="export" class="scale-90" /> Cost Saving</Button
      >
    </span>
  </div>
  <div class="grid grid-cols-8 grid-rows-11 gap-4 gap-y-10 h-[1400px] mt-4">
    <div
      class="col-span-2 border rounded-lg bg-gradient-to-r from-[#00FEA3] to-[#007077] px-4 py-3 h-[85px] relative"
    >
      <p class="text-white font-semibold">No. of stores assigned</p>
      <p class="text-xl font-semibold text-white">
        {allStoresData?.totalstorecount}
      </p>
      <img src="/images/card1.png" alt="" class="absolute top-0 right-0" />
    </div>
    <div
      class="col-span-2 border rounded-lg h-[85px] bg-gradient-to-r from-[#02A7FD] to-[#141C64] py-3 px-4 relative"
    >
      <p class="text-white font-semibold">No. of cameras assigned</p>

      <p class="text-xl font-semibold text-white">
        {allStoresData?.totalcameracount}
      </p>
      <img src="/images/card2.png" alt="" class="absolute top-0 right-0" />
    </div>
    <div
      class="col-span-2 border rounded-lg bg-gradient-to-r from-[#FFB156] to-[#FF007A] px-4 py-3 relative h-[85px]"
    >
      <p class="text-white font-semibold">Total theft detected</p>
      <p class="text-xl font-semibold text-white">
        {allStoresData?.totaldetectedthefts}
      </p>
      <img src="/images/card3.png" alt="" class="absolute top-0 right-0" />
    </div>
    <div
      class="col-span-2 border rounded-lg bg-gradient-to-r from-[#C8C303] to-[#597802] px-4 py-3 relative h-[85px]"
    >
      <p class="text-white font-semibold">No. of thefts prevented</p>
      <p class="text-xl font-semibold text-white">
        {allStoresData?.totalpreventedthefts}
      </p>
      <img src="/images/card4.png" alt="" class="absolute top-0 right-0" />
    </div>

    <div
      class="col-span-5 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <span>
          <p class="text-[#323232] dark:text-white text-lg font-semibold">Thefts Detected</p>
          <p class="text-sm font-medium text-[#8C8C8C]">
            Average Theft Detection
          </p>
        </span>
        <span class='flex gap-4 items-center'>
          <span class='flex gap-1 items-center'><span class='w-[10px] h-[10px] bg-gradient-to-r from-[#357DFF] to-[#053895] rounded-full'/>Detected</span>
          <span class='flex gap-1 items-center'><span class='w-[10px] h-[10px] bg-gradient-to-r from-[#FFB156] to-[#FF007A] rounded-full'/>Prevented</span>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder="All Stores" />
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

      </span>
      <div class="h-full w-full">
        <canvas bind:this={barChartCanvas}></canvas>
      </div>
    </div>
    <div
      class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">All Stores</p>
        <Button variant="outline" class="flex items-center gap-1 text-xs"
          ><Plus size={14} />Add Store</Button
        >
      </span>
      <div class="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
        {#each theftandcamera as data, index}
          <DashboardStoreCard
            storeName={data.name}
            cameraCount={data.camera_count}
            managerName={data.manager}
            activeCount={parseInt(data.theft_detected_count)}
            totalCount={parseInt(data.theft_prevented_count) + parseInt(data.theft_detected_count)}
            bgColor={index % 2 === 0 ? "#F5F5F5" : "white"}
          />
        {/each}
      </div>
    </div>
    <div
      class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <span>
          <p class="text-[#323232] dark:text-white text-lg font-semibold">Store Busy Hours</p>
          <p class="text-sm font-medium text-[#8C8C8C]">
            Average Theft Detection
          </p>
        </span>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder="All Stores" />
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
      <div class="h-full w-full">
        {#if busyness.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          <canvas bind:this={chartCanvas}></canvas>
        {/if}
      </div>
    </div>
    <div
      class="col-span-5 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between font-semibold">
        <p class="text-[#323232] dark:text-white">Stores Overview</p>
      </span>
      <div class="w-full h-full max-h-[300px] overflow-y-auto hide-scrollbar">
        <DashboardStoresOverviewtable {aisleData} />
      </div>
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">Employee Efficiency</p>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder="All Stores" />
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
      <span class="w-full h-full">
        {#if efficiency.data.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          <DashboardEfficiencyDataTable {efficiency} />
        {/if}
      </span>
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">Safety Protocol</p>
      </span>
      <div class="h-full w-full">
        {#if safetyDetails.data.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          <DashboardSaftetyDataTable safetyData={safetyDetails} />
        {/if}
      </div>
    </div>
  </div>
</section>
