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
  import { onMount } from "svelte";
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

  export let allStores;
  export let token;

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let chartLoading: boolean = true;
  let storeData: any = writable([]);

  let livePeopleCount = {};
  const userID = 8;
  const storeID = 31;
  // const token = Cookies.get('moksa-token');
  // const pbToken = Cookies.get('pb_auth');
  $: console.log(allStores);

  onMount(() => {
    //  console.log(pbToken)
    // console.log(token)
    let socket = io("https://dev.api.moksa.ai", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });
    console.log(userID);

    socket.on("error", (err) => {
      console.log("error", err);
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    function onConnect() {
      console.log("connected");
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeID);
    }

    socket.on(`people_count_store_${storeID}`, (data) => {
      console.log(`Received live people count for store ${storeID}:`, data);
      livePeopleCount[storeID] = data;
      livePeopleCount = { ...livePeopleCount }; // Trigger reactivity
    });

    function onDisconnect() {
      console.log("disconnected");
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.close();
    };
  });

  onMount(async () => {
    if (allStores.length > 0) {
      const response = await fetch(
        `https://dev.api.moksa.ai/people/getPeopleCountLive/${allStores?.[0]?.id}`,
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
      // getWeekData(allStores?.[0]?.id)
    }
  });

  async function getWeekData(storeId: number) {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0];
    const weekData = await fetch(
      `https://dev.api.moksa.ai/people/getPeopleCount/${storeId}/${weekAgo}/${today}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      },
    );
    const d = await weekData.json();
    console.log(d);
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

  onMount(async () => {
    chartLoading = false;
    setTimeout(() => {
      createChart();
    }, 100);

    const response = await fetch(`/api/employee/getpeopleCount`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ storeId: allStores }),
    });
    const data = await response.json();
    console.log(data);
    const newArray = data
      .filter((item: any) => item?.data?.data.length > 0)
      .map((item: any) => {
        const storeData = item.data.data[0];
        return {
          busyhour: storeData.busyhour,
          noofcustomers: storeData.noofcustomers,
          store: storeData.store,
        };
      });
    // console.log(newArray);
    storeData.set(newArray);
  });

  $: console.log($storeData);
</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar"
>
  <div class="flex items-center justify-between">
    <span
      class="flex items-center border-black border-opacity-[18%] border-[1px] rounded-md dark:border-white"
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
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 text-black text-sm dark:text-white dark:border-white"
        >Custom</button
      >
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
        <p class="text-white text-xl font-bold">3:00 - 5:00</p>
        <p class="text-sm font-semibold text-white">peak hours</p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#FFB156] to-[#FF007A] p-2 flex items-center gap-3"
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
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#C8C303] to-[#597802] p-2 flex items-center gap-3"
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
      class="col-span-5 row-span-4 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7]"
    >
      <span
        class="rounded-t-xl w-full h-[50px] bg-[#050F40] flex items-center justify-between px-4"
      >
        <p class="text-white text-lg font-semibold flex items-center gap-2">
          All Stores
          <span class="text-xs text-white bg-pink-500 rounded-md p-1">
            Live
          </span>
        </p>
      </span>
      <!-- <div class="h-full w-full">
        {#if $storeData.length > 0}
        <PeopleCountDataTable {storeData}/>
        {:else}
        <p>No data</p>
        {/if}
      </div> -->
    </div>
    <div
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
    </div>
    <div
      class="col-span-5 row-span-4 border rounded-md p-2 flex flex-col dark:border-white/[.7]"
    >
      <div class="h-full w-full">
        {#if $storeData.length > 0}
          <PeopleCountDataTable {storeData} />
        {:else}
          <span
            class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4"
          >
            <p class=" text-xl font-semibold flex items-center gap-2">
              All Stores
            </p>
          </span>
          <p>No data</p>
        {/if}
      </div>
    </div>
  </div>
</section>
