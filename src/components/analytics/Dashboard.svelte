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
import * as Popover from "../ui/popover";

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
    import { writable } from "svelte/store";
    import AddStoreDialog from "../dialogs/AddStoreDialog.svelte";

  let chartLoading = true;
  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let barChart: Chart | null = null;
  let barChartCanvas: HTMLCanvasElement;
  let selectedStore= writable({ value: -1, label: 'All Stores' })
  let dateRange = writable('7 Days')
 let isInitialLoad = true;
  let isLoading = writable(false);
  export let token:string;
  import type { DateRange } from "bits-ui";

   import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone
  } from "@internationalized/date";  
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import { cn } from "@/lib/utils.js";

    const df = new DateFormatter("en-US", {
    dateStyle: "medium"
  });
 
  // let value: DateRange | undefined = {
  //   start: new CalendarDate(2022, 1, 20),
  //   end: new CalendarDate(2022, 1, 20).add({ days: 20 })
  // };
 
  // let startValue: DateValue | undefined = undefined;

  let value: DateRange | undefined = undefined;
let startValue: DateValue | undefined = undefined;
let customDateLabel = "Custom";

$: {
  if (value?.start && value?.end) {
    const start = new Date(value.start.year, value.start.month - 1, value.start.day);
    const end = new Date(value.end.year, value.end.month - 1, value.end.day);
    customDateLabel = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        const dayDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
console.log(dayDifference)
dateRange.set('custom')
  } else {
    customDateLabel = "Custom";
  }
}

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

      // Process the data
      const processedData = processChartData(busyness);

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: processedData.labels,
          datasets: [
            {
              label: "Busy Hours",
              borderColor: gradient,
              backgroundColor: gradient,
              borderWidth: 2,
              data: processedData.data,
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
                text: "Busy Hour",
              },
              grid: {
                display: false,
              },
              beginAtZero: true,
              suggestedMax: 24,
              ticks: {
                stepSize: 2,
                callback: function (value) {
                  return value.toString().padStart(2, '0') + ':00';
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
                  return `${context.dataset.label}: ${context.parsed.y.toString().padStart(2, '0')}:00`;
                },
                },
              },
            },
          },
        });
      }
    }
  }

  function processChartData(data) {
  const processedData = data.map(item => {
    const busyHour = parseInt(item.busy_hours.split('-')[0]);
    return { day: item.day, value: busyHour };
  });

  return {
    labels: processedData.map(item => item.day),
    data: processedData.map(item => item.value),
  };
}

  onMount(() => {
    chartLoading = false;
    setTimeout(() => {
      createBarChart();
      createChart();
    }, 100);
  });


  let eeScore = writable([])
  let storesTotal = writable([])
  let storesAisle = writable([])
  let theftDataa = writable([])




