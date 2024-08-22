<script lang="ts">
  import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  } from "chart.js";
  Chart.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  );
  import { Chart as ChartJS, LineElement, PointElement } from "chart.js";
  import { onMount } from "svelte";
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
  );
  import { Bar, Line } from "svelte-chartjs";
  export let os: string;
  let websocket;

  const basicData = {
    ANE_Usage: null,
    CPU_Power_W: null,
    E_CPU_Freq_MHz: null,
    E_CPU_Usage: null,
    E_Core_Count: null,
    GPU_Core_Count: null,
    GPU_Freq_MHz: null,
    GPU_Power_W: null,
    GPU_Usage: null,
    Memory_Total_GB: null,
    Memory_Usage_Percent: null,
    Memory_Used_GB: null,
    Model_Name: null,
    P_CPU_Freq_MHz: null,
    P_CPU_Usage: null,
    P_Core_Count: null,
    Swap_Total_GB: null,
    Swap_Used_GB: null,
    Total_Cores: null,
    Total_Power_W: null,
  };

  const networkDiskD = {
    In_bytes: null,
    In_packets: null,
    Out_bytes: null,
    Out_packets: null,
    Read_KBytes: null,
    Read_ops: null,
    Write_KBytes: null,
    Write_ops: null,
  };

  let cpuE = [];
  let cpuP = [];

  function generateLabels(dataArray) {
    return dataArray.map((_, index) => `${index + 1}`);
  }

  function connectWebSocket() {
    websocket = new WebSocket("ws://localhost:8080/ws");

    websocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    websocket.onmessage = (event) => {
      //   console.log("Received message:", event.data);
      const msg = JSON.parse(event.data);

      function updateData(key) {
        if (msg[key] !== null) {
          basicData[key] = msg[key];
          if (key === "E_CPU_Usage") {
            cpuE = [...cpuE, msg[key]]; // Spread into a new array to trigger reactivity
          } else if (key === "P_CPU_Usage") {
            cpuP = [...cpuP, msg[key]]; // Spread into a new array to trigger reactivity
          }
        }
      }

      const keysToUpdate = [
        "ANE_Usage",
        "CPU_Power_W",
        "E_CPU_Freq_MHz",
        "E_Core_Count",
        "E_CPU_Usage",
        "GPU_Core_Count",
        "GPU_Freq_MHz",
        "GPU_Power_W",
        "Memory_Total_GB",
        "Memory_Usage_Percent",
        "GPU_Usage",
        "Memory_Used_GB",
        "P_CPU_Freq_MHz",
        "P_CPU_Usage",
        "P_Core_Count",
        "Swap_Total_GB",
        "Swap_Used_GB",
        "Total_Cores",
        "Total_Power_W",
        "Model_Name",
      ];

      keysToUpdate.forEach(updateData);

      function updateNetworkData(key, unit) {
        networkDiskD[key] =
          msg[key] === null ? `${networkDiskD[key]}` : `${msg[key]} ${unit}`;
      }

      updateNetworkData("Out_bytes", "bytes/s");
      updateNetworkData("Out_packets", "packets/s");
      updateNetworkData("Read_KBytes", "KBytes/s");
      updateNetworkData("Read_ops", "ops/s");
      updateNetworkData("Write_KBytes", "KBytes/s");
      updateNetworkData("Write_ops", "ops/s");
      updateNetworkData("In_packets", "packets/s");
      updateNetworkData("In_bytes", "bytes/s");
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }

  function disconnectWebSocket() {
    if (websocket) {
      websocket.close();
    }
  }

  // Connect to WebSocket when component mounts
  onMount(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  });

  const systemD = [
    ["Product LensView v1"],
    ["Hostname e2e-79-82"],
    ["Up_Time 18H 18M 20S"],
    ["Boot_Time 30 Apr 24 17:53 IST"],
    ["Processes 158"],
    ["OS/Platform linux/ubuntu 20.04"],
    ["Kernel/Arch 6.0.0-060000-generic/x86_64"],
  ];
  const ramD = [7.2, 0.6, 6.3, 1.2, 5.2];
  const cpuD = [
    2.9702970296728797, 4.0404040404086805, 1.0101010100947465,
    2.0000000000241016,
  ];

  const networkD = [8.17, 1.93];

  const data = {
    labels: ["Used", "Available", "Free", "Cached"],
    datasets: [
      {
        data: ramD,
        backgroundColor: [
          "rgba(255, 134,159,0.8)",
          "rgba(98,  182, 239,0.8)",
          "rgba(255, 218, 128,0.8)",
          "rgba(113, 205, 205,0.8)",
        ],
        borderWidth: 3,
        borderColor: [
          "rgba(255, 134, 159, 1)",
          "rgba(98,  182, 239, 1)",
          "rgba(255, 218, 128, 1)",
          "rgba(113, 205, 205, 1)",
        ],
      },
    ],
  };

  const macRamD = {
    labels: ["Used"],
    datasets: [
      {
        // data: [basicData.Memory_Usage_Percent],
        backgroundColor: ["rgba(255, 134,159,0.8)"],
        borderWidth: 3,
        borderColor: ["rgba(255, 134, 159, 1)"],
      },
    ],
  };

  $: macRamD.datasets[0].data = [basicData.Memory_Used_GB?.toFixed(2)];

  const lineData = {
    datasets:
      os !== "darwin"
        ? [
            {
              label: "CPU 1",
              fill: true,
              lineTension: 0.3,
              backgroundColor: "rgba(225, 204,230, .3)",
              borderColor: "rgb(205, 130, 158)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgb(205, 130,158)",
              pointBackgroundColor: "rgb(255, 255, 255)",
              pointBorderWidth: 10,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgb(0, 0, 0)",
              pointHoverBorderColor: "rgba(220, 220, 220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: [cpuD[0]],
            },
            {
              label: "CPU 2",
              fill: true,
              lineTension: 0.3,
              backgroundColor: "rgba(184, 185, 210, .3)",
              borderColor: "rgb(35, 26, 136)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgb(35, 26, 136)",
              pointBackgroundColor: "rgb(255, 255, 255)",
              pointBorderWidth: 10,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgb(0, 0, 0)",
              pointHoverBorderColor: "rgba(220, 220, 220, 1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: [cpuD[1]],
            },
            {
              label: "CPU 3",
              fill: true,
              lineTension: 0.3,
              backgroundColor: "rgba(184, 185, 210, .3)",
              borderColor: "rgb(135, 126, 236)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgb(135, 126, 236)",
              pointBackgroundColor: "rgb(255, 255, 255)",
              pointBorderWidth: 10,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgb(0, 0, 0)",
              pointHoverBorderColor: "rgba(220, 220, 220, 1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: [cpuD[2]],
            },
            {
              label: "CPU 4",
              fill: true,
              lineTension: 0.3,
              backgroundColor: "rgba(184, 185, 210, .3)",
              borderColor: "rgb(35, 226, 136)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgb(35, 226, 136)",
              pointBackgroundColor: "rgb(255, 255, 255)",
              pointBorderWidth: 10,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgb(0, 0, 0)",
              pointHoverBorderColor: "rgba(220, 220, 220, 1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: [cpuD[3]],
            },
          ]
        : [
            {
              label: "CPU-E",
              fill: true,
              lineTension: 0.3,
              backgroundColor: "rgba(225, 204,230, .3)",
              borderColor: "rgb(205, 130, 158)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgb(205, 130,158)",
              pointBackgroundColor: "rgb(255, 255, 255)",
              pointBorderWidth: 10,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgb(0, 0, 0)",
              pointHoverBorderColor: "rgba(220, 220, 220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
            },
            {
              label: "CPU-P",
              fill: true,
              lineTension: 0.3,
              backgroundColor: "rgba(184, 185, 210, .3)",
              borderColor: "rgb(35, 26, 136)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgb(35, 26, 136)",
              pointBackgroundColor: "rgb(255, 255, 255)",
              pointBorderWidth: 10,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgb(0, 0, 0)",
              pointHoverBorderColor: "rgba(220, 220, 220, 1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
            },
          ],
  };
  $: {
    lineData.labels = generateLabels(cpuE);
    lineData.datasets[0].data = cpuE;
  }

  $: {
    lineData.datasets[1].data = cpuP;
  }
  const netwD = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Download",
        fill: true,
        lineTension: 0.3,
        backgroundColor: "rgba(225, 204,230, .3)",
        borderColor: "rgb(205, 130, 158)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgb(205, 130,158)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 10,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0, 0, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [networkD[0]],
      },
      {
        label: "Upload",
        fill: true,
        lineTension: 0.3,
        backgroundColor: "rgba(184, 185, 210, .3)",
        borderColor: "rgb(35, 26, 136)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgb(35, 26, 136)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 10,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0, 0, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220, 1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [networkD[1]],
      },
    ],
  };
