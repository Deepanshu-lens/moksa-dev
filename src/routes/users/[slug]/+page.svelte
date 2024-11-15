<script lang="ts">
  import PocketBase from "pocketbase";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import UsersDataTable from "@/components/users/dataTable/UsersDataTable.svelte";
  import * as DropdownMenu from "@/components/ui/dropdown-menu";
  import {
    Cog,
    Expand,
    Handshake,
    ListFilterIcon,
    Plus,
    Search,
    Upload,
  } from "lucide-svelte";
  import * as Select from "@/components/ui/select";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { BarController, BarElement } from "chart.js";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  import AddUserDialog from "@/components/dialogs/AddUserDialog.svelte";
  import { page } from "$app/stores";
  let view: number = 1;
  export let data;
  let userData = data.usersData.status === 200 ? data.usersData.data.data : [];
  const moksaToken = data.moksaToken;
  // console.log(userData)
  const fruits = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "grapes", label: "Grapes" },
    { value: "pineapple", label: "Pineapple" },
  ];

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let barChartCanvas: HTMLCanvasElement;
  let barChart: Chart | null = null;
  let floatChartCanvas: HTMLCanvasElement;
  let floatChart: Chart | null = null;
  let theftChartCanvas: HTMLCanvasElement;
  let theftChart: Chart | null = null;
  let chartLoading = true;
  let searchVal: string = "";
  let roles = [];

  let userID = "";

  let nodes: any[] = [];
  let moksaNodes: any[] = [];

  onMount(async () => {
    PB.autoCancellation(false);
    const res = await PB.collection("roles").getFullList();
    const stores = await PB.collection("node").getFullList();
    console.log(stores);
    roles = res;
    // nodes = stores
    nodes = stores.map((store) => store.id);
    // moksaNodes = stores.map((store) => store.moksaId);
    moksaNodes = stores
      .map((store) => (store.moksaId === 0 ? null : store.moksaId))
      .filter(Boolean);
    console.log("moksaNodes", moksaNodes);
    // console.log(nodes);
  });

  const validateFields = (
    userType,
    firstName,
    lastName,
    phoneNumber,
    mailId,
    password,
    cPassword,
  ) => {
    const fields = [
      { name: "User Type", value: userType },
      { name: "First Name", value: firstName },
      { name: "Last Name", value: lastName },
      { name: "Phone Number", value: phoneNumber },
      { name: "Mail ID", value: mailId },
      { name: "Password", value: password },
      { name: "Confirm Password", value: cPassword },
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        toast.error(`${field.name} is required`);
        return false;
      }
    }
    return true;
  };

  // $: console.log(userID);

  // userID = await PB.collection("roles").getFullList({
  //   filter: `roleName = "admin"`,
  // });

  const handleSubmit = async (
    userType,
    firstName,
    lastName,
    phoneNumber,
    mailId,
    password,
    cPassword,
  ) => {
    if (
      !validateFields(
        userType,
        firstName,
        lastName,
        phoneNumber,
        mailId,
        password,
        cPassword,
      )
    ) {
      return;
    }

    if (password !== cPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      const session = await PB.collection("session").create({
        owned: true,
        node: userType === "superAdmin" ? nodes : null,
      });

      // const user = await PB.collection("users").create({
      //   firstName,
      //   lastName,
      //   email: mailId,
      //   role: userID,
      //   session: session.id,
      //   password,
      //   passwordConfirm: cPassword,
      // });

      // console.log("RESP: ", user.data);

      let user;

      const roleDetails = await PB.collection("roles").getFullList({
        filter: `roleName = "${userType}"`,
      });

      const createUser = async () => {
        try {
          user = await PB.collection("users").create({
            firstName,
            lastName,
            email: mailId,
            role: roleDetails[0].id,
            session: session.id,
            password,
            passwordConfirm: cPassword,
          });
        } catch (err: any) {
          console.log(Object.keys(err.data.data).includes("email"));
          Object.keys(err.data.data).includes("email") &&
            toast.error(err.data.data.email.message);
          return { message: "error" };
        }
      };

      const userMessage = await createUser();
      if (userMessage && userMessage.message === "error") {
        return;
      }
      console.log("user,user", user);

      const moksa = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          mailId,
          password,
          userType,
          lensId: user.id,
        }),
      });

      const d = await moksa.json();
      if (d.error) {
        toast.error(
          "Oops, moksa API failed with status code 500. Please contact our support team.",
        );
        return;
      }
      console.log("mopksa user", d);
      console.log("mopksa user id", d.data.id);
      await PB.collection("users").update(user.id, {
        moksaId: d.data.id,
      });

      if (userType === "superAdmin") {
        for (const node of nodes) {
          await PB.collection("node").update(node, {
            "session+": [session.id],
          });
        }
        const updateMoksaUserStores = await fetch(
          `https://api.moksa.ai/store/userStore/updateUserByUserId`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${moksaToken}`,
            },
            body: JSON.stringify({
              userId: d.data.id,
              storeIds: moksaNodes,
            }),
          },
        );

        console.log(updateMoksaUserStores);
      }

      const allUsers = await fetch(
        `https://api.moksa.ai/auth/getAllUsers/1/100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${moksaToken}`,
          },
        },
      );
      if (allUsers.ok) {
        userData = (await allUsers.json()).data.data;
        console.log(userData);
      }
      // userData =  allUsers

      toast.success("User added successfully");
      return { message: "success" };
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
      return { message: "error" };
    }
  };

  // $: console.log(roles)

  // $: console.log(selectedRole);

  const { user } = data;
  const PB = new PocketBase(`https://server.moksa.ai`);

  onMount(async () => {
    roles = await PB?.collection("roles").getFullList();
  });

  function createChart() {
    if (chartCanvas && !chart) {
      const ctx = chartCanvas.getContext("2d");

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
        const offlineData = [28, 48, 40, 19, 86, 27, 90];

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Online",
                borderColor: "rgb(54, 84, 244)",
                backgroundColor: "rgba(54, 84, 244, 0.5)",
                borderWidth: 2,
                data: onlineData,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(54, 84, 244)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: "Offline",
                borderColor: "rgb(151, 71, 255)",
                backgroundColor: "rgba(151, 71, 255, 0.5)",
                borderWidth: 2,
                data: offlineData,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(151, 71, 255)",
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
                title: {
                  display: true,
                  text: "Activity Percentage",
                },
                grid: {
                  color: "rgba(0,0,0,.05)",
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

  function createBarChart() {
    if (barChartCanvas && !barChart) {
      const ctx = barChartCanvas.getContext("2d");

      if (ctx) {
        Chart.register(BarController, BarElement, CategoryScale, LinearScale);
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "#357DFF");
        gradient.addColorStop(1, "#053895");

        barChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Overall ratio", "Cameras Monitored", "Stores Monitored"],
            datasets: [
              {
                label: "Operator Performance",
                data: [5, 8, 6],
                backgroundColor: gradient,
                borderColor: "#357DFF",
                borderWidth: 1,
                borderRadius: {
                  topLeft: 0,
                  topRight: 14,
                  bottomLeft: 0,
                  bottomRight: 14,
                },
                borderSkipped: false,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
                max: 10,
              },
            },
          },
        });
      }
    }
  }

  function createFloatChart() {
    if (floatChartCanvas && !floatChart) {
      const ctx = floatChartCanvas.getContext("2d");
      if (ctx) {
        const data = {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Indicated",
              data: [-6, -17, -81, -95, -65, -40, -13, -39, -8, -9, -4, -10],
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return null;
                }
                const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
                gradient.addColorStop(0, "rgba(1, 227, 154, 1)");
                gradient.addColorStop(1, "rgba(1, 112, 120, 1)");
                return gradient;
              },
              borderColor: "rgba(1, 112, 120, 1)",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
            {
              label: "Confirmed",
              data: [4, 13, 60, 78, 60, 33, 10, 23, 6, 6, 2, 1],
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return null;
                }
                const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
                gradient.addColorStop(0, "rgba(194, 191, 4, 1)");
                gradient.addColorStop(1, "rgba(96, 125, 2, 1)");
                return gradient;
              },
              borderColor: "rgba(96, 125, 2, 1)",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
          ],
        };

        floatChart = new Chart(ctx, {
          type: "bar",
          data: data,
          options: {
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
                ticks: {
                  display: false,
                },
              },
              y: {
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                  drawBorder: false,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                align: "end",
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    if (context.parsed.x !== null) {
                      label += context.parsed.x;
                    }
                    return label;
                  },
                },
              },
            },
            layout: {
              padding: {
                left: 30,
                right: 30,
              },
            },
          },
        });
      }
    }
  }

  function createTheftChart() {
    if (theftChartCanvas && !theftChart) {
      const ctx = theftChartCanvas.getContext("2d");
      if (ctx) {
        const data = {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Indicated",
              data: [-6, -17, -81, -95, -65, -40, -13, -39, -8, -9, -4, -10],
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return null;
                }
                const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
                gradient.addColorStop(0, "rgba(255, 169, 88, 1)");
                gradient.addColorStop(1, "rgba(255, 1, 120, 1)");
                return gradient;
              },
              borderColor: "rgba(255, 1, 120, 1)",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
            {
              label: "Confirmed",
              data: [4, 13, 60, 78, 60, 33, 10, 23, 6, 6, 2, 1],
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return null;
                }
                const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
                gradient.addColorStop(0, "rgba(4, 158, 243, 1)");
                gradient.addColorStop(1, "rgba(21, 29, 100, 1)");
                return gradient;
              },
              borderColor: "rgba(21, 29, 100, 1)",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
          ],
        };

        theftChart = new Chart(ctx, {
          type: "bar",
          data: data,
          options: {
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
                ticks: {
                  display: false,
                },
              },
              y: {
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                  drawBorder: false,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                align: "end",
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    if (context.parsed.x !== null) {
                      label += context.parsed.x;
                    }
                    return label;
                  },
                },
              },
            },
            layout: {
              padding: {
                left: 30,
                right: 30,
              },
            },
          },
        });
      }
    }
  }

  $: if (view === 2) {
    chartLoading = false;
    setTimeout(() => {
      createChart();
      createBarChart();
      createFloatChart();
      createTheftChart();
    }, 100);
  }

  onMount(() => {
    setTimeout(() => {
      chartLoading = false;
    }, 1000);

    return () => {
      if (chart) {
        chart.destroy();
      }
      if (barChart) {
        barChart.destroy();
      }
      if (floatChart) {
        floatChart.destroy();
      }
      if (theftChart) {
        theftChart.destroy();
      }
    };
  });
  let selectedRole = "";

  function handleRoleSelect(role: string) {
    selectedRole = selectedRole === role ? "" : role;
  }
