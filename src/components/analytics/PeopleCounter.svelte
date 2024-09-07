<script lang="ts">
  import PeopleCountDataTable from "./table/PeopleCountDataTable.svelte";
  import {
    ChevronLeft,
    Clock,
    ListFilter,
    Store,
    Upload,
    Users,
  } from "lucide-svelte";
  import { Button } from "../ui/button";
  import * as Select from "@/components/ui/select";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import { writable } from "svelte/store";
  import LivePeopleCountDataTable from "./table/LivePeopleCountDataTable.svelte";

  export let allStores;
  export let token;
  export let usersData;
  export let curruser

  // $:console.log(usersData)
  // $:console.log(curruser)

  $: console.log($selectedStore)


  $: matchingUser = usersData?.data?.data?.find((user: any) => user.lensId === curruser.id);

  $: console.log("Matching user:", matchingUser);

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let chartLoading: boolean = true;
  let storeData: any = writable([]);
  let liveStoreData: any = writable([]);
let liveData = writable([]);

  let livePeopleCount = {};
  const userID = 8;
    const fruits = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  let selectedStore= writable({ value: allStores?.[0]?.id, label: allStores?.[0]?.name })

    let socket: any;

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
      console.log(`connected for ${$selectedStore.value}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", $selectedStore.value);
    });

    socket.on(`people_count_store_${$selectedStore.value}`, (data) => {
      console.log(`Received live people count for store ${$selectedStore.value}:`, data);
      liveData.update(currentData => {
        return [data, ...currentData].slice(0, 100);
      });
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
      liveData.set([])
    });
  }

  // $:console.log($liveData)

  $: {
    if ($selectedStore.value !== undefined) {
      getWeekData($selectedStore.value);
      setupSocket();
    }
  }

  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });


  onMount(async () => {
    if (allStores.length > 0) {
      const response = await fetch(
        `https://api.moksa.ai/people/getPeopleCountLive/${$selectedStore.value}/30/1/100`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        },
      );
      const data = await response.json();
      console.log(data);
    }
  });

  async function getWeekData(storeId: number) {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0];
    const weekData = await fetch(
      `https://api.moksa.ai/people/getPeopleCount/${storeId}/${weekAgo}/${today}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      },
    );
    const d = await weekData.json();
    console.log('week data people count',d);
    if(d.status === 200) {
      storeData.set(d.data.data)
    }
  }

  function createChart() {
    if (chartCanvas && !chart) {
      const ctx = chartCanvas.getContext("2d");
      if (!ctx) return;

      Chart.register(
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
      );

      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const onlineData = [65, 59, 80, 81, 56, 55, 40];
      const offlineData = [15, 29, 30, 41, 56, 65, 80];

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Online",
              borderColor: "#F86624",
              borderWidth: 2,
              data: onlineData,
              fill: true,
              tension: 0,
              pointBackgroundColor: "white",
              pointBorderColor: "#F86624",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Offline",
              borderColor: "#883DCF",
              borderWidth: 2,
              data: offlineData,
              fill: true,
              tension: 0,
              pointBackgroundColor: "white",
              pointBorderColor: "#883DCF",
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
              grid: { color: "rgba(0,0,0,.05)" },
              ticks: { maxRotation: 0 },
            },
            y: {
              display: true,
              title: { display: false, text: "Activity Percentage" },
              grid: { display: false },
              beginAtZero: true,
              suggestedMax: 100,
              ticks: { stepSize: 20, callback: (value) => value + "%" },
            },
          },
          plugins: {
            legend: { display: true, position: "top" },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`,
              },
            },
          },
        },
      });
    }
  }

//   async function getLiveData(storeId: number) {
// await fetch(`https://api.moksa.ai/people/getPeopleCountLive/${storeId}`, {
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   },
//   method: "GET",
// }).then(res => res.json()).then(data => {
//   console.log(data)
//   liveStoreData.set(data.data)
// }).catch(err => {
//   console.log(err)
// })
//   }

let busyHours = 'N/A'

$: console.log('storesdata',$storeData)
// $: console.log(allStores)

  onMount(async () => {
    chartLoading = false;
    setTimeout(() => {
      createChart();
    }, 100);
  });

</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar"
>
  <div class="flex items-center justify-between">
     <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={fruits.length> 0 ? $selectedStore.label: 'No Stores'} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              <!-- <Select.Item on:click={() => selectedStore.set({ value: -1, label: 'All Stores' })}
                class="px-1"
                value="All Stores"
                label="All Stores">All Stores</Select.Item
              > -->
              {#if fruits.length > 0}
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
  <div class="grid grid-cols-8 grid-rows-9 gap-4 mt-4">
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#00FEA3] to-[#007077] p-2 flex items-center gap-3"
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
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#02A7FD] to-[#141C64] p-2 flex items-center gap-3"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <Clock size={40} />
      </span>
      <span>
        <p class="text-white text-xl font-bold">{$storeData?.[0]?.busyhour === undefined || $storeData?.[0].busyhour === null ? 'N/A' : $storeData?.[0]?.busyhour}</p>
        <p class="text-sm font-semibold text-white">peak hours</p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#FFB156] to-[#FF007A] p-2 flex items-center gap-3 invisible"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <Users size={40} />
      </span>
      <span>
        <p class="text-white text-xl font-bold">64.32%</p>
        <p class="text-sm font-semibold text-white">
          recommended no. of employees
        </p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#C8C303] to-[#597802] p-2 flex items-center gap-3 invisible"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <Store size={40} />
      </span>
      <span>
        <p class="text-white text-xl font-bold">64.32%</p>
        <p class="text-sm font-semibold text-white">total thefts detected</p>
      </span>
    </div>

    <div
      class="col-span-8 row-span-4 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7]"
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
         {#if $liveData.length > 0}
    <LivePeopleCountDataTable liveData={$liveData} selectedStore={$selectedStore}/>
  {:else}
    <p class="flex items-center justify-center py-4">No live data available</p>
  {/if}
      </div>
    </div>
    <!-- <div
      class="col-span-3 row-span-4 border rounded-md p-2 flex flex-col dark:border-white/[.7]"
    >
      <p
        class="text-center text-[#000065] text-2xl font-semibold my-2 dark:text-white"
      >
        All Stores
      </p>
      <p class="text-[#656565] text-lg text-center my-2">Non Busy Hours</p>
      <span class="flex w-full h-full">
        <canvas bind:this={chartCanvas}></canvas>
      </span>
    </div> -->
    <div
      class="col-span-8 row-span-4 border rounded-md p-2 flex flex-col dark:border-white/[.7]"
    >
      <div class="h-full w-full">
        {#if $storeData.length > 0}
          <PeopleCountDataTable {storeData} />
        {:else}
          <span
            class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4"
          >
            <p class=" text-xl font-semibold flex items-center gap-2">
              {$selectedStore.label}
            </p>
          </span>
          <p class="flex items-center justify-center ">No data</p>
        {/if}
      </div>
    </div>
  </div>
</section>
