<script lang="ts">
  import {
    Clock,
    Edit,
    ListFilter,
    LucideContact2,
    LucideXOctagon,
    Plus,
    Upload,
    User,
  } from "lucide-svelte";
  import { Button } from "../ui/button";
  import EmployeeTrackingDataTable from "./table/EmployeeTrackingDataTable.svelte";
  import { io } from "socket.io-client";
  import * as Select from "../../components/ui/select";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import Spinner from "../ui/spinner/Spinner.svelte";
  import CreateEmployeeDialog from "../dialogs/CreateEmployeeDialog.svelte";
  import UpdateEmployeeDialog from "../dialogs/UpdateEmployeeDialog.svelte";
  import DeleteEmployeeDialog from "../dialogs/DeleteEmployeeDialog.svelte";
  import type { DateRange } from "bits-ui";
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import * as Popover from "../ui/popover";
  import { Input } from "../ui/input";
  import { createEventDispatcher } from "svelte";

  let chartLoading = true;
  export let allStores;
  export let token;
  export let moksaUserId;
  export let user;

  const stores = allStores
    // ?.filter((store: any) => store.id !== -1)
    ?.map((store: any) => ({
      value: store.id,
      label: store.name,
    }));

  let filterText = "";
  $: filteredFruits = stores.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  const dispatch = createEventDispatcher();

  function handleSelect(fruit) {
    selectedStore.set(fruit);
    dispatch("select", fruit);
  }

  let selectedStore = writable(stores.length > 0 ? stores?.[0].label : null);
  let selectedStoreId = writable(stores.length > 0 ? stores?.[0].value : null);

  function calculateFilledSegments(hours, totalSegments = 36) {
    if (!hours) return 0; // Handle null or undefined time as 0
    const totalMinutes = parseFloat(hours) * 60; // Convert decimal hours to total minutes
    const maxMinutes = 8 * 60; // Assuming 8 hours is the maximum
    return Math.round((totalMinutes / maxMinutes) * totalSegments).toFixed(2);
  }

  function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  function calculateCircumference(radius) {
    return 2 * Math.PI * radius;
  }

  const radius = 40;
  const circumference = calculateCircumference(radius);
  let progress = 0;
  let dashOffset = circumference - (progress / 100) * circumference;

  $: console.log(
    progress,
    "progress",
    $employeeDetails?.data?.[0]?.efficiency_score,
  );

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let efficiencyData = writable([]);
  let employeeData = writable([]);
  let employeeDetails = writable([]);
  let selectedEmployee = writable(null);
  let dateRange = writable("7 Days");
  let value: DateRange | undefined = undefined;
  let startValue: DateValue | undefined = undefined;
  let customDateLabel = "Custom";
  let close = false;

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

  function createChart() {
    if (chartCanvas && !chart) {
      const ctx = chartCanvas.getContext("2d");
      const gradient = ctx.createLinearGradient(400, 0, 0, 0);
      gradient.addColorStop(1, "#5BC4FF");
      gradient.addColorStop(0, "#FF5BEF");
      const gradient2 = ctx.createLinearGradient(400, 0, 0, 0);
      gradient2.addColorStop(1, "#00FEA3");
      gradient2.addColorStop(0, "#007077");

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
        const onlineData2 = [5, 29, 10, 41, 82, 75, 30];

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
                pointBackgroundColor: "white",
                pointBorderColor: "#000065",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: "Offline",
                borderColor: gradient2,
                backgroundColor: gradient2,
                borderWidth: 2,
                data: onlineData2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "white",
                pointBorderColor: "#000065",
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

  let socket: any;

  function setupSocket(storeId) {
    const userID = moksaUserId;
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
      console.log(`connected for ${storeId}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeId);
    });

    socket.on(`employee_efficiency_store_${storeId}`, (data) => {
      console.log(
        `Received live employee efficiency data for store ${storeId}:`,
        data,
      );

      efficiencyData?.update((currentData) => {
        console.log(currentData, "current data");
        const existingEmployeeIndex = currentData?.data?.data?.findIndex(
          (emp) => emp?.employee_id === data?.employee_id,
        );

        console.log(existingEmployeeIndex, "existingEmployeeIndex");

        const storeExists = stores?.some(
          (store) => store?.value === data?.store_id,
        );

        // // // if store doesn't exist and user is not super-admin
        if (user?.role !== "superAdmin" && !storeExists) {
          return { ...currentData };
        }

        if (existingEmployeeIndex !== -1) {
          // Update existing store data
          const updatedData = [...currentData?.data?.data];
          updatedData[existingEmployeeIndex] = {
            ...updatedData[existingEmployeeIndex],
            ...data,
          };
          return {
            data: {
              data: updatedData,
              column: currentData?.data?.column,
              total: currentData?.data?.total,
            },
          };
        } else {
          // add new employee data
          const newEmployeeData = {
            ...data,
          };

          let updatedData = [...currentData?.data?.data];
          updatedData.push(newEmployeeData);
          return {
            data: {
              data: updatedData,
              column: currentData?.data?.column,
              total: currentData?.data?.total,
            },
          };
        }
        // else {
        //   // Add new store data
        //   const newEmployeeData = {
        //     employee_id: data?.employee_id,
        //     employee:
        //       data.store_name ||
        //       allStores.find((store) => store.id === data.store_id)?.name ||
        //       data.store_id, // Assuming the socket message includes store_name
        //     noofcustomers: data.noofcustomers.toString(),
        //     going_out_count: data.noofcustomersgoingout.toString(),
        //     busyhour: data.busyhour,
        //     predictedmean: 0,
        //     predicted_percentage: 0,
        //     total_count: data.going_in.toString(),
        //   };
        //   return { ...currentData, data: [...currentData.data, newStoreData] };
        // }
      });

      console.log($efficiencyData, "efficiencyData in socket");
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  }

  $: console.log($efficiencyData, "efficiencyData");

  let loading = false;

  onMount(async () => {
    chartLoading = false;
    // console.log(stores[0])
    setTimeout(() => {
      createChart();
    }, 100);
    try {
      loading = true;
      const [employeeResponse, efficiencyResponse] = await Promise.all([
        fetch("/api/employee/getByStoreId", {
          method: "POST",
          body: JSON.stringify({ storeId: stores[0].value }),
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/employee/getEfficiencyByStoreId", {
          method: "POST",
          body: JSON.stringify({ storeId: stores[0].value }),
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      employeeData.set(await employeeResponse.json());
      efficiencyData.set(await efficiencyResponse.json());

      if ($employeeData.data.length > 0) {
        await getEmployeeDetails($employeeData.data[0].id);
      } else {
        employeeDetails.set(null);
      }
      loading = false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  $: if (
    $dateRange.toLowerCase() === "custom" &&
    (value?.start || value?.end)
  ) {
    getCustomEfficiencyData();
  }
  // }

  async function getCustomEfficiencyData() {
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
      loading = true;
      const response = await fetch(
        `https://api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${$selectedStoreId}/${start}/1/100/${end}`,
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
        `recieved efficiency data for ${$selectedStoreId}, ${$dateRange}`,
        data,
      );
      // efficiencyData.set(data?.data?.data === undefined ? [] : data?.data?.data);
      efficiencyData.set(data?.data?.data === undefined ? [] : data);
      await getCustomEmployeeDetails(
        data?.data?.data?.[0]?.employee_id,
        start,
        end,
      );
      loading = false;
    } catch (error) {
      console.log(error);
    }
  }

  async function getEfficiencyDataByTime() {
    console.log($selectedStoreId);
    console.log("effdatabytunecallera");
    customDateLabel = "Custom";
    value = undefined;
    const today = new Date();
    let startDate = new Date(today);

    let isLive = false;

    switch ($dateRange) {
      case "live":
        isLive = true;
        break;
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

    try {
      loading = true;
      const response = await fetch(
        `https://api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${$selectedStoreId}/${formatDate(startDate)}/1/100/${formatDate(today)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            live: isLive,
          },
        },
      );
      const data = await response.json();
      // console.log(
      //   `recieved efficiency data for ${$selectedStoreId}, ${$dateRange}`,
      //   data,
      // );
      // efficiencyData.set(data?.data?.data === undefined ? [] : data?.data?.data);
      efficiencyData.set(data?.data?.data === undefined ? [] : data);
      // console.log(data?.data?.data?.[0]?.employee_id);
      // console.log($employeeData);
      // console.log($selectedEmployee);
      await getEmployeeDetails(
        $selectedEmployee !== null
          ? $selectedEmployee.id
          : $employeeData?.data?.[0]?.id,
      );
      loading = false;
    } catch (error) {
      console.log(error);
    }
  }

  $: {
    if ($dateRange.toLowerCase() !== "custom") {
      console.log("getting efficiency data by time", $dateRange);
      getEfficiencyDataByTime();
    }
  }

  async function getbystoreID() {
    employeeData.set([]);
    const response = await fetch("/api/employee/getByStoreId", {
      method: "POST",
      body: JSON.stringify({ storeId: $selectedStoreId }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    // console.log(data);
    employeeData.set(data);
    return data;
  }

  async function getEmployeeDetails(id: number) {
    employeeDetails.set([]);
    const today = new Date();
    let startDate = new Date(today);
    // console.log($dateRange);
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

    progress = 0;
    dashOffset = circumference - (progress / 100) * circumference;
    if (!!id) {
      try {
        const response = await fetch(
          `https://api.moksa.ai/employeeEfficiency/getEmployeeEfficiencyByEmpid/${id}/${formatDate(startDate)}/${formatDate(today)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        console.log("employee-details", data);
        employeeDetails.set(data);
        progress = data?.data[0]?.efficiency_score;
        dashOffset = circumference - (progress / 100) * circumference;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function getCustomEmployeeDetails(
    id: number,
    start: string,
    end: string,
  ) {
    employeeDetails.set([]);
    progress = 0;
    dashOffset = circumference - (progress / 100) * circumference;

    console.log(id, "id");

    if (!!id) {
      try {
        const response = await fetch(
          `https://api.moksa.ai/employeeEfficiency/getEmployeeEfficiencyByEmpid/${id}/${start}/${end}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();
        console.log("employee-details", data);
        employeeDetails.set(data);
        progress = data.data[0].efficiency_score;
        dashOffset = circumference - (progress / 100) * circumference;
      } catch (error) {
        console.log(error);
      }
    }

    // }
  }

  $: {
    if ($selectedStoreId !== undefined && $dateRange.toLowerCase() === "live") {
      setupSocket($selectedStoreId);
    }
  }
</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] hide-scrollbar overflow-y-auto"
>
  <!-- Date range section -->
  <div class="flex items-center justify-start">
    <span
      class="flex items-center border-black h-[40px] border-opacity-[18%] border-[1px] rounded-md dark:border-white"
    >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "live" ? "rounded-l-md bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
        on:click={() => dateRange.set("live")}>Live</button
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
      <Popover.Root openFocus bind:open={close}>
        <Popover.Trigger asChild let:builder>
          <Button
            on:click={() => (value = undefined)}
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
  </div>

  <!-- Employee Tracking Table -->
  <div class="grid grid-cols-8 grid-rows-4 gap-4 mt-4">
    <div
      class="col-span-8 row-span-4 h-[400px] border rounded-md rounded-t-xl bg-white dark:bg-transparent dark:border-white/[.7] flex flex-col gap-3 flex-shrink-0"
    >
      <span
        class="flex bg-[#050F40] h-[60px] w-full rounded-t-xl px-4 flex-shrink-0 items-center justify-between"
      >
        <p class="text-white flex items-center gap-2 text-xl font-bold">
          Employee Tracking
          {#if $dateRange.toLowerCase() === "live"}
            <span class="text-xs text-white bg-pink-500 rounded-md p-1">
              Live
            </span>
          {/if}
        </p>
        <!-- Store Selector -->
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-auto min-w-[150px] bg-[#3D81FC] text-white border-none text-xs px-1 rounded-lg"
          >
            <Select.Value
              placeholder={stores.length > 0 ? stores?.[0]?.label : "No Stores"}
            />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              <!-- {#if stores.length > 0}
                {#each stores as store}
                  <Select.Item
                    class="px-1"
                    on:click={async () => {
                      selectedStore.set(store.label);
                      selectedStoreId.set(store.value);
                      console.log(store.value)
                      const emp = await getbystoreID(store.value);
                      console.log(emp)
                      // await getEmployeeDetails(emp.data[0].id);
                      await getEfficiencyDataByTime();
                    }}
                    value={store.value}
                    label={store.label}>{store.label}</Select.Item
                  >
                {/each}
              {:else}
                <Select.Item class="px-1" label="No Stores Found"
                  >No Stores Found</Select.Item
                >
              {/if} -->
              <div class="p-2">
                <Input
                  type="text"
                  placeholder="Search stores..."
                  bind:value={filterText}
                  class="mb-2"
                />
              </div>
              {#if filteredFruits.length > 0}
                {#each filteredFruits as store}
                  <Select.Item
                    on:click={async () => {
                      selectedStore.set(store.label);
                      selectedStoreId.set(store.value);
                      console.log(store.value);
                      const emp = await getbystoreID(store.value);
                      console.log(emp);
                      // await getEmployeeDetails(emp.data[0].id);
                      await getEfficiencyDataByTime();
                    }}
                    class="px-1"
                    value={store.value}
                    label={store.label}>{store.label}</Select.Item
                  >
                {/each}
              {:else}
                <Select.Item disabled>No matching stores</Select.Item>
              {/if}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </span>

      <div
        class="h-full w-full max-h-[400px] overflow-y-auto hide-scrollbar overflow-x-clip"
      >
        {#if loading}
          <span class="flex items-center justify-center h-full w-full">
            <Spinner />
          </span>
        {:else if $efficiencyData && $efficiencyData?.data && $efficiencyData?.data?.data.length > 0}
          <EmployeeTrackingDataTable {efficiencyData} {selectedStore} />
        {:else}
          <span class="flex items-center justify-center h-full w-full">
            <p class="text-black">No data</p>
          </span>
        {/if}
      </div>
    </div>

    <!-- Employee Details Card-->
    <div
      class=" col-span-3 row-span-4 border rounded-md p-2 flex flex-col flex-shrink-0 h-[550px] dark:border-white/[.7]"
    >
      <span class="flex flex-col gap-3">
        <p class="text-[#323232] text-lg font-semibold dark:text-white">
          Employee Details
        </p>

        <!-- Employees Selector -->
        <span class="flex items-center justify-between">
          <Select.Root portal={null}>
            <Select.Trigger
              class="w-[250px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent "
            >
              <Select.Value
                placeholder={$employeeData?.data?.length > 0
                  ? $employeeData?.data?.[0]?.first_name +
                    " " +
                    $employeeData?.data?.[0]?.last_name
                  : "No Employees Found"}
              />
            </Select.Trigger>
            <Select.Content>
              <Select.Group class="h-72 max-h-full overflow-y-auto">
                {#if $employeeData && $employeeData.data && $employeeData?.data?.length > 0}
                  {#each $employeeData?.data as employee}
                    <Select.Item
                      on:click={async () => {
                        console.log(employee);
                        await getEmployeeDetails(employee.id);
                        selectedEmployee.set(employee);
                      }}
                      class="px-1"
                      value={employee.id}
                      label={employee.name}
                      >{employee.first_name} {employee.last_name}</Select.Item
                    >
                  {/each}
                {:else}
                  <Select.Item class="px-1" value="0" label="No Employees Found"
                    >No Employees Found</Select.Item
                  >
                {/if}
              </Select.Group>
            </Select.Content>
            <Select.Input name="favoriteFruit" />
          </Select.Root>

          <!-- Add Employee Dialog -->
          <span class="flex items-center gap-1">
            <CreateEmployeeDialog
              {employeeData}
              {token}
              storeId={$selectedStoreId}
            >
              <Button
                class="flex items-center gap-1 text-sm bg-[#389E0D] text-white hover:text-[#389E0D] hover:bg-white"
                ><Plus size={20} /> Add</Button
              >
            </CreateEmployeeDialog>

            <!-- Update Employee Dialog -->
            <UpdateEmployeeDialog
              {token}
              firstName={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.first_name
                : $selectedEmployee?.first_name}
              lastName={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.last_name
                : $selectedEmployee?.last_name}
              role={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.role
                : $selectedEmployee?.role}
              id={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.id
                : $selectedEmployee?.id}
              storeId={$selectedStoreId}
              {employeeData}
            >
              <Button
                class="text-sm bg-[#FAAD14] text-white hover:text-[#FAAD14] hover:bg-white"
                ><Edit size={20} /></Button
              >
            </UpdateEmployeeDialog>
            <DeleteEmployeeDialog
              {employeeData}
              empId={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.id
                : $selectedEmployee?.id}
              {token}
              firstName={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.first_name
                : $selectedEmployee?.first_name}
              lastName={$selectedEmployee === null
                ? $employeeData?.data?.[0]?.last_name
                : $selectedEmployee?.last_name}
            >
              <Button
                class="text-sm bg-[#CF1322] text-white hover:text-[#CF1322] hover:bg-white"
                ><LucideXOctagon size={20} /></Button
              >
            </DeleteEmployeeDialog>
          </span>
        </span>

        {#if $employeeDetails?.data?.length > 0 && $employeeData !== null}
          <span class="flex items-center gap-3 my-2">
            <User size={100} />
            <span class="flex flex-col gap-4 w-full">
              <span class="items-center gap-2 flex">
                <LucideContact2 size={20} class="text-[#000065]" />
                <p class="text-sm text-[#727272]">Employee Id</p>
                <p class="ml-auto text-sm font-semibold">
                  {$employeeDetails?.data?.[0]?.emp_id}
                </p>
              </span>
              <span class="flex items-center gap-2">
                <Clock size={20} class="text-[#000065]" />
                <p class="text-sm text-[#727272]">
                  No.of hours worked everyday
                </p>
                <span class="ml-auto text-sm font-semibold"
                  >{$employeeDetails?.data?.[0]?.hours_worked === null
                    ? 0
                    : $employeeDetails?.data?.[0]?.hours_worked}</span
                >
              </span>
            </span>
          </span>
        {:else}
          <div class="mx-auto my-20">
            <Spinner />
          </div>
        {/if}
      </span>
      {#if $employeeDetails?.data?.length > 0 && $employeeData !== null}
        <span class="flex flex-col gap-3 mt-2">
          {#each [{ label: "Total Hours With Customers", hours: $employeeDetails?.data?.[0]?.total_customer, color1: "#02A7FD", color2: "#141C64" }, { label: "Total Hours on Mobile", hours: $employeeDetails?.data?.[0]?.total_mobile, color1: "#00FEA3", color2: "#007077" }, { label: "Total Hours Sitting Idle", hours: $employeeDetails?.data?.[0]?.total_idle, color1: "#FFB156", color2: "#FF007A" }, { label: "Total Hours With Filling Shelves", hours: $employeeDetails?.data?.[0]?.total_filling_shelves, color1: "#C8C303", color2: "#597802" }] as activity}
            <div class="my-2">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-[#323232]">{activity.label}</span>
                <!-- {#if activity.label === "Total Hours on Mobile"} -->
                <span class="font-semibold"
                  >{activity.hours === null ? 0 : activity.hours} Hrs</span
                >
                <!-- {/if} -->
              </div>
              <div class="w-full h-5 rounded-sm flex gap-2">
                <!-- {#if activity.label === "Total Hours on Mobile"} -->
                {#each Array(36) as _, i}
                  <span
                    class={`w-[3%] h-full rounded-lg ${i < calculateFilledSegments(activity.hours) ? "" : "bg-gray-200"}`}
                    style={i < calculateFilledSegments(activity.hours)
                      ? `background-color: ${interpolateColor(activity.color1, activity.color2, i / (calculateFilledSegments(activity.hours) - 1))}`
                      : ""}
                  />
                {/each}
                <!-- {:else}
                  <p class="text-primary font-semibold">Coming Soon</p>
                {/if} -->
              </div>
            </div>
          {/each}
        </span>
      {/if}
    </div>

    <div
      class="col-span-5 row-span-2 border rounded-md p-2 flex items-center justify-between flex-shrink-0 h-[200px] dark:border-white/[.7]"
    >
      <span class="flex flex-col w-1/2 justify-start items-start h-full">
        <p
          class="text-[#323232] text-lg flex items-center gap-2 font-semibold dark:text-white"
        >
          Employee Efficiency Score
        </p>
        <p
          class="flex items-center gap-3 mt-4 mb-2 text-[#4D6674] dark:text-white/[.8]"
        >
          Based on Time with Customers <span class="text-[#0D2846] font-medium"
            >{$employeeDetails?.data?.[0]?.total_customer === undefined ||
            $employeeDetails?.data?.[0]?.total_customer === null
              ? 0
              : $employeeDetails?.data?.[0]?.total_customer}</span
          >
          <svg
            width="37"
            height="21"
            viewBox="0 0 37 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.14694 13.0333C4.71641 18.1 1.95293 19.7889 1 20H36.7347V1C33.1612 1.31667 32.8039 4.16667 29.2304 11.45C26.3716 17.2767 22.3217 15.7778 20.6541 14.3C17.9144 11.7667 11.5775 7.96667 8.14694 13.0333Z"
              fill="url(#paint0_linear_193_4188)"
            />
            <path
              d="M1 20C1.95293 19.7889 4.71641 18.1 8.14694 13.0333C11.5775 7.96667 17.9144 11.7667 20.6541 14.3C22.3217 15.7778 26.3716 17.2767 29.2304 11.45C32.8039 4.16667 33.1612 1.31667 36.7347 1"
              stroke="#02A7FD"
            />
            <defs>
              <linearGradient
                id="paint0_linear_193_4188"
                x1="18.8673"
                y1="3.03571"
                x2="19.0678"
                y2="19.7745"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#02A7FD" stop-opacity="0.3" />
                <stop offset="1" stop-color="#00A8FF" stop-opacity="0.03" />
              </linearGradient>
            </defs>
          </svg>
        </p>
        <p class="flex items-center gap-3 mt-4 mb-2 text-[#4D6674]">
          Based on Mobile <span class="text-[#0D2846] font-medium"
            >{$employeeDetails?.data?.[0]?.total_mobile === undefined ||
            $employeeDetails?.data?.[0]?.total_mobile === null
              ? 0
              : $employeeDetails?.data?.[0]?.total_mobile}</span
          >
          <svg
            width="37"
            height="21"
            viewBox="0 0 37 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.14694 13.0333C4.71641 18.1 1.95293 19.7889 1 20H36.7347V1C33.1612 1.31667 32.8039 4.16667 29.2304 11.45C26.3716 17.2767 22.3217 15.7778 20.6541 14.3C17.9144 11.7667 11.5775 7.96667 8.14694 13.0333Z"
              fill="url(#paint0_linear_193_4188)"
            />
            <path
              d="M1 20C1.95293 19.7889 4.71641 18.1 8.14694 13.0333C11.5775 7.96667 17.9144 11.7667 20.6541 14.3C22.3217 15.7778 26.3716 17.2767 29.2304 11.45C32.8039 4.16667 33.1612 1.31667 36.7347 1"
              stroke="#02A7FD"
            />
            <defs>
              <linearGradient
                id="paint0_linear_193_4188"
                x1="18.8673"
                y1="3.03571"
                x2="19.0678"
                y2="19.7745"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#02A7FD" stop-opacity="0.3" />
                <stop offset="1" stop-color="#00A8FF" stop-opacity="0.03" />
              </linearGradient>
            </defs>
          </svg>
        </p>
        <p class="flex items-center gap-3 mt-4 mb-2 text-[#4D6674]">
          Based on Sitting Idle <span class="text-[#0D2846] font-medium"
            >{$employeeDetails?.data?.[0]?.total_idle === undefined ||
            $employeeDetails?.data?.[0]?.total_idle === null
              ? 0
              : $employeeDetails?.data?.[0]?.total_idle}</span
          >
          <svg
            width="37"
            height="21"
            viewBox="0 0 37 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.14694 13.0333C4.71641 18.1 1.95293 19.7889 1 20H36.7347V1C33.1612 1.31667 32.8039 4.16667 29.2304 11.45C26.3716 17.2767 22.3217 15.7778 20.6541 14.3C17.9144 11.7667 11.5775 7.96667 8.14694 13.0333Z"
              fill="url(#paint0_linear_193_4188)"
            />
            <path
              d="M1 20C1.95293 19.7889 4.71641 18.1 8.14694 13.0333C11.5775 7.96667 17.9144 11.7667 20.6541 14.3C22.3217 15.7778 26.3716 17.2767 29.2304 11.45C32.8039 4.16667 33.1612 1.31667 36.7347 1"
              stroke="#02A7FD"
            />
            <defs>
              <linearGradient
                id="paint0_linear_193_4188"
                x1="18.8673"
                y1="3.03571"
                x2="19.0678"
                y2="19.7745"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#02A7FD" stop-opacity="0.3" />
                <stop offset="1" stop-color="#00A8FF" stop-opacity="0.03" />
              </linearGradient>
            </defs>
          </svg>
        </p>
      </span>
      <span class="h-full w-1/2 flex items-center justify-center">
        <div class="relative w-48 h-48">
          <svg class="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient
                id="blueGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#0266FD" />
                <stop offset="100%" stop-color="#02A7FD" />
              </linearGradient>
            </defs>
            <circle
              class="text-gray-200 stroke-current"
              stroke-width="10"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            ></circle>
            <circle
              class="progress-ring_circle"
              stroke="url(#blueGradient)"
              stroke-width="10"
              stroke-dasharray={circumference}
              stroke-linecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke-dashoffset={dashOffset}
            ></circle>
          </svg>
          <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <span class="text-3xl font-bold"
              >{$employeeDetails?.data?.[0]?.efficiency_score === undefined ||
              $employeeDetails?.data?.[0]?.efficiency_score === null
                ? 0
                : $employeeDetails?.data?.[0]?.efficiency_score}%</span
            >
            <p class="text-sm text-gray-500">Efficiency</p>
          </div>
        </div>
      </span>
    </div>

    <div
      class="col-span-5 row-span-2 border rounded-md p-2 flex flex-col flex-shrink-0 h-[334px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p
          class="text-[#323232] text-lg flex items-center gap-2 font-semibold dark:text-white"
        >
          Employee Efficiency Management
        </p>
      </span>
      <span class="h-full w-full">
        <!-- <canvas bind:this={chartCanvas}></canvas> -->
        <p
          class="text-primary font-semibold w-full h-full flex items-center justify-center"
        >
          Coming Soon
        </p>
      </span>
    </div>
  </div>
</section>

<style>
  .progress-ring_circle {
    transition: stroke-dashoffset 0.35s;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
</style>