</script>

<main class="flex flex-row-reverse h-[calc(100vh-75px)] w-full">
  <div
    class=" flex flex-col gap-6 items-center justify-center px-2 bg-gradient-to-b from-[#000610] via-[#000307] via-[#050E41] to-[#000307] h-[calc(100vh-75px)]"
  >
    <!-- <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white bg-transparent text-white group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
        ><Search class="h-[22px] w-[22px]" /></button
      >
      <p
        class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white pointer-events-none"
      >
        Search
      </p>
    </span> -->
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 1)}
        class={view !== 1
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><Handshake class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`pointer-events-none text-center text-xs ${view !== 1 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        User <br /> Operations
      </p>
    </span>
    <!-- <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 2)}
        class={view !== 2
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><Cog class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`text-center pointer-events-none text-xs ${view !== 2 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Operator <br /> management
      </p>
    </span> -->
  </div>

  {#if view === 1}
    <section class="w-full p-4 px-6">
      <div class="flex items-center justify-end">
        <span class="flex items-center gap-3">
          <span class="relative">
            <Input
              bind:value={searchVal}
              type="text"
              placeholder="Search"
              class="pl-10"
            />
            <Search
              size={18}
              class="absolute top-1/2 -translate-y-1/2 left-4"
            />
          </span>
          <!-- <Button variant="outline" class="flex items-center gap-1"
            >
            <ListFilterIcon size={18} /> Filters</Button
          > -->
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="outline" class="flex items-center gap-1 text-sm">
                <ListFilterIcon size={18} />Filters
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              class="max-h-[200px] overflow-y-auto min-w-[150px]"
            >
              <DropdownMenu.Label>Roles</DropdownMenu.Label>
              <DropdownMenu.Separator />
              {#if roles.length > 0}
                {#each roles as role}
                  <DropdownMenu.CheckboxItem
                    checked={selectedRole === role.roleName}
                    onCheckedChange={() => handleRoleSelect(role.roleName)}
                  >
                    {role?.roleName?.toLowerCase()}
                  </DropdownMenu.CheckboxItem>
                {/each}
              {/if}
              <DropdownMenu.Separator />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <AddUserDialog user={data.user} {handleSubmit}>
            <Button
              class="text-white bg-[#3D81FC] hover:bg-white hover:text-[#3D81FC] flex items-center gap-1"
              ><Plus size={18} /> Add User</Button
            >
          </AddUserDialog>
        </span>
      </div>

      <div class="rounded-lg w-full h-full flex flex-col">
        <div
          class=" color h-[50px] w-full text-white flex items-center px-3 font-medium text-lg mt-4 rounded-t-lg"
        >
          Users
        </div>
        <UsersDataTable
          token={moksaToken}
          users={userData}
          {searchVal}
          filter={selectedRole}
          role={user?.role}
        />
      </div>
    </section>
  {:else}
    <section class="w-full p-4 px-6">
      <div class="flex items-center justify-between">
        <span
          class="flex items-center border-black border-opacity-[18%] border-[1px] rounded-md h-[40px]"
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
          <Select.Root portal={null}>
            <Select.Trigger
              class="w-[180px] bg-[#F4F4F4] border border-[#E0E0E0] rounded-lg"
            >
              <Select.Value placeholder="Select Operator" />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Fruits</Select.Label>
                {#each fruits as fruit}
                  <Select.Item value={fruit.value} label={fruit.label}
                    >{fruit.label}</Select.Item
                  >
                {/each}
              </Select.Group>
            </Select.Content>
            <Select.Input name="favoriteFruit" />
          </Select.Root>
          <Button variant="outline" class="flex items-center gap-1"
            ><ListFilterIcon size={18} /> Filters</Button
          >
          <Button
            class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
            ><Upload size={18} /> Export Report</Button
          >
        </span>
      </div>

      <div
        class="h-full w-full py-4 grid grid-cols-2 grid-rows-2 gap-4 max-h-[calc(100vh-130px)] overflow-y-auto"
      >
        <div
          class="border rounded-md col-span-1 row-span-1 p-4 flex flex-col gap-4"
        >
          <span class="flex items-center justify-between">
            <span class="text-xl font-semibold text-[#323232]"
              ><p>Operators Activity</p>
              <p class="text-sm font-medium text-[#8C8C8C]">
                Average activity per day
              </p></span
            >
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-2 text-sm text-[#323232]"
                ><span
                  class="bg-[#136AD5] w-2 h-2 rounded-full flex-shrink-0"
                /> Online</span
              >
              <span class="flex items-center gap-2 text-sm text-[#323232]"
                ><span
                  class="bg-[#9747FF] w-2 h-2 rounded-full flex-shrink-0"
                /> Offline</span
              >
              <Select.Root portal={null}>
                <Select.Trigger
                  class="w-[180px] bg-white border border-[#E0E0E0] rounded-lg"
                >
                  <Select.Value placeholder="All Stores" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Fruits</Select.Label>
                    {#each fruits as fruit}
                      <Select.Item value={fruit.value} label={fruit.label}
                        >{fruit.label}</Select.Item
                      >
                    {/each}
                  </Select.Group>
                </Select.Content>
                <Select.Input name="favoriteFruit" />
              </Select.Root>
            </span>
          </span>
          <div class="flex items-center justify-center h-full w-full relative">
            {#if chartLoading === false}
              <canvas bind:this={chartCanvas}></canvas>
            {/if}
            {#if chartLoading === true}
              <span
                class="absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2"
              >
                <Spinner />
              </span>
            {/if}
          </div>
        </div>
        <div
          class="border rounded-md col-span-1 row-span-1 p-4 flex flex-col gap-4"
        >
          <span class="flex flex-col">
            <p class="text-xl font-semibold text-[#323232]">
              Operators Performance Indicator
            </p>
            <p class="text-sm font-medium text-[#8C8C8C]">
              Average Performance
            </p>
          </span>
          <div class="h-full w-full">
            <canvas bind:this={barChartCanvas}></canvas>
          </div>
        </div>
        <div
          class="border rounded-md col-span-1 row-span-1 p-4 flex flex-col gap-4"
        >
          <span class="flex items-center justify-between w-full">
            <p class="text-xl font-semibold text-[#323232]">Unusual Activity</p>
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-2 text-sm text-[#323232]"
                ><span
                  class=" bg-gradient-to-t from-[#01E39A] to-[#017078] size-3 rounded-full flex-shrink-0"
                /> Detected</span
              >
              <span class="flex items-center gap-2 text-sm text-[#323232]"
                ><span
                  class="bg-gradient-to-t from-[#C2BF04] to-[#607D02] size-3 rounded-full flex-shrink-0"
                /> Confirmed</span
              >
            </span>
          </span>
          <div class="h-full w-full">
            <canvas bind:this={floatChartCanvas}></canvas>
          </div>
        </div>
        <div
          class="border rounded-md col-span-1 row-span- p-4 flex flex-col gap-4"
        >
          <span class="flex items-center justify-between w-full">
            <p class="text-xl font-semibold text-[#323232]">Thefts</p>
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-2 text-sm text-[#323232]"
                ><span
                  class=" bg-gradient-to-t to-[#ffa958] from-[#ff0178] size-3 rounded-full flex-shrink-0"
                /> Detected</span
              >
              <span class="flex items-center gap-2 text-sm text-[#323232]"
                ><span
                  class="bg-gradient-to-t from-[#049ef3] to-[#151d64] size-3 rounded-full flex-shrink-0"
                /> Confirmed</span
              >
            </span>
          </span>
          <div class="h-full w-full">
            <canvas bind:this={theftChartCanvas}></canvas>
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>

<style>
  .color {
    background: #050f40;
  }
</style>
