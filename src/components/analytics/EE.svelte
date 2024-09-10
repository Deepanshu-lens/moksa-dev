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
  let chartLoading = true;
  export let allStores;
  export let token;

  const stores = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

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
  const progress = 70; // 70% progress
  const dashOffset = circumference - (progress / 100) * circumference;

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let efficiencyData = writable([]);
  let employeeData = writable([]);
  let employeeDetails = writable([]);
  let selectedEmployee = writable(null);

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

  async function updateEmployee() {}

  async function deleteEmployee() {}
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

  async function getbystoreID() {
    loading = true;
    const response = await fetch("/api/employee/getByStoreId", {
      method: "POST",
      body: JSON.stringify({ storeId: stores[0].value }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    console.log(data);
    employeeData.set(data);
    loading = false;
  }

  async function getEmployeeDetails(id: number) {
    // console.log(id)
    const response = await fetch("/api/employee/getByEmpId", {
      method: "POST",
      body: JSON.stringify({ id: id }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    console.log(data);
    employeeDetails.set(data);
  }

  $: console.log("empdetails", $employeeDetails);
  $: console.log("empd", $employeeData);
</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] hide-scrollbar overflow-y-auto"
>
  <!-- <div class="flex items-center justify-between">
    <span
      class="flex items-center border-black border-opacity-[18%] border-[1px] rounded-md"
    >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm"
        >1 Hour</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm"
        >24 Hours</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm"
        >7 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm"
        >30 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm"
        >12 Months</button
      >
      <button class="2xl:py-2 2xl:px-3 py-1 px-2 text-black text-sm"
        >Custom</button
      >
    </span>
    <span class="flex items-center gap-3">
      <Button variant="outline" class="flex items-center gap-1"
        ><ListFilter size={18} /> Filters</Button
      >
      <Button class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      >
    </span>
  </div> -->
  <div class="grid grid-cols-8 grid-rows-4 gap-4 mt-4">
    <div
      class="col-span-8 row-span-4 h-[400px] border rounded-md rounded-t-xl bg-white dark:bg-transparent dark:border-white/[.7] flex flex-col gap-3 flex-shrink-0"
    >
      <span
        class="flex bg-[#050F40] h-[60px] w-full rounded-t-xl px-4 flex-shrink-0 items-center justify-between"
      >
        <p class="text-white flex items-center gap-2 text-xl font-bold">
          Employee Tracking
          <!-- <span
            class="text-xs text-white bg-pink-500 rounded-md p-1">Live</span
          > -->
        </p>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-auto min-w-[100px] bg-[#3D81FC] text-white border-none text-xs px-1 rounded-lg"
          >
            <Select.Value
              placeholder={stores.length > 0 ? stores?.[0]?.label : "No Stores"}
            />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              {#if stores.length > 0}
                {#each stores as store}
                  <Select.Item
                    class="px-1"
                    on:click={async () => {
                      selectedStore.set(store.label);
                      selectedStoreId.set(store.value);
                      await getbystoreID(store.value);
                    }}
                    value={store.value}
                    label={store.label}>{store.label}</Select.Item
                  >
                {/each}
              {:else}
                <Select.Item class="px-1" label="No Stores Found"
                  >No Stores Found</Select.Item
                >
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
        {:else if $efficiencyData && $efficiencyData.data && $efficiencyData?.data?.data?.length > 0}
          <EmployeeTrackingDataTable
            d={$efficiencyData?.data?.data}
            selectedStore={$selectedStore}
          />
        {:else}
          <span class="flex items-center justify-center h-full w-full">
            <p class="text-black">No data</p>
          </span>
        {/if}
      </div>
    </div>

    <div
      class=" col-span-3 row-span-4 border rounded-md p-2 flex flex-col flex-shrink-0 h-[550px] dark:border-white/[.7]"
    >
      <span class="flex flex-col gap-3">
        <p class="text-[#323232] text-lg font-semibold dark:text-white">
          Employee Details
        </p>
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
              <Select.Group>
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
              employeeData={employeeData}
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
        {/if}
      </span>
      {#if $employeeDetails?.data?.length > 0 && $employeeData !== null}
        <span class="flex flex-col gap-3 mt-2">
          {#each [{ label: "Total Hours With Customers", hours: $employeeDetails?.data?.[0]?.customer, color1: "#02A7FD", color2: "#141C64" }, { label: "Total Hours on Mobile", hours: $employeeDetails?.data?.[0]?.mobile, color1: "#00FEA3", color2: "#007077" }, { label: "Total Hours Sitting Idle", hours: $employeeDetails?.data?.[0]?.idle, color1: "#FFB156", color2: "#FF007A" }] as activity}
         
            <div class="my-2">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-[#323232]">{activity.label}</span>
                <span class="font-semibold"
                  >{activity.hours === null
                    ? 0
                    : Number(activity.hours).toFixed(2)} Hrs</span
                >
              </div>
              <div class="w-full h-5 rounded-sm flex gap-2">
                {#each Array(36) as _, i}
                  <span
                    class={`w-[3%] h-full rounded-lg ${i < calculateFilledSegments(activity.hours) ? "" : "bg-gray-200"}`}
                    style={i < calculateFilledSegments(activity.hours)
                      ? `background-color: ${interpolateColor(activity.color1, activity.color2, i / (calculateFilledSegments(activity.hours) - 1))}`
                      : ""}
                  />
                {/each}
              </div>
            </div>
          {/each}
        </span>
      {:else}
        <p
          class="text-[#323232] text-lg flex items-center gap-2 font-semibold dark:text-white"
        >
          No employee selected
        </p>
      {/if}
    </div>

    <div
      class="col-span-5 row-span-2 border rounded-md p-2 flex items-center justify-between flex-shrink-0 h-[200px] dark:border-white/[.7]"
    >
      <span class="flex flex-col w-1/2">
        <p
          class="text-[#323232] text-lg flex items-center gap-2 font-semibold dark:text-white"
        >
          Employee Efficiency Score
        </p>
        <p
          class="flex items-center gap-3 mt-4 mb-2 text-[#4D6674] dark:text-white/[.8]"
        >
          Based on Factor 1 <span class="text-[#0D2846] font-medium">69%</span>
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
          Based on Factor 2 <span class="text-[#0D2846] font-medium">62%</span>
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
          Based on Factor 3 <span class="text-[#0D2846] font-medium">77%</span>
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
            <span class="text-3xl font-bold">70%</span>
            <p class="text-sm text-gray-500">Efficiency</p>
          </div>
        </div></span
      >
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
        <canvas bind:this={chartCanvas}></canvas>
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