</script>

<section
  class="max-h-[calc(100vh-80px-75px)] grid w-full h-full grid-cols-4 grid-rows-2 pr-2 py-2 gap-4"
>
  <div
    class="col-span-2 rounded-lg p-2 border-2 border-black/.23 border-solid flex flex-col"
  >
    <span class="font-medium text-lg text-[#323232] pb-2"
      >System Information</span
    >
    {#if os !== "darwin"}
      {#each systemD as item}
        <span class=" font-normal text-base text-[#727272CC]"
          >{item[0].split(" ")[0]}:
          <span class="text-primary font-semibold">
            {item[0].split(" ").slice(1).join(" ")}</span
          ></span
        >
      {/each}
    {:else}
      <div class="grid grid-rows-2 grid-cols-4 h-full w-full gap-2">
        <span
          class="text-base text-[#727272CC] bg-[#D2F2FACC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >Model Name:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.Model_Name}</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#F7FAD2CC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >Total Cores:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.Total_Cores}</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#D2FAD8CC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >E-Cores:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.E_Core_Count}</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#D2D6FACC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >P-Cores:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.P_Core_Count}</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#FAD2F6CC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >GPU Cores:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.GPU_Core_Count}</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#FAD2D2CC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >CPU Power:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.CPU_Power_W} W</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#FAE0D2CC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >GPU Power:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.GPU_Power_W} W</span
          ></span
        >
        <span
          class="text-base text-[#727272CC] bg-[#FAF1D2CC] rounded-lg row-span-1 col-span-1 p-4 font-medium"
          >GPU Usage:<br />
          <span class="text-black dark:text-white text-lg font-semibold">
            {basicData.GPU_Usage} %</span
          ></span
        >
      </div>
    {/if}
  </div>
  <div
    class="col-span-2 rounded-lg p-2 border-2 border-black/.23 border-solid flex gap-4"
  >
    <span class="flex flex-col flex-shrink-0">
      <span class="font-medium text-lg text-[#323232] pb-2">CPU Usage</span>
      {#if os !== "darwin"}
        {#each cpuD as item, index}
          <span class=" font-normal text-xs text-[#323232]"
            >CPU {index} : {item.toFixed(2)} %</span
          >
        {/each}
      {:else}
        <span class=" font-normal text-xs text-[#323232]">
          E-CPU :
          <span class=" font-normal text-xs text-[#323232]">
            {basicData.E_CPU_Usage} %</span
          >
        </span>
        <span class=" font-normal text-xs text-[#323232]">
          P-CPU :
          <span class=" font-normal text-xs text-[#323232]"
            >{basicData.P_CPU_Usage} %
          </span>
        </span>
        <span class=" font-normal text-xs text-[#323232]">
          CPU Power :
          <span class=" font-normal text-xs text-[#323232]"
            >{basicData.CPU_Power_W} W
          </span>
        </span>
        <span class=" font-normal text-xs text-[#323232]">
          GPU Power :
          <span class=" font-normal text-xs text-[#323232]"
            >{basicData.GPU_Power_W} W
          </span>
        </span>
      {/if}
    </span>
    <div class=" w-full">
      <button
        on:click={() => {
          cpuE = [...cpuE, Math.random() * 100];
          cpuP = [...cpuP, Math.random() * 100];
        }}>Manual Update</button
      >
      <div class="h-[90%]">
        <Line
          data={lineData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  display: false,
                },
              },
            },
          }}
        />
      </div>
    </div>
  </div>
  <div
    class="col-span-2 rounded-lg p-2 border-2 border-black/.23 border-solid flex flex-col"
  >
    <span class="font-medium text-lg text-[#323232] pb-2"
      >Memory Usage (RAM)</span
    >
    {#if os !== "darwin"}
      <Bar
        height={250}
        high={ramD[0]}
        low={0}
        {data}
        options={{
          responsive: true,
          indexAxis: "y",
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
    {:else}
      <span class="font-normal text-base text-[#323232]">
        Current: <span class="text-primary font-semibold"
          >{basicData.Memory_Used_GB?.toFixed(
            2,
          )}/{basicData.Memory_Total_GB?.toFixed(2)} GB</span
        >
      </span>
      <Bar
        height={200}
        high={basicData.Memory_Total_GB}
        low={0}
        data={macRamD}
        options={{
          responsive: true,
          indexAxis: "y",
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
    {/if}
  </div>
  <div
    class="col-span-2 rounded-lg p-2 border-2 border-black/.23 border-solid flex flex-col"
  >
    <span class="font-medium text-lg text-[#323232] pb-2"
      >{#if os === "darwin"}Network & Disk Info{:else}
        Network Data{/if}
    </span>
    {#if os === "darwin"}
      <div class="grid grid-rows-3 grid-cols-3 gap-4 w-full h-full">
        {#each Object.entries(networkDiskD) as [key, value]}
          <span class="font-normal text-sm text-[#727272]">
            {key}: <br />
            <span class="text-black dar:text-white font-bold text-xl"
              >{value}</span
            >
          </span>
        {/each}
      </div>
    {:else}
      <div class="h-full">
        <Line
          height={200}
          data={netwD}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  display: false,
                },
              },
            },
          }}
        />
      </div>
    {/if}
  </div>
</section>
