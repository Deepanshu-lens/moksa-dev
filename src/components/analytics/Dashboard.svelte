<script lang="ts">
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
  import { Plus, Upload } from "lucide-svelte";
  import { Button } from "../ui/button";
  import type { DateRange } from "bits-ui";
  import { type DateValue } from "@internationalized/date";
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import { toast } from "svelte-sonner";
  import * as Popover from "../ui/popover";
  import Spinner from "../ui/spinner/Spinner.svelte";

  export let token: string;
  export let allStores;
  export let allStoresData;
  export let aisleData;
  export let theftandcamera;
  export let efficiency;
  export let safetyDetails;
  export let theftData;
  export let user;
  export let storePeopleCount;
  let chartLoading = true;
  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let barChart: Chart | null = null;
  let barChartCanvas: HTMLCanvasElement;
  let dateRange = writable("7 Days");
  let heatMapDateRange = writable("7");
  let isInitialLoad = true;
  let isLoading = writable(false);
  let value: DateRange | undefined = undefined;
  let heatMapValue: DateRange | undefined = undefined;
  let startValue: DateValue | undefined = undefined;
  let customDateLabel = "Custom";
  let heatMapCustomDateLabel = "Custom";
  let close = false;
  let heatmapclose = false;
  let busynessStoresData = writable([]);
  let selectedFloorMap: string | null = null;
  let storeFloorImg: string | null = null;
  let loadingFloor = true;
  let heatMapData = writable(null);
  let floorMaps = writable([]);

  const fruits = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
    hasKitchen: store.hasKitchen,
  }));

  let selectedStore = writable({
    value: fruits?.[0]?.value,
    label: fruits?.[0]?.label,
    hasKitchen: fruits?.[0]?.hasKitchen,
  });

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

  $: {
    if (heatMapValue?.start && heatMapValue?.end) {
      const start = new Date(
        heatMapValue.start.year,
        heatMapValue.start.month - 1,
        heatMapValue.start.day,
      );
      const end = new Date(
        heatMapValue.end.year,
        heatMapValue.end.month - 1,
        heatMapValue.end.day,
      );
      heatMapCustomDateLabel = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      const dayDifference = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      console.log(dayDifference);
      heatMapDateRange.set("custom");
      setTimeout(() => {
        heatmapclose = false;
      }, 200);
    } else {
      heatMapCustomDateLabel = "Custom";
    }
  }

  onMount(async () => {
    await getAllFloorMaps();
  });

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

        const labels = theftData?.data.map((item) => item.day_of_week.trim());
        const theftDetectedData = theftData?.data.map((item) =>
          parseInt(item.theft_detected),
        );
        const theftPreventedData = theftData?.data.map((item) =>
          parseInt(item.theft_prevented),
        );

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
    console.log("called");
    if (chartCanvas && !chart) {
      console.log("here");
      const ctx = chartCanvas.getContext("2d");
      const gradient = ctx.createLinearGradient(400, 0, 0, chartCanvas.height);
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
        console.log("busyness", $busynessStoresData);
        const processedData = processChartData($busynessStoresData);

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: processedData.labels,
            datasets: [
              {
                label: "Predicted Mean",
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
                  autoSkip: false,
                  font: {
                    size: 14,
                  },
                },
              },
              y: {
                display: true,
                title: {
                  display: false,
                  text: "Predicted Mean",
                },
                grid: {
                  display: false,
                },
                beginAtZero: true,
                suggestedMax: Math.max(...processedData.data) + 1,
                ticks: {
                  stepSize: 1,
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
                    return `${context.dataset.label}: ${context.parsed.y}`;
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
    console.log(data);
    return {
      labels: data.map((item) => `${item.dayName} (${item.hour.slice(0, 5)})`),
      data: data.map((item) => item.predictedMean),
    };
  }

  onMount(() => {
    chartLoading = false;
    setTimeout(() => {
      createBarChart();
      // createChart();
    }, 100);
  });

  let eeScore = writable([]);
  let storesTotal = writable([]);
  let storesAisle = writable([]);
  let theftDataa = writable([]);

  async function fetchDataStoreWise() {
    if (isInitialLoad) {
      isInitialLoad = false;
      return; // Skip the first call
    }
    isLoading.set(true);

    const today = new Date();
    let startDate = new Date(today);

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
    console.log($selectedStore.label, $selectedStore.value);
    try {
      const [theftD, busy, employeeEff, safetyD, storeData] = await Promise.all(
        [
          fetch(
            `https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/${$selectedStore.value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                datetype:
                  $dateRange === "7 Days"
                    ? "7"
                    : $dateRange === "15 Days"
                      ? "15"
                      : $dateRange === "30 Days"
                        ? "30"
                        : $dateRange === "12 Months"
                          ? "year"
                          : "7",
                startDate: formatDate(startDate),
                endDate: formatDate(today),
              },
            },
          ).then((res) => res.json()),
          fetch(
            `https://dev.api.moksa.ai/customerPrediction/storeBusyHourBystoreId/${$selectedStore.value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ).then((res) => res.json()),
          fetch(
            `https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${$selectedStore.value}/${formatDate(startDate)}/1/100/${formatDate(today)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ).then((res) => res.json()),
          fetch(
            `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/1/100/${formatDate(startDate)}/${formatDate(today)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ).then((res) => res.json()),
          fetch(
            `https://dev.api.moksa.ai/store/getAllStoresTotals/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ).then((res) => res.json()),
        ],
      );
      console.log(employeeEff);
      console.log(safetyD);

      efficiency = employeeEff.data;
      theftDataa.set(theftD);
      allStoresData = storeData.data;
      busynessStoresData.set(busy.data);
      safetyDetails = safetyD?.data === undefined ? [] : safetyD?.data;
      updateBarChart(theftD);

      if ($selectedStore.value !== -1) {
        await getFloorMap($selectedStore.value);
        setTimeout(() => {
          if (chart === null) {
            createChart();
          } else {
            updateBusynessChart(busy.data);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error fetching store-wise data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  function updateBusynessChart(busyData) {
    console.log("Updating busyness chart");
    if (chart) {
      console.log("Busyness data:", busyData);
      const processedData = processChartData(busyData);

      chart.data.labels = processedData.labels;
      chart.data.datasets[0].data = processedData.data;
      chart.options.scales.y.suggestedMax = Math.max(...processedData.data) + 1;
      chart.update();
    }
  }

  function updateBarChart(theftD) {
    console.log("first", theftD);
    if (barChart) {
      const labels = theftD?.data?.map((item) =>
        $dateRange === "7 Days"
          ? item?.day_of_week?.trim()
          : $dateRange === "12 Months"
            ? item?.month_name?.trim()
            : item?.date?.trim(),
      );
      const theftDetectedData = theftD?.data.map((item) =>
        parseInt(item.theft_detected),
      );
      const theftPreventedData = theftD?.data.map((item) =>
        parseInt(item.theft_prevented),
      );

      barChart.data.labels = labels;
      barChart.data.datasets[0].data = theftDetectedData;
      barChart.data.datasets[1].data = theftPreventedData;
      barChart.update();
    }
  }

  async function fetchDataForDateRange() {
    customDateLabel = "Custom";
    value = undefined;

    if (isInitialLoad) {
      isInitialLoad = false;
      return; // Skip the first call
    }
    isLoading.set(true);

    const today = new Date();
    let startDate = new Date(today);

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

    console.log(formatDate(startDate));
    console.log(formatDate(today));
    try {
      // Call the three APIs
      const [
        eeScore,
        storesTotal,
        storesAisle,
        theftD,
        storePeople,
        safetyData,
      ] = await Promise.all([
        fetch(
          `https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${$selectedStore.value}/${formatDate(startDate)}/1/100/${formatDate(today)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/store/getAllStoresTotals/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/store/getAllStoresWithAisleDetails/1/20/${formatDate(startDate)}/${formatDate(today)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/-1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              datetype:
                $dateRange === "7 Days"
                  ? "7"
                  : $dateRange === "15 Days"
                    ? "15"
                    : $dateRange === "30 Days"
                      ? "30"
                      : $dateRange === "12 Months"
                        ? "year"
                        : "7",
              startDate: formatDate(startDate),
              endDate: formatDate(today),
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/people/getPeopleCount/${$selectedStore.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              datetype:
                $dateRange === "7 Days"
                  ? "7"
                  : $dateRange === "15 Days"
                    ? "7"
                    : $dateRange === "30 Days"
                      ? "30"
                      : $dateRange === "12 Months"
                        ? "year"
                        : "7",
              Pagepersize: "100",
              Pagenumber: "1",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/1/100/${formatDate(startDate)}/${formatDate(today)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
      ]);

      console.log(eeScore);
      console.log(storesTotal);
      console.log(storesAisle);
      console.log(theftD);
      console.log(safetyData);
      // eeScore.set(eeScore)
      // storesTotal.set(storesTotal)
      // storesAisle.set(storesAisle)
      storePeopleCount = storePeople?.data?.data;
      allStoresData = storesTotal.data;
      efficiency = eeScore.data;
      safetyDetails = safetyData?.data === undefined ? [] : safetyData?.data;

      theftDataa.set(theftD);
      updateBarChart(theftD);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  async function fetchCustomDateData() {
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
      // Call the three APIs
      const [
        eeScore,
        storesTotal,
        storesAisle,
        theftD,
        storePeople,
        safetyData,
      ] = await Promise.all([
        fetch(
          `https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${$selectedStore.value}/${start}/1/100/${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/store/getAllStoresTotals/${$selectedStore.value}/${start}/${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/store/getAllStoresWithAisleDetails/1/20/${start}/${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/${$selectedStore.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              datetype:
                $dateRange === "7 Days"
                  ? "7"
                  : $dateRange === "15 Days"
                    ? "15"
                    : $dateRange === "30 Days"
                      ? "30"
                      : $dateRange === "12 Months"
                        ? "year"
                        : $dateRange === "custom"
                          ? "custom"
                          : "7",
              startDate: start,
              endDate: end,
            },
          },
        ).then((res) => res.json()),
        fetch(`https://dev.api.moksa.ai/people/getPeopleCount/-1`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Pagepersize: "100",
            Pagenumber: "1",
            startdate: start,
            enddate: end,
            datetype: "custom",
          },
        }).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/1/100/${start}/${end}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
      ]);

      console.log(eeScore);
      console.log(storesTotal);
      console.log(storesAisle);
      console.log(theftD);
      // eeScore.set(eeScore)
      // storesTotal.set(storesTotal)
      // storesAisle.set(storesAisle)
      storePeopleCount = storePeople?.data?.data;
      allStoresData = storesTotal.data;
      efficiency = eeScore.data;
      safetyDetails = safetyData?.data === undefined ? [] : safetyData?.data;
      theftDataa.set(theftD);
      updateBarChart(theftD);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  $: {
    if ($dateRange.toLowerCase() !== "custom") {
      fetchDataForDateRange();
    }
  }

  $: if (
    $dateRange.toLowerCase() === "custom" &&
    (value?.start || value?.end)
  ) {
    fetchCustomDateData();
  }

  function cleanValue(value: string | number): string {
    const stringValue = String(value);

    // Enclose values containing commas or quotes in double quotes
    if (stringValue.includes(",") || stringValue.includes('"')) {
      // Escape any double quotes inside the value by doubling them
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  function convertArrToCSV(
    arr: any[],
    fileName: string,
    excludeKeys: string[] = [],
  ): void {
    // Extract the headers
    const headers = Object.keys(arr[0])
      .filter((key) => !excludeKeys.length || !excludeKeys.includes(key)) // Filter out excluded keys
      .join(",");

    // Extract the data rows with value cleaning
    const rows = arr
      .map((obj) => {
        return Object.keys(obj)
          .filter((key) => !excludeKeys.length || !excludeKeys.includes(key)) // Filter out excluded keys
          .map((key) => cleanValue(obj[key]))
          .join(",");
      })
      .join("\n");
    // Combine headers and rows
    const csvContent = headers + "\n" + rows;

    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the CSV
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; //file name after download
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the link after download
    document.body.removeChild(link);
  }

  function exportCSV() {
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (aisleData.length > 0) {
      convertArrToCSV(aisleData, `dashboard_store_data_${date}.csv`);
    } else {
      toast.error("No store data available to export");
    }
    if (efficiency.data.length > 0) {
      convertArrToCSV(
        efficiency.data,
        `dashboard_employee_efficiency_data_${date}.csv`,
      );
    } else {
      toast.error("No employee efficiency data available to export");
    }
    if (safetyDetails.data.length > 0) {
      convertArrToCSV(safetyDetails.data, `dashboard_safety_data_${date}.csv`);
    } else {
      toast.error("No safety data available to export");
    }
    if (theftData.data.length > 0) {
      convertArrToCSV(theftData.data, `dashboard_theft_data_${date}.csv`);
    } else {
      toast.error("No theft data available to export");
    }
    if (allStores.length > 0) {
      convertArrToCSV(allStores, `dashboard_all_stores_data_${date}.csv`);
    } else {
      toast.error("No all stores data available to export");
    }
  }

  import { Input } from "../ui/input";
  import { createEventDispatcher } from "svelte";

  let filterText = "";
  $: filteredFruits = fruits.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  const dispatch = createEventDispatcher();

  function updateAllSelects(newValue) {
    selectedStore.set(newValue);
    fetchDataStoreWise();
  }

  function drawHeatmap() {
    const canvas = document.getElementById(
      "heatmapCanvas",
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // console.log($heatMapData);
    const image = document.querySelector("img") as HTMLImageElement;
    canvas.width = image.width;
    canvas.height = image.height;

    let hd = $heatMapData.data;
    if (!Array.isArray(hd) || !Array.isArray(hd[0])) {
      console.error("Heatmap data is not a 2D array:", hd);
      toast.error("Incorrect heatmap data");
      return;
    }

    const maxValue = Math.max(...hd.map((row) => Math.max(...row)));
    console.log("maxvalue", maxValue);

    for (let y = 0; y < hd.length; y++) {
      for (let x = 0; x < hd[y].length; x++) {
        const value = hd[y][x];
        // const intensity = (value / maxValue) * 10;
        const intensity = (value / maxValue) * 255;
        // const maxValue = Math.max(...hd.map((row) => Math.max(...row)));
        let color;

        if (intensity <= 10) {
          color = `rgba(0, 0, 0, 0)`;
        } else if (intensity <= 50) {
          color = `rgba(0,0,255,1)`;
        } else if (intensity <= 100) {
          color = `rgba(255, 255, 0, 1)`;
        } else if (intensity <= 150) {
          color = `rgba(255, 165, 0, 1)`;
        } else if (intensity <= 200) {
          color = `rgba(255, 0, 0,1)`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(
          (x / hd[y].length) * canvas.width,
          (y / hd.length) * canvas.height,
          canvas.width / hd[y].length,
          canvas.height / hd.length,
        );
      }
    }
  }

  const getFloorMap = async (storeId) => {
    try {
      const res = await fetch(
        `https://dev.api.moksa.ai/store/getFloorMapByStoreid/${storeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log(`Floor map for store ${storeId}:`, data);
      floorMaps.update((maps) => [
        ...maps,
        { storeId: storeId, img: data.data },
      ]);
      return data;
    } catch (error) {
      console.error(`Error fetching floor map for store ${storeId}:`, error);
    }
  };

  const getAllFloorMaps = async () => {
    await Promise.all(
      allStores
        ?.filter((store: any) => store.id !== -1)
        ?.map((store: any) => getFloorMap(store.id)),
    );
  };

  async function updateSelectedFloorMap() {
    console.log("updateSelectedFloorMap called", $heatMapDateRange);
    heatMapCustomDateLabel = "custom";
    heatMapValue = undefined;

    loadingFloor = true;
    const selectedMap = $floorMaps.find(
      (map) => map.storeId === $selectedStore.value,
    );
    selectedFloorMap = selectedMap ? selectedMap.img : null;
    // console.log('Selected floor map:', selectedFloorMap);

    if (selectedFloorMap !== "" && selectedFloorMap !== null) {
      // console.log('selectedFloorMap',selectedFloorMap)
      const mapData = await fetch(
        `https://dev.api.moksa.ai/heatmap/getHeatMapByTimeAndStoreId/${$heatMapDateRange}/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await mapData.json();
      console.log("mapData", data);
      heatMapData.set(data);
      const res = await fetch("https://dev.api.moksa.ai/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: selectedFloorMap,
        }),
      });
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      // selectedImage = imageUrl;
      // console.log('data',data)
      storeFloorImg = imageUrl;
      loadingFloor = false;
      setTimeout(() => {
        drawHeatmap($heatMapData);
      }, 100);
    } else {
      storeFloorImg = null;
      loadingFloor = false;
    }
  }

  async function updateSelectedFloorMapCustom() {
    console.log("updateSelectedFloorMap  custom called", $heatMapDateRange);
    loadingFloor = true;
    const start = heatMapValue?.start
      ? `${heatMapValue.start.year}-${String(heatMapValue.start.month).padStart(2, "0")}-${String(heatMapValue.start.day).padStart(2, "0")}`
      : "";
    const end = heatMapValue?.end
      ? `${heatMapValue.end.year}-${String(heatMapValue.end.month).padStart(2, "0")}-${String(heatMapValue.end.day).padStart(2, "0")}`
      : "";
    console.log(start);
    console.log(end);
    const selectedMap = $floorMaps.find(
      (map) => map.storeId === $selectedStore.value,
    );
    selectedFloorMap = selectedMap ? selectedMap.img : null;
    // console.log('Selected floor map:', selectedFloorMap);

    if (selectedFloorMap !== "" && selectedFloorMap !== null) {
      // console.log('selectedFloorMap',selectedFloorMap)
      const mapData = await fetch(
        `https://dev.api.moksa.ai/heatmap/getHeatMapByTimeAndStoreId/custom/${$selectedStore.value}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            startdate: start,
            enddate: end,
          },
        },
      );
      const data = await mapData.json();
      console.log("mapData", data);
      heatMapData.set(data);
      const res = await fetch("https://dev.api.moksa.ai/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: selectedFloorMap,
        }),
      });
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      // selectedImage = imageUrl;
      // console.log('data',data)
      storeFloorImg = imageUrl;
      loadingFloor = false;
      setTimeout(() => {
        drawHeatmap($heatMapData);
      }, 100);
    } else {
      storeFloorImg = null;
      loadingFloor = false;
    }
  }

  $: if ($selectedStore.value !== -1 || $heatMapDateRange) {
    if (heatMapValue?.start || heatMapValue?.end) {
      updateSelectedFloorMapCustom();
    } else {
      updateSelectedFloorMap();
    }
  }

  // $: console.log('selectedStore', $selectedStore)
  // $: console.log('allStores', allStores)
  // $: console.log('fruits', fruits)
</script>

<section
  class="w-full p-4 flex flex-col hide-scrollbar overflow-y-auto max-h-[calc(100vh-75px)]"
>
  <!-- Date Range filter -->
  <div class="flex items-center justify-between">
    <span
      class="flex items-center border-black border-opacity-[18%] h-[40px] border-[1px] rounded-md dark:border-white"
    >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7 Days" ? "rounded-l-md bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
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
    <span class="flex flex-row-reverse items-center gap-3">
      {#if user.role !== "Operators" && user.role !== "adminNonPaid" && user.role !== "storeEmployee"}
        <Button
          variant="outline"
          class="flex items-center gap-1 bg-[#3D81FC] text-white"
          on:click={exportCSV}><Upload size={18} /> Export</Button
        >
      {/if}
      <Select.Root portal={null}>
        <Select.Trigger
          class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value placeholder={$selectedStore?.label} />
        </Select.Trigger>
        <Select.Content class="max-h-[200px] overflow-y-auto">
          <div class="p-2">
            <Input
              type="text"
              placeholder="Search stores..."
              bind:value={filterText}
              class="mb-2"
            />
          </div>
          <Select.Group>
            {#if filteredFruits.length > 0}
              {#each filteredFruits as fruit}
                <Select.Item
                  on:click={() => updateAllSelects(fruit)}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            {:else}
              <Select.Item disabled>N/A</Select.Item>
            {/if}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <!-- <Button
        class="flex items-center flex-row-reverse justify-between px-2 gap-1 font-medium text-white rounded-xl bg-[#00A569] hover:text-[#00A569] hover:bg-white"
        ><img src="/images/money.svg" alt="export" class="scale-90" /> Cost Saving</Button
      > -->
    </span>
  </div>

  <!-- main section -->
  <div
    class={`grid grid-cols-8  gap-4 gap-y-10 ${$selectedStore.label === "All Stores" ? "h-[1400px] grid-rows-11" : "h-[2000px] grid-rows-12"} mt-4`}
  >
    <!-- Cards Section -->
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
      class="col-span-2 border rounded-lg h-[85px] bg-gradient-to-r from-[#C8C303] to-[#597802] py-3 px-4 relative"
    >
      <p class="text-white font-semibold">No. of cameras assigned</p>

      <p class="text-xl font-semibold text-white">
        {allStoresData?.totalcameracount}
      </p>
      <img src="/images/card2.png" alt="" class="absolute top-0 right-0" />
    </div>
    <div
      class="col-span-2 border rounded-lg bg-gradient-to-r from-[#02A7FD] to-[#141C64] px-4 py-3 relative h-[85px]"
    >
      <p class="text-white font-semibold">Total theft detected</p>
      <p class="text-xl font-semibold text-white">
        {allStoresData?.totaldetectedthefts}
      </p>
      <img src="/images/card3.png" alt="" class="absolute top-0 right-0" />
    </div>
    <div
      class="col-span-2 border rounded-lg bg-gradient-to-r from-[#FFB156] to-[#FF007A] px-4 py-3 relative h-[85px]"
    >
      <p class="text-white font-semibold">No. of thefts prevented</p>
      <p class="text-xl font-semibold text-white">
        {allStoresData?.totalpreventedthefts}
      </p>
      <img src="/images/card4.png" alt="" class="absolute top-0 right-0" />
    </div>

    <!-- Theft Detected Section -->
    <div
      class="col-span-5 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <span>
          <p class="text-[#323232] dark:text-white text-lg font-semibold">
            Thefts Detected
          </p>
          <p class="text-sm font-medium text-[#8C8C8C]">
            Average Theft Detection
          </p>
        </span>
        <span class="flex gap-4 items-center">
          <span class="flex gap-1 items-center"
            ><span
              class="w-[10px] h-[10px] bg-gradient-to-r from-[#357DFF] to-[#053895] rounded-full"
            />Detected</span
          >
          <span class="flex gap-1 items-center"
            ><span
              class="w-[10px] h-[10px] bg-gradient-to-r from-[#FFB156] to-[#FF007A] rounded-full"
            />Prevented</span
          >
        </span>
      </span>
      <div class="h-full w-full">
        <canvas bind:this={barChartCanvas}></canvas>
      </div>
    </div>
    <!-- All Stores Section -->
    <div
      class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">
          All Stores
        </p>
        <AddStoreDialog>
          <Button variant="outline" class="flex items-center gap-1 text-xs"
            ><Plus size={14} />Add Store</Button
          >
        </AddStoreDialog>
      </span>
      <div class="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
        {#if theftandcamera.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          {#each theftandcamera as data, index}
            <DashboardStoreCard
              storeName={data.name}
              cameraCount={data.camera_count}
              managerName={data.manager}
              activeCount={parseInt(data.theft_prevented_count)}
              totalCount={parseInt(data.theft_detected_count)}
              bgColor={index % 2 === 0 ? "#F5F5F5" : "white"}
            />
          {/each}
        {/if}
      </div>
    </div>
    <!-- Store Busy Hours Section -->
    {#if $selectedStore.label !== "All Stores"}
      <div
        class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
      >
        <span class="flex items-center justify-between">
          <span>
            <p class="text-[#323232] dark:text-white text-lg font-semibold">
              Store Busy Hours
            </p>
            <p class="text-sm font-medium text-[#8C8C8C]">Average busy hours</p>
          </span>
        </span>
        <div class="h-full w-full">
          <!-- {#if $busynessStoresData.length === 0}
            <p class="text-center text-gray-500 mt-8">No data available</p>
          {:else} -->
          <canvas bind:this={chartCanvas}></canvas>
          <!-- {/if} -->
        </div>
      </div>
    {/if}
    <!-- Stores Overview Section -->
    <div
      class={`${$selectedStore.label === "All Stores" ? "col-span-8 row-span-3" : "col-span-5 row-span-3"} border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]`}
    >
      <span class="flex items-center justify-between font-semibold">
        <p class="text-[#323232] dark:text-white">Stores Overview</p>
        <!-- <Select.Root portal={null}>
          <Select.Trigger
            class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={$selectedStore?.label} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <div class="p-2">
              <Input
                type="text"
                placeholder="Search stores..."
                bind:value={filterText}
                class="mb-2"
              />
            </div>
            <Select.Group>
              {#if filteredFruits.length > 0}
                {#each filteredFruits as fruit}
                  <Select.Item
                    on:click={() => updateAllSelects(fruit)}
                    class="px-1"
                    value={fruit.value}
                    label={fruit.label}>{fruit.label}</Select.Item
                  >
                {/each}
              {:else}
                <Select.Item disabled>N/A</Select.Item>
              {/if}
            </Select.Group>
          </Select.Content>
        </Select.Root> -->
      </span>
      <div
        class="w-full h-full max-h-[300px] overflow-y-auto hide-scrollbar relative"
      >
        {#if storePeopleCount.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          <DashboardStoresOverviewtable aisleData={storePeopleCount} />
        {/if}
      </div>
    </div>
    <!-- {#if $selectedStore.label === "All Stores"} -->
    <div
      class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">
          Employee Efficiency
        </p>
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
        <!-- <Select.Root portal={null}>
          <Select.Trigger
            class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={$selectedStore?.label} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <div class="p-2">
              <Input
                type="text"
                placeholder="Search stores..."
                bind:value={filterText}
                class="mb-2"
              />
            </div>
            <Select.Group>
              {#if filteredFruits.length > 0}
                {#each filteredFruits as fruit}
                  <Select.Item
                     on:click={() => updateAllSelects(fruit)}
                    class="px-1"
                    value={fruit.value}
                    label={fruit.label}>{fruit.label}</Select.Item
                  >
                {/each}
              {:else}
                <Select.Item disabled>N/A</Select.Item>
              {/if}
            </Select.Group>
          </Select.Content>
        </Select.Root> -->
      </span>
      <span class="w-full h-full">
        {#if efficiency.length === 0 || efficiency.data.length === 0}
          <p class="text-center text-gray-500 mt-8">No data available</p>
        {:else}
          <DashboardEfficiencyDataTable
            {efficiency}
            {token}
            {selectedStore}
            {dateRange}
            {value}
          />
        {/if}
      </span>
    </div>
    <!-- Kitchen Safety Protocol Section -->
    <div
      class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[375px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">
          Kitchen Safety Protocol
        </p>
      </span>
      <div class="h-full w-full">
        {#if safetyDetails?.length === 0 || safetyDetails?.data?.length === 0}
          {#if $selectedStore.hasKitchen}
            <p class="text-center text-gray-500 mt-8">No data available</p>
          {:else}
            <p class="text-center text-gray-500 mt-8">
              Store does not have a kitchen
            </p>
          {/if}
        {:else}
          <DashboardSaftetyDataTable
            safetyData={safetyDetails}
            {token}
            {selectedStore}
            {dateRange}
            {value}
          />
        {/if}
      </div>
    </div>
    {#if $selectedStore.label !== "All Stores"}
      <div
        class="col-span-8 row-span-8 border flex flex-col rounded-t-xl dark:border-white/[.7] p-4"
      >
        <div class="flex w-full items-center justify-between pb-2">
          <p class="text-lg font-semibold">
            Heat Map for {$selectedStore.label}
          </p>
          <div class="flex flex-row-reverse items-start gap-4">
            <span
              class="flex items-center border-black h-[40px] border-opacity-[18%] border-[1px] rounded-md dark:border-white"
            >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "1hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("1hr");
                  heatMapValue = undefined;
                }}>1hr</button
              >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "3hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("3hr");
                  heatMapValue = undefined;
                }}>3hr</button
              >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "5hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("5hr");
                  heatMapValue = undefined;
                }}>5hr</button
              >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "7hr" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("7hr");
                  heatMapValue = undefined;
                }}>7hr</button
              >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "1" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("1");
                  heatMapValue = undefined;
                }}>1 Day</button
              >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "3" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("3");
                  heatMapValue = undefined;
                }}>3 Day</button
              >
              <button
                class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$heatMapDateRange === "7" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white dark:border-white"}`}
                on:click={() => {
                  heatMapDateRange.set("7");
                  heatMapValue = undefined;
                }}>7 Day</button
              >
              <Popover.Root openFocus bind:open={heatmapclose}>
                <Popover.Trigger asChild let:builder>
                  <Button
                    on:click={() => (heatMapValue = undefined)}
                    builders={[builder]}
                    class={`2xl:py-2 2xl:px-3 py-1 px-2  text-sm hover:bg-[#0BA5E9] hover:text-white ${$heatMapDateRange.toLowerCase() === "custom" ? "bg-[#0BA5E9] text-white" : "text-black dark:text-white bg-transparent dark:border-white"}`}
                  >
                    {heatMapCustomDateLabel}</Button
                  >
                </Popover.Trigger>
                <Popover.Content class="w-auto p-0 z-[600000000]" align="start">
                  <RangeCalendar
                    bind:value={heatMapValue}
                    bind:startValue
                    initialFocus
                    numberOfMonths={2}
                    placeholder={heatMapValue?.start}
                  />
                </Popover.Content>
              </Popover.Root>
            </span>
            <div class="flex flex-col items-end">
              <div class="w-[200px] h-6 flex">
                <div
                  class="w-1/3 h-full flex-shrink-0"
                  style="background: linear-gradient(to right, rgb(0, 0, 255), rgb(255, 255, 0))"
                ></div>
                <div
                  class="w-1/3 h-full flex-shrink-0"
                  style="background: linear-gradient(to right, rgb(255, 255, 0), rgb(255, 165, 0))"
                ></div>
                <div
                  class="w-1/3 h-full flex-shrink-0"
                  style="background: linear-gradient(to right, rgb(255, 165, 0), rgb(255, 0, 0))"
                ></div>
              </div>
              <div class="flex justify-between w-[200px] text-xs mt-1">
                <span>low</span>
                <span>medium</span>
                <span>high</span>
                <span>very high</span>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full h-full grid grid-cols-8 grid-rows-6">
          {#if storeFloorImg !== null && loadingFloor === false}
            <div
              class="col-span-8 row-span-6 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7] relative"
            >
              <img
                src={storeFloorImg}
                alt="storeFloorImg"
                class=" w-full h-full max-h-[400px] rounded-md"
              />
              <canvas
                id="heatmapCanvas"
                class="absolute top-0 left-0 w-full h-full opacity-70 pointer-events-none z-[20000000]"
              ></canvas>
            </div>
          {:else if loadingFloor === true}
            <div
              class="col-span-8 row-span-6 border rounded-md flex flex-col justify-center items-center rounded-t-xl dark:border-white/[.7]"
            >
              <Spinner />
            </div>
          {:else}
            <div
              class="col-span-8 row-span-6 border rounded-md flex flex-col justify-center items-center rounded-t-xl dark:border-white/[.7]"
            >
              <p class="text-lg font-semibold">
                Floor map not available for this store
              </p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>