async function fetchDataStoreWise() {
  if (isInitialLoad) {
    isInitialLoad = false;
    return; // Skip the first call
  }
  isLoading.set(true);

  const today = new Date();
  let startDate = new Date(today);

  switch ($dateRange) {
    case '7 Days':
      startDate.setDate(today.getDate() - 7);
      break;
    case '15 Days':
      startDate.setDate(today.getDate() - 15);
      break;
    case '30 Days':
      startDate.setDate(today.getDate() - 30);
      break;
    case '12 Months':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setDate(today.getDate() - 7);
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
console.log($selectedStore.label, $selectedStore.value)
  try {
    const theftD = await fetch(`https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/${$selectedStore.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'datetype': $dateRange === '7 Days' ? '7' : $dateRange === '15 Days' ? '15' : $dateRange === '30 Days' ? '30' : $dateRange === '12 Months' ? 'year' : '7',
        'startDate': formatDate(startDate),
        'endDate': formatDate(today),
      }
    }).then(res => res.json());

    console.log(theftD);
    theftDataa.set(theftD);

    // Update the bar chart with new data
    updateBarChart(theftD);

  } catch (error) {
    console.error("Error fetching store-wise data:", error);
  } finally {
    isLoading.set(false);
  }
}

function updateBarChart(theftD) {
  console.log($dateRange)
  console.log('first')
  if (barChart) {
    console.log('first')
    console.log(theftD)
    const labels = theftD?.data.map(item => $dateRange === '7 Days' ? item.day_of_week.trim() : $dateRange === '12 Months' ? item.month_name.trim() : item.date.trim());
    const theftDetectedData = theftD?.data.map(item => parseInt(item.theft_detected));
    const theftPreventedData = theftD?.data.map(item => parseInt(item.theft_prevented));

    barChart.data.labels = labels;
    barChart.data.datasets[0].data = theftDetectedData;
    barChart.data.datasets[1].data = theftPreventedData;
    barChart.update();
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
      case '7 Days':
        startDate.setDate(today.getDate() - 7);
        break;
      case '15 Days':
        startDate.setDate(today.getDate() - 15);
        break;
      case '30 Days':
        startDate.setDate(today.getDate() - 30);
        break;
      case '12 Months':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7); 
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

console.log(formatDate(startDate))
console.log(formatDate(today))
    try {
      // Call the three APIs
      const [eeScore, storesTotal, storesAisle,theftD] = await Promise.all([
        fetch(`https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreid/-1/${formatDate(startDate)}/1/20/${formatDate(today)}`,{
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`https://dev.api.moksa.ai/store/getAllStoresTotals/${formatDate(startDate)}/${formatDate(today)}`,{
           headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`https://dev.api.moksa.ai/store/getAllStoresWithAisleDetails/1/20/${formatDate(startDate)}/${formatDate(today)}`,{
           headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/-1`,{
             headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'datetype': $dateRange === '7 Days' ? '7' : $dateRange === '15 Days' ? '15' : $dateRange === '30 Days' ? '30' : $dateRange === '12 Months' ? 'year' : '7',
                'startDate': formatDate(startDate),
                'endDate': formatDate(today),
            }
        }).then(res => res.json())
      ]);

      console.log(eeScore)
      console.log(storesTotal)
      console.log(storesAisle)
      console.log(theftD)
      // eeScore.set(eeScore)
      // storesTotal.set(storesTotal)
      // storesAisle.set(storesAisle)
      theftDataa.set(theftD)

      updateBarChart(theftD)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }


  async function fetchCustomDateData() {
    console.log('fetching custom date data')
    const start = value?.start ? `${value.start.year}-${String(value.start.month).padStart(2, '0')}-${String(value.start.day).padStart(2, '0')}` : '';
    const end = value?.end ? `${value.end.year}-${String(value.end.month).padStart(2, '0')}-${String(value.end.day).padStart(2, '0')}` : '';
    console.log(start)
    console.log(end)
 try {
      // Call the three APIs
      const [eeScore, storesTotal, storesAisle,theftD] = await Promise.all([
        fetch(`https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreid/-1/${start}/1/20/${end}`,{
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`https://dev.api.moksa.ai/store/getAllStoresTotals/${start}/${end}`,{
           headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`https://dev.api.moksa.ai/store/getAllStoresWithAisleDetails/1/20/${start}/${end}`,{
           headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/-1`,{
             headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'datetype': $dateRange === '7 Days' ? '7' : $dateRange === '15 Days' ? '15' : $dateRange === '30 Days' ? '30' : $dateRange === '12 Months' ? 'year' : $dateRange === 'custom' ? 'custom' : '7',
                'startDate': start,
                'endDate': end,
            }
        }).then(res => res.json())
      ]);

      console.log(eeScore)
      console.log(storesTotal)
      console.log(storesAisle)
      console.log(theftD)
      // eeScore.set(eeScore)
      // storesTotal.set(storesTotal)
      // storesAisle.set(storesAisle)
      theftDataa.set(theftD)

      updateBarChart(theftD)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }

    $: {
    if ($dateRange !== 'custom') {
      fetchDataForDateRange();
    }
  }

  $: if ($dateRange === 'custom' && (value?.start || value?.end)) {
  fetchCustomDateData();
}

  $: {
  if ($selectedStore.value !== -1) {
    fetchDataStoreWise();
  } 
}
</script>

<section
  class="w-full p-4 flex flex-col hide-scrollbar overflow-y-auto max-h-[calc(100vh-75px)]"
>
  <div class="flex items-center justify-between">
    <span
      class="flex items-center border-black border-opacity-[18%] h-[40px] border-[1px] rounded-md dark:border-white"
    >
      <button 
      class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === '7 Days' ? 'bg-[#0BA5E9] text-white' : 'text-black dark:text-white dark:border-white'}`}
      on:click={() => dateRange.set('7 Days')}>7 Days</button
      >
      <button
      class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === '15 Days' ? 'bg-[#0BA5E9] text-white' : 'text-black dark:text-white dark:border-white'}`}
        on:click={() => dateRange.set('15 Days')}>15 Days</button
      >
      <button
      class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === '30 Days' ? 'bg-[#0BA5E9] text-white' : 'text-black dark:text-white dark:border-white'}`}
        on:click={() => dateRange.set('30 Days')}>30 Days</button
      >
    <button
      class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === '12 Months' ? 'bg-[#0BA5E9] text-white' : 'text-black dark:text-white dark:border-white'}`}
        on:click={() => dateRange.set('12 Months')}>12 Months</button
      >
  <Popover.Root openFocus>
    <Popover.Trigger asChild let:builder>
      <Button  builders={[builder]} class={`2xl:py-2 2xl:px-3 py-1 px-2  text-sm hover:bg-[#0BA5E9] hover:text-white ${$dateRange === 'custom' ? 'bg-[#0BA5E9] text-white' : 'text-black dark:text-white bg-transparent dark:border-white'}`}
        >       {customDateLabel}</Button
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
  <div class={`grid grid-cols-8  gap-4 gap-y-10 ${$selectedStore.label === 'All Stores' ? 'h-[1400px] grid-rows-11' : 'h-[1100px] grid-rows-8'} mt-4`}>
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
            <Select.Value placeholder={$selectedStore?.label} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              <Select.Item on:click={() => {selectedStore.set({ value: -1, label: 'All Stores' }); fetchDataStoreWise()}}
                class="px-1"
                value="All Stores"
                label="All Stores">All Stores</Select.Item
              >
              {#if allStores.length > 0}
              {#each fruits as fruit}
                <Select.Item on:click={() => selectedStore.set(fruit)}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
              {/if}
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
        <AddStoreDialog>
          <Button variant="outline" class="flex items-center gap-1 text-xs"
            ><Plus size={14} />Add Store</Button
          >
        </AddStoreDialog>
       
      </span>
      <div class="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
        {#each theftandcamera as data, index}
          <DashboardStoreCard
            storeName={data.name}
            cameraCount={data.camera_count}
            managerName={data.manager}
            activeCount={ parseInt(data.theft_prevented_count)}
            totalCount={parseInt(data.theft_detected_count)}
            bgColor={index % 2 === 0 ? "#F5F5F5" : "white"}
          />
        {/each}
      </div>
    </div>
  {#if $selectedStore.label === 'All Stores'}
    <div
      class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <span>
          <p class="text-[#323232] dark:text-white text-lg font-semibold">Store Busy Hours</p>
          <p class="text-sm font-medium text-[#8C8C8C]">
            Average busy hours
          </p>
        </span>
        <!-- <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={$selectedStore.label} />

          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              <Select.Item on:click={() => selectedStore.set({ value: -1, label: 'All Stores' })}
                class="px-1"
                value="All Stores"
                label="All Stores">All Stores</Select.Item
              >
              {#each fruits as fruit}
                <Select.Item on:click={() => selectedStore.set(fruit)}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root> -->
      </span>
      <div class="h-full w-full">
        {#if busyness.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          <canvas bind:this={chartCanvas}></canvas>
        {/if}
      </div>
    </div>
    {/if}
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
  {#if $selectedStore.label === 'All Stores'}

    <div
      class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">Employee Efficiency</p>
       <!-- <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={$selectedStore.label} />

          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              <Select.Item on:click={() => selectedStore.set({ value: -1, label: 'All Stores' })}
                class="px-1"
                value="All Stores"
                label="All Stores">All Stores</Select.Item
              >
              {#each fruits as fruit}
                <Select.Item on:click={() => selectedStore.set(fruit)}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root> -->
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
    {/if}
  </div>
</section>
