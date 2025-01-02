<script lang="ts">
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import ChartDataLabels from "chartjs-plugin-datalabels";
  import { cameras, selectedNode } from "@/stores";

  Chart.register(...registerables, ChartDataLabels);

  let dateChartCtx;
  let cameraChartCtx;
  let cameraChart;
  let selectedCameras;
  let data;
  let displayAll = false;
  let dateChart;

  const renderDateChart = (data) => {
    const dateLabels = Object.keys(data.dates);
    const dateData = dateLabels.map((date) =>
      Object.values(data.dates[date]).reduce(
        (acc, curr) => acc + curr.storage,
        0
      )
    );

    // Destroy the previous chart if it exists
    if (dateChart) {
      dateChart.destroy();
    }

    dateChart = new Chart(dateChartCtx, {
      type: "pie",
      data: {
        labels: dateLabels,
        datasets: [
          {
            data: dateData,
            backgroundColor: generateColors(dateLabels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {},
        },
      },
    });
  };

  const renderCameraChart = (data) => {
    const cameraStorageMap = {};
    for (const date in data.dates) {
      for (const camera in data.dates[date]) {
        cameraStorageMap[camera] =
          (cameraStorageMap[camera] || 0) + data.dates[date][camera].storage;
      }
    }

    const cameraLabels = Object.keys(cameraStorageMap);
    const cameraData = cameraLabels.map((camera) => cameraStorageMap[camera]);

    if (cameraChart) cameraChart.destroy();

    cameraChart = new Chart(cameraChartCtx, {
      type: "pie",
      data: {
        labels: cameraLabels,
        datasets: [
          {
            data: cameraData,
            backgroundColor: generateColors(cameraLabels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          // Configure the legend
          legend: { position: "bottom" },

          // Hide data labels
          datalabels: {
            display: false, // Disable data labels on the chart
          },

          // Enable tooltips for hover functionality
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const dataset = tooltipItem.dataset.data;
                const value = dataset[tooltipItem.dataIndex];
                const sum = dataset.reduce((a, b) => a + b, 0);
                const percentage = ((value / sum) * 100).toFixed(2) + "%";
                return `${cameraLabels[tooltipItem.dataIndex]}: ${value.toFixed(2)} GB (${percentage})`;
              },
            },
          },
        },
      },
    });
  };

  const generateColors = (num) => {
    const predefinedColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#C9CBCF",
      "#8BC34A",
    ];
    return Array.from(
      { length: num },
      (_, i) => predefinedColors[i % predefinedColors.length]
    );
  };

  const fetchData = async () => {
    displayAll = $selectedNode === "all";
    try {
      const res = await fetch(
        `https://playback.lenscorp.cloud/stats?display_all=${displayAll}&camera_ids=${selectedCameras}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const temp = await res.json();
      data = temp;
      renderDateChart(temp);
      renderCameraChart(temp);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  onMount(async () => {
    fetchData();
  });

  $: {
    if ($selectedNode) {
      selectedCameras = $cameras?.map((cam) => cam?.id);
      // Add logic to filter chart data or fetch filtered data
      fetchData();
    }
  }
</script>

<div class="container mx-auto px-4 py-4 max-h-[90vh] overflow-auto mb-30">
  <section class="flex flex-wrap justify-around gap-4 mb-8">
    {#if data?.total_storage_gb}
      <div class="bg-white shadow rounded-lg p-4 w-full max-w-xs text-center">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">
          Total Storage Used
        </h2>
        <p class="text-xl font-bold text-blue-500">{data?.total_storage_gb}</p>
      </div>
    {/if}
    {#if data?.total_disk_storage_gb}
      <div class="bg-white shadow rounded-lg p-4 w-full max-w-xs text-center">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">
          Total Disk Storage
        </h2>
        <p class="text-xl font-bold text-blue-500">
          {data?.total_disk_storage_gb}
        </p>
      </div>
    {/if}

    {#if !!data?.playback_path}
      <div class="bg-white shadow rounded-lg p-4 w-full max-w-sm text-center">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Playback Path</h2>
        <p class="text-sm text-gray-500">{data?.playback_path}</p>
      </div>
    {/if}
  </section>

  <section class="flex flex-wrap justify-around gap-4 mb-30 pb-30">
    <div class="bg-white shadow rounded-lg p-4 w-full max-w-md">
      <h3 class="text-center text-gray-700 font-semibold mb-4">
        Storage by Date
      </h3>
      <canvas bind:this={dateChartCtx}></canvas>
    </div>
    <div class="bg-white shadow rounded-lg p-4 w-full max-w-md">
      <h3 class="text-center text-gray-700 font-semibold mb-4">
        Storage by Camera
      </h3>
      <canvas bind:this={cameraChartCtx}></canvas>
    </div>
  </section>
</div>
