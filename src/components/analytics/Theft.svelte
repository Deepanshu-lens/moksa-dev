<script lang="ts">
  import {
    CalendarDays,
    ListFilter,
    Plus,
    TrendingUp,
    Upload,
  } from "lucide-svelte";
  import type { Theft } from "@/types";
  import { BarController, BarElement } from "chart.js";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import { Button } from "../ui/button";
  import type { DateRange } from "bits-ui";
  import { io } from "socket.io-client";
  import * as Select from "../ui/select";
  import DashboardStoreCard from "../cards/DashboardStoreCard.svelte";
  import { onDestroy, onMount } from "svelte";
  import TheftDataTable from "./table/TheftDataTable.svelte";
  import { writable } from "svelte/store";
  import { toast } from "svelte-sonner";
  import { type DateValue } from "@internationalized/date";
  import { RangeCalendar } from "@/components/ui/range-calendar";
  import * as Popover from "../ui/popover";
  import Spinner from "../ui/spinner/Spinner.svelte";
  export let theftandcamera;
  export let allStores;
  export let theftData;
  export let moksaUserId;
  export let token: string;
  export let user;
  export let allStoresData;

  let chartLoading = true;
  let dateRange = writable("7 Days");
  let selectedStore = writable({ value: -1, label: "All Stores" });
  let isInitialLoad = true;
  let isLoading = writable(false);

  const fruits = allStores.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  let barChart: Chart | null = null;
  let barChartCanvas: HTMLCanvasElement;
  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let theftChartCanvas: HTMLCanvasElement;
  let theftChart: Chart | null = null;

  let value: DateRange | undefined = undefined;
  let startValue: DateValue | undefined = undefined;
  let customDateLabel = "Custom";
  let close = false;
  let listtheft = writable([]);
  let theftTrend = writable([]);

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

  function createBarChart() {
    if (barChartCanvas && !barChart) {
      const ctx = barChartCanvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 400, 0, 0);
      gradient.addColorStop(0, "#FFB156");
      gradient.addColorStop(1, "#FF007A");

      const gradient2 = ctx.createLinearGradient(0, 400, 0, 0);
      gradient2.addColorStop(0, "#02A7FD");
      gradient2.addColorStop(1, "#141C64");

      if (ctx) {
        Chart.register(BarController, BarElement, CategoryScale, LinearScale);

        const data = theftData.data;
        const labels = data.map((item) => item.day_of_week.trim());
        const detectedData = data.map((item) => parseInt(item.theft_detected));
        const preventedData = data.map((item) =>
          parseInt(item.theft_prevented),
        );

        barChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            // datasets: [
            //   {
            //     label: "Theft Detected",
            //     data: detectedData,
            //     backgroundColor: "#FF3B30",
            //     borderRadius: 4,
            //   },
            //   {
            //     label: "Theft Prevented",
            //     data: preventedData,
            //     backgroundColor: "#00A86B",
            //     borderRadius: 4,
            //   },
            // ],
            datasets: [
              {
                label: "Theft Detected",
                data: detectedData,
                backgroundColor: gradient,
                borderColor: gradient,
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: "Theft Prevented",
                data: preventedData,
                backgroundColor: gradient2,
                borderColor: gradient2,
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            },
            plugins: {
              legend: {
                display: true,
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
      gradient.addColorStop(1, "#5BC4FF");
      gradient.addColorStop(0, "#FF5BEF");

      if (ctx) {
        Chart.register(
          LineController,
          LineElement,
          PointElement,
          LinearScale,
          CategoryScale,
        );

        const data = $theftTrend;

        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const theftData = labels.map((day) => {
          const entry = data.find((d) => d.day_of_week.startsWith(day));
          return entry ? parseInt(entry.theft_count) : 0;
        });

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Thefts",
                borderColor: gradient,
                backgroundColor: gradient,
                borderWidth: 2,
                data: theftData,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "white",
                pointBorderColor: "#AE8FF7",
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
                  text: "Theft Count",
                },
                grid: {
                  display: false,
                },
                beginAtZero: true,
                suggestedMax: 2,
                ticks: {
                  stepSize: 1,
                  callback: function (value) {
                    return value;
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
                    return `Thefts: ${context.parsed.y}`;
                  },
                },
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
        const allDays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Create a map of the data
        const dataMap = new Map(
          theftData.data.map((item) => [item.day_of_week.trim(), item]),
        );

        // Ensure all days are included in the labels array
        const labels = allDays.map((day) => day);
        const detectedData = labels.map((day) =>
          dataMap.get(day) ? -parseInt(dataMap.get(day).theft_detected) : 0,
        );
        const preventedData = labels.map((day) =>
          dataMap.get(day) ? parseInt(dataMap.get(day).theft_prevented) : 0,
        );

        const data = {
          labels: labels,
          datasets: [
            {
              label: "Detected",
              data: detectedData,
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
            {
              label: "Prevented",
              data: preventedData,
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
          ],
        };

        theftChart = new Chart(ctx, {
          type: "bar",
          data: data,
          options: {
            indexAxis: "y",
            scales: {
              x: {
                position: "top",
                stacked: false,
                beginAtZero: true,
                grid: {
                  display: false,
                },
                ticks: {
                  callback: function (value) {
                    return Math.abs(value);
                  },
                },
              },
              y: {
                stacked: true,
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
                      label += Math.abs(context.parsed.x);
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

  onMount(async () => {
    await Promise.all([gettheftList(-1), getTheftTrends(-1)]);
    setTimeout(() => {
      createBarChart();
      createTheftChart();
    }, 100);
    chartLoading = false;
  });

  $: console.log("theftData", chartLoading);

  async function gettheftList(storeId: number) {
    const today = new Date();
    let startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const theftList = await fetch(
      `https://dev.api.moksa.ai/theft/theftListBasedOnStoreId/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}/1/100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await theftList.json();
    if (data.status === 200) {
      // console.log(data.data)
      listtheft.set(data.data);
    } else {
      console.log("no theft data");
    }
  }

  async function getTheftTrends(storeId: number) {
    const theftList = await fetch("/api/theft/trends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeId }),
    });
    const data = await theftList.json();
    console.log(data);
    if (data.status === 200) {
      theftTrend.set(data.data);
      createChart();
    } else {
      console.log("no trend data");
    }
  }

  $: totalThefts = allStoresData.totaldetectedthefts;
  $: totalPreventions = allStoresData.totalpreventedthefts;
  $: totalIncidents = Number(totalThefts) + Number(totalPreventions);
  $: detectionPercentage =
    totalIncidents > 0
      ? (Number(totalThefts) / Number(totalIncidents)) * 100
      : 0;
  $: preventionPercentage =
    totalIncidents > 0 ? (totalPreventions / totalIncidents) * 100 : 0;

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const oneYearAgo = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let theftDataa = writable([]);
  let tableKey = 0;

  async function fetchDataStoreWise() {
    console.log("called");
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
      const [theftD, theftT, theftL, storeTotals] = await Promise.all([
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
          `https://dev.api.moksa.ai/theft/theftTrendsOfAllTime/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/theft/theftListBasedOnStoreId/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}/1/100`,
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
      ]);

      console.log(theftD, "theftD");
      console.log(theftT, "theftT");
      console.log(theftL, "theftL");
      theftDataa.set(theftD);
      theftTrend.set(theftT);
      listtheft.set(theftL.data);
      totalThefts = storeTotals.data.totaldetectedthefts;
      totalPreventions = storeTotals.data.totalpreventedthefts;
      updateBarChart(theftD);
      updateTheftChart(theftD);
      updateTrendChart(theftT.data);
      tableKey += 1;
    } catch (error) {
      console.error("Error fetching store-wise data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  function updateBarChart(theftD) {
    // console.log($dateRange);
    // console.log("first");
    if (barChart) {
      // console.log("first");
      // console.log(theftD);
      const labels = theftD?.data.map((item) =>
        $dateRange === "7 Days"
          ? item.day_of_week.trim()
          : $dateRange === "12 Months"
            ? item.month_name.trim()
            : item.date.trim(),
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

  function updateTheftChart(theftD) {
    if (theftChart) {
      const labels = theftD?.data.map((item) =>
        $dateRange === "7 Days"
          ? item?.day_of_week?.trim()
          : $dateRange === "12 Months"
            ? item?.month_name?.trim()
            : item?.date?.trim(),
      );
      const theftDetectedData = theftD?.data.map((item) =>
        parseInt(-item.theft_detected),
      );
      const theftPreventedData = theftD?.data.map((item) =>
        Number(item.theft_prevented),
      );

      theftChart.data.labels = labels;
      theftChart.data.datasets[0].data = theftDetectedData;
      theftChart.data.datasets[1].data = theftPreventedData;
      theftChart.update();
    }
  }

  function updateTrendChart(theftT) {
    if (chart) {
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const theftData = labels.map((day) => {
        const entry = theftT.find((d) => d.day_of_week.startsWith(day));
        return entry ? parseInt(entry.theft_count) : 0;
      });

      chart.data.datasets[0].data = theftData;
      chart.update();
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
    console.log("selectedstore", $selectedStore.value);
    try {
      // Call the three APIs
      const [theftD, theftT, theftL, storesTotal] = await Promise.all([
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
          `https://dev.api.moksa.ai/theft/theftTrendsOfAllTime/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/theft/theftListBasedOnStoreId/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}/1/100`,
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
      ]);

      console.log(storesTotal);
      console.log(theftD);
      console.log(theftT);
      console.log(theftL);

      theftDataa.set(theftD);
      theftTrend.set(theftT);
      listtheft.set(theftL.data);

      updateBarChart(theftD);
      updateTheftChart(theftD);
      updateTrendChart(theftT.data);
      console.log(storesTotal);
      totalThefts = storesTotal.data.totaldetectedthefts;
      totalPreventions = storesTotal.data.totalpreventedthefts;
      tableKey += 1;
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
      const [theftD, theftT, theftL, storesTotal] = await Promise.all([
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
        fetch(
          `https://dev.api.moksa.ai/theft/theftTrendsOfAllTime/${$selectedStore.value}/${start}/${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ).then((res) => res.json()),
        fetch(
          `https://dev.api.moksa.ai/theft/theftListBasedOnStoreId/${$selectedStore.value}/${start}/${end}/1/100`,
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
      ]);

      console.log(storesTotal);
      console.log(theftD);
      console.log(theftT);
      console.log(theftL);

      theftDataa.set(theftD);
      theftTrend.set(theftT);
      listtheft.set(theftL.data);

      totalThefts = storesTotal.data.totaldetectedthefts;
      totalPreventions = storesTotal.data.totalpreventedthefts;

      updateBarChart(theftD);
      updateTheftChart(theftD);
      updateTrendChart(theftT.data);
      tableKey += 1;
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      isLoading.set(false);
    }
  }

  function cleanValue(value: string | number): string {
    if (typeof value === "string" && value.includes(",")) {
      // Split by comma and take the first part
      return value.split(",")[0].trim();
    }
    return String(value);
  }

  function theftAndCameraConvertToCSV(arr: Theft[]): void {
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    // Extract the headers
    const headers = Object.keys(arr[0]).join(",");

    // Extract the data rows with value cleaning
    const rows = arr
      .map((obj) => {
        return Object.values(obj)
          .map((value) => cleanValue(value))
          .join(",");
      })
      .join("\n");

    // Combine headers and rows
    const csvContent = headers + "\n" + rows;

    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the CSV
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `theft&camera_${date}.csv`;
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the link after download
    document.body.removeChild(link);
  }

  function theftTrendConvertToCSV(arr: any[]): void {
    console.log(arr);
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    // Extract the headers
    const headers = ["Day of Week", "Theft Count"];

    // Extract the data rows
    const rows =
      $dateRange === "7 Days"
        ? arr.map((item) => [item.day_of_week.trim(), item.theft_count])
        : arr.data.map((item) => [item.day_of_week.trim(), item.theft_count]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the CSV
    const link = document.createElement("a");
    link.href = url;
    link.download = `theft_trend_${date}.csv`; // file name after download
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the link after download
    document.body.removeChild(link);
  }

  function listTheftConvertToCSV(arr) {
    if (!arr || arr.length === 0) {
      console.error("No data to convert to CSV");
      return;
    }
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Extract the headers
    const headers = Object.keys(arr[0]).join(",");

    // Extract the data rows with value cleaning
    const rows = arr
      .map((obj) => {
        return Object.values(obj)
          .map((value) => cleanValue(value))
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
    link.download = `theft_list_${date}.csv`; // file name after download
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the link after download
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function exportCSV() {
    let theftListData;
    const unsubscribe = listtheft.subscribe((value) => {
      theftListData = value.data || value;
    });
    unsubscribe();

    if (theftListData && theftListData.length > 0) {
      listTheftConvertToCSV(theftListData);
    } else {
      console.error("No theft list data to export");
    }
  }

  $: {
    if ($dateRange !== "custom") {
      fetchDataForDateRange();
    }
  }
  $: if ($dateRange === "custom" && (value?.start || value?.end)) {
    fetchCustomDateData();
  }

  // $: {
  //   if ($selectedStore.value !== -1) {
  //     fetchDataStoreWise();
  //   }
  // }

  // $: console.log($theftTrend)

  let sockets: { [key: number]: any } = {};
  let liveData = writable([]);

  function setupSocketForAllStores() {
    allStores
      .filter((store: any) => store.id !== -1)
      .forEach((store: any) => {
        setupSocket(store.id);
      });
  }

  function setupSocket(storeId: number) {
    const userID = moksaUserId;
    if (sockets[storeId]) {
      sockets[storeId].disconnect();
    }

    sockets[storeId] = io("https://dev.api.moksa.ai/", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });

    const socket = sockets[storeId];

    socket.on("error", (err) => {
      console.log(`error for store ${storeId}:`, err);
    });

    socket.on("connect", () => {
      console.log(`connected for store in theft ${storeId}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeId);
    });

    socket.on(`theft_store_${storeId}`, (data) => {
      console.log(`Received theft data for store ${storeId}:`, data);
      toast(`Received theft data for store ${storeId}:`, {
        description: `Store: ${storeId}, Theft Probability: ${data?.theftProbability}, Camera: ${data?.camera_id}`,
      });

      let dataArr = [];
      listtheft.update((currentData) => {
        const dataArray = Array.isArray(currentData) ? currentData : [];

        if (currentData && Array.isArray(currentData.data)) {
          return {
            ...currentData,
            data: [{ storeId, ...data, live: true }, ...currentData.data].slice(
              0,
              100,
            ),
          };
        }
        dataArr = dataArray;
        return [{ storeId, ...data, live: true }, ...dataArray].slice(0, 100);
      });
      return [storeId, ...dataArr].slice(0, 100);
    });

    socket.on("disconnect", () => {
      console.log(`disconnected for store ${storeId}`);
    });
  }

  // $: console.log('theft list',$listtheft)

  onMount(() => {
    setTimeout(() => {
      setupSocketForAllStores();
    }, 500);
  });

  // $: console.log($liveData)

  onDestroy(() => {
    Object.values(sockets).forEach((socket) => {
      console.log("disconnecting socket");
      socket.disconnect();
    });
  });

  // $: console.log(chartLoading)
  import { Input } from "../ui/input";
  import { createEventDispatcher } from "svelte";

  // ... existing code ...

  let filterText = "";
  $: filteredFruits = fruits.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  const dispatch = createEventDispatcher();

  // function handleSelect(fruit) {
  //   selectedStore.set(fruit);
  //   dispatch("select", fruit);
  // }

  let from;
  let to = new Date();

  $: if ($dateRange === "custom") {
    from = value?.start;
    to = value?.end;
  } else if ($dateRange === "7 Days") {
    from = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    to = new Date();
  } else if ($dateRange === "15 Days") {
    from = new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000);
    to = new Date();
  } else if ($dateRange === "30 Days") {
    from = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    to = new Date();
  } else if ($dateRange === "12 Months") {
    from = new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    to = new Date();
  }

  let tooltipVisible = false;
  let tooltipData = "";
  let tooltipX = 0;
  let tooltipY = 0;

  function showTooltip(event, data) {
    tooltipVisible = true;
    tooltipData = data;
    tooltipX = event.clientX + 10; // Offset for better visibility
    tooltipY = event.clientY + 10; // Offset for better visibility
  }

  function hideTooltip() {
    tooltipVisible = false;
  }
</script>

<section
  class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar"
>
  <div class="flex items-center justify-between">
    <!-- Date Range Picker -->
    <span
      class="flex items-center border-black h-[40px] border-opacity-[18%] border-[1px] rounded-md dark:border-white"
    >
      <button
        class={`2xl:py-2 2xl:px-3 h-full py-1 px-2 border-r border-black border-opacity-[18%]  text-sm ${$dateRange === "7 Days" ? "bg-[#0BA5E9] rounded-l-md text-white" : "text-black dark:text-white dark:border-white"}`}
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
            class={`2xl:py-2 2xl:px-3 py-1 px-2  text-sm hover:bg-[#0BA5E9] hover:text-white ${$dateRange === "custom" ? "bg-[#0BA5E9] rounded-r-md text-white" : "text-black dark:text-white bg-transparent dark:border-white"}`}
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

    <!-- Store selector -->
    <span class="flex items-center gap-3">
      <Select.Root portal={null}>
        <Select.Trigger
          class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value placeholder={$selectedStore.label} />
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
            <!-- <Select.Item
              on:click={() => {
                selectedStore.set({ value: -1, label: "All Stores" });
                fetchDataStoreWise();
              }}
              class="px-1"
              value="All Stores"
              label="All Stores">All Stores</Select.Item
            > -->
            {#if filteredFruits.length > 0}
              {#each filteredFruits as fruit}
                <Select.Item
                  on:click={() => {
                    selectedStore.set(fruit);
                    fetchDataStoreWise();
                  }}
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
      {#if user.role !== "Operators" && user.role !== "adminNonPaid" && user.role !== "storeEmployee"}
        <Button
          on:click={() => {
            exportCSV();
            theftTrendConvertToCSV($theftTrend);
            theftAndCameraConvertToCSV(theftandcamera);
          }}
          class="bg-[#3D81FC] text-white flex items-center gap-1 hover:bg-white hover:text-[#3D81FC]"
          ><Upload size={18} /> Export Reports</Button
        >
      {/if}
    </span>
  </div>

  <!-- main container -->
  <div class="grid grid-cols-8 grid-rows-12 gap-4 my-4 h-[1600px]">
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#02A7FD] to-[#141C64] p-2 flex items-center gap-3 max-h-[100px]"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full rotate-90"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 22 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.2503 9.71873L17.5622 10.441C17.604 10.5392 17.6935 10.6045 17.8085 10.627C17.9244 10.648 18.0352 10.6195 18.1188 10.546L18.9301 9.83196C19.0128 9.75921 19.046 9.66096 19.0222 9.55896C18.9983 9.45696 18.9216 9.38046 18.8108 9.34221L18.0583 9.09096L17.2503 9.71873ZM16.1159 12.712C16.5242 12.904 16.808 13.2805 16.8122 13.7163L16.8753 17.9769C16.8838 18.6122 16.306 19.1327 15.5858 19.1402C14.8639 19.1477 14.2724 18.6392 14.2639 18.0054L14.2111 14.4302L11.3747 13.1109L10.9997 12.9362C10.9827 13.0224 10.9648 13.1087 10.9477 13.1934L10.4023 15.9047H10.398C10.3349 16.2257 10.1167 16.5212 9.77157 16.6974L5.34139 18.9826C4.71922 19.3036 3.91896 19.1206 3.55418 18.5716C3.1894 18.0241 3.39736 17.3199 4.02122 16.9989L7.92711 14.9852L8.57485 11.7692C8.54843 11.6792 8.52882 11.5869 8.51774 11.4924C8.40439 10.5804 8.37371 9.78916 8.45042 9.07149C8.95241 7.96973 9.57883 6.83872 11.2451 6.57779C12.0326 6.50129 12.8158 6.68879 13.5053 7.01204C13.5121 7.01579 13.5206 7.01954 13.5274 7.02179C13.8223 7.15979 14.0967 7.32328 14.3481 7.49954C14.3916 7.53029 14.4351 7.56104 14.4768 7.59329L14.9413 8.69953L15.3257 8.40028L15.4322 8.31778L15.572 8.21053L15.8183 8.01853L16.5598 7.44253C16.5862 7.42303 16.6118 7.40428 16.6407 7.38703C16.7328 7.32929 16.8351 7.29103 16.9399 7.27003C17.0575 7.24528 17.1802 7.24303 17.2978 7.26253C17.4811 7.29328 17.6558 7.37578 17.7887 7.50852C18.1075 7.82502 18.0743 8.30953 17.7146 8.58927L16.4277 9.58752L15.1859 10.5513C15.099 10.63 14.9899 10.693 14.8629 10.7335C14.4112 10.8798 13.9092 10.6758 13.7439 10.2768L13.0459 8.61176C13.0152 8.66201 12.9871 8.71376 12.9632 8.76551C12.7297 9.274 12.7169 10.006 12.8515 11.0829C12.8558 11.1212 12.8601 11.1579 12.8626 11.1939L16.1159 12.712ZM11.2068 10.4289C11.1804 10.4177 11.1565 10.4057 11.1301 10.3959L11.2068 10.4289ZM9.14688 6.89038C9.62671 6.46813 10.2574 6.14563 11.1386 6.00913L11.1582 6.00688C12.0966 5.91314 13.0153 6.12764 13.814 6.50188C14.1932 6.68038 14.5495 6.89339 14.8657 7.12813C15.06 7.27213 15.2389 7.42212 15.4043 7.57512L16.1304 7.01037C16.1978 6.95637 16.2719 6.91062 16.3461 6.87012C16.0563 6.39611 15.7461 5.96037 15.4162 5.56437C14.8904 4.93286 14.3168 4.39737 13.7142 3.95188C12.1742 2.81712 10.4304 2.26212 8.73097 2.13763C7.52416 2.04913 6.33948 2.17588 5.26646 2.46612C4.19514 2.75412 3.2372 3.20336 2.47788 3.75988C1.12192 4.75737 0.412832 6.09767 0.879872 7.45895C1.12873 8.18494 2.04066 9.20795 3.147 9.9609C3.74019 10.3659 4.38621 10.6884 5.0041 10.8347C5.58193 10.9727 6.13677 10.9554 6.59445 10.7004C6.92172 10.5182 7.21149 10.2069 7.44075 9.73816C7.53876 9.53865 7.62655 9.34066 7.71603 9.13891C8.06717 8.3514 8.44205 7.51063 9.14688 6.89038ZM14.1284 3.50561C14.1114 3.39611 14.1003 3.28512 14.1003 3.17185C14.1003 1.91635 15.2568 0.900879 16.6809 0.900879C18.1077 0.900879 19.2616 1.91863 19.2616 3.17185C19.2616 4.42736 18.1051 5.44283 16.6809 5.44283C16.4696 5.44283 16.2667 5.41958 16.0699 5.37983C15.4767 4.63808 14.8221 4.01635 14.1284 3.50561Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        <p class="text-white text-xl font-bold">{totalThefts}</p>
        <p class="text font-semibold capitalize text-white">
          total thefts detected
        </p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#FFB156] to-[#FF007A] p-2 flex items-center gap-3 max-h-[100px]"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full rotate-90"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 22 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.2503 9.71873L17.5622 10.441C17.604 10.5392 17.6935 10.6045 17.8085 10.627C17.9244 10.648 18.0352 10.6195 18.1188 10.546L18.9301 9.83196C19.0128 9.75921 19.046 9.66096 19.0222 9.55896C18.9983 9.45696 18.9216 9.38046 18.8108 9.34221L18.0583 9.09096L17.2503 9.71873ZM16.1159 12.712C16.5242 12.904 16.808 13.2805 16.8122 13.7163L16.8753 17.9769C16.8838 18.6122 16.306 19.1327 15.5858 19.1402C14.8639 19.1477 14.2724 18.6392 14.2639 18.0054L14.2111 14.4302L11.3747 13.1109L10.9997 12.9362C10.9827 13.0224 10.9648 13.1087 10.9477 13.1934L10.4023 15.9047H10.398C10.3349 16.2257 10.1167 16.5212 9.77157 16.6974L5.34139 18.9826C4.71922 19.3036 3.91896 19.1206 3.55418 18.5716C3.1894 18.0241 3.39736 17.3199 4.02122 16.9989L7.92711 14.9852L8.57485 11.7692C8.54843 11.6792 8.52882 11.5869 8.51774 11.4924C8.40439 10.5804 8.37371 9.78916 8.45042 9.07149C8.95241 7.96973 9.57883 6.83872 11.2451 6.57779C12.0326 6.50129 12.8158 6.68879 13.5053 7.01204C13.5121 7.01579 13.5206 7.01954 13.5274 7.02179C13.8223 7.15979 14.0967 7.32328 14.3481 7.49954C14.3916 7.53029 14.4351 7.56104 14.4768 7.59329L14.9413 8.69953L15.3257 8.40028L15.4322 8.31778L15.572 8.21053L15.8183 8.01853L16.5598 7.44253C16.5862 7.42303 16.6118 7.40428 16.6407 7.38703C16.7328 7.32929 16.8351 7.29103 16.9399 7.27003C17.0575 7.24528 17.1802 7.24303 17.2978 7.26253C17.4811 7.29328 17.6558 7.37578 17.7887 7.50852C18.1075 7.82502 18.0743 8.30953 17.7146 8.58927L16.4277 9.58752L15.1859 10.5513C15.099 10.63 14.9899 10.693 14.8629 10.7335C14.4112 10.8798 13.9092 10.6758 13.7439 10.2768L13.0459 8.61176C13.0152 8.66201 12.9871 8.71376 12.9632 8.76551C12.7297 9.274 12.7169 10.006 12.8515 11.0829C12.8558 11.1212 12.8601 11.1579 12.8626 11.1939L16.1159 12.712ZM11.2068 10.4289C11.1804 10.4177 11.1565 10.4057 11.1301 10.3959L11.2068 10.4289ZM9.14688 6.89038C9.62671 6.46813 10.2574 6.14563 11.1386 6.00913L11.1582 6.00688C12.0966 5.91314 13.0153 6.12764 13.814 6.50188C14.1932 6.68038 14.5495 6.89339 14.8657 7.12813C15.06 7.27213 15.2389 7.42212 15.4043 7.57512L16.1304 7.01037C16.1978 6.95637 16.2719 6.91062 16.3461 6.87012C16.0563 6.39611 15.7461 5.96037 15.4162 5.56437C14.8904 4.93286 14.3168 4.39737 13.7142 3.95188C12.1742 2.81712 10.4304 2.26212 8.73097 2.13763C7.52416 2.04913 6.33948 2.17588 5.26646 2.46612C4.19514 2.75412 3.2372 3.20336 2.47788 3.75988C1.12192 4.75737 0.412832 6.09767 0.879872 7.45895C1.12873 8.18494 2.04066 9.20795 3.147 9.9609C3.74019 10.3659 4.38621 10.6884 5.0041 10.8347C5.58193 10.9727 6.13677 10.9554 6.59445 10.7004C6.92172 10.5182 7.21149 10.2069 7.44075 9.73816C7.53876 9.53865 7.62655 9.34066 7.71603 9.13891C8.06717 8.3514 8.44205 7.51063 9.14688 6.89038ZM14.1284 3.50561C14.1114 3.39611 14.1003 3.28512 14.1003 3.17185C14.1003 1.91635 15.2568 0.900879 16.6809 0.900879C18.1077 0.900879 19.2616 1.91863 19.2616 3.17185C19.2616 4.42736 18.1051 5.44283 16.6809 5.44283C16.4696 5.44283 16.2667 5.41958 16.0699 5.37983C15.4767 4.63808 14.8221 4.01635 14.1284 3.50561Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        <p class="text-white text-xl font-bold">{totalPreventions}</p>
        <p class="text capitalize font-semibold text-white">
          total thefts prevented
        </p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#FE7B7B] to-[#02A7FD] p-2 flex items-center gap-3 max-h-[100px] invisible"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full rotate-90"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 22 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.2503 9.71873L17.5622 10.441C17.604 10.5392 17.6935 10.6045 17.8085 10.627C17.9244 10.648 18.0352 10.6195 18.1188 10.546L18.9301 9.83196C19.0128 9.75921 19.046 9.66096 19.0222 9.55896C18.9983 9.45696 18.9216 9.38046 18.8108 9.34221L18.0583 9.09096L17.2503 9.71873ZM16.1159 12.712C16.5242 12.904 16.808 13.2805 16.8122 13.7163L16.8753 17.9769C16.8838 18.6122 16.306 19.1327 15.5858 19.1402C14.8639 19.1477 14.2724 18.6392 14.2639 18.0054L14.2111 14.4302L11.3747 13.1109L10.9997 12.9362C10.9827 13.0224 10.9648 13.1087 10.9477 13.1934L10.4023 15.9047H10.398C10.3349 16.2257 10.1167 16.5212 9.77157 16.6974L5.34139 18.9826C4.71922 19.3036 3.91896 19.1206 3.55418 18.5716C3.1894 18.0241 3.39736 17.3199 4.02122 16.9989L7.92711 14.9852L8.57485 11.7692C8.54843 11.6792 8.52882 11.5869 8.51774 11.4924C8.40439 10.5804 8.37371 9.78916 8.45042 9.07149C8.95241 7.96973 9.57883 6.83872 11.2451 6.57779C12.0326 6.50129 12.8158 6.68879 13.5053 7.01204C13.5121 7.01579 13.5206 7.01954 13.5274 7.02179C13.8223 7.15979 14.0967 7.32328 14.3481 7.49954C14.3916 7.53029 14.4351 7.56104 14.4768 7.59329L14.9413 8.69953L15.3257 8.40028L15.4322 8.31778L15.572 8.21053L15.8183 8.01853L16.5598 7.44253C16.5862 7.42303 16.6118 7.40428 16.6407 7.38703C16.7328 7.32929 16.8351 7.29103 16.9399 7.27003C17.0575 7.24528 17.1802 7.24303 17.2978 7.26253C17.4811 7.29328 17.6558 7.37578 17.7887 7.50852C18.1075 7.82502 18.0743 8.30953 17.7146 8.58927L16.4277 9.58752L15.1859 10.5513C15.099 10.63 14.9899 10.693 14.8629 10.7335C14.4112 10.8798 13.9092 10.6758 13.7439 10.2768L13.0459 8.61176C13.0152 8.66201 12.9871 8.71376 12.9632 8.76551C12.7297 9.274 12.7169 10.006 12.8515 11.0829C12.8558 11.1212 12.8601 11.1579 12.8626 11.1939L16.1159 12.712ZM11.2068 10.4289C11.1804 10.4177 11.1565 10.4057 11.1301 10.3959L11.2068 10.4289ZM9.14688 6.89038C9.62671 6.46813 10.2574 6.14563 11.1386 6.00913L11.1582 6.00688C12.0966 5.91314 13.0153 6.12764 13.814 6.50188C14.1932 6.68038 14.5495 6.89339 14.8657 7.12813C15.06 7.27213 15.2389 7.42212 15.4043 7.57512L16.1304 7.01037C16.1978 6.95637 16.2719 6.91062 16.3461 6.87012C16.0563 6.39611 15.7461 5.96037 15.4162 5.56437C14.8904 4.93286 14.3168 4.39737 13.7142 3.95188C12.1742 2.81712 10.4304 2.26212 8.73097 2.13763C7.52416 2.04913 6.33948 2.17588 5.26646 2.46612C4.19514 2.75412 3.2372 3.20336 2.47788 3.75988C1.12192 4.75737 0.412832 6.09767 0.879872 7.45895C1.12873 8.18494 2.04066 9.20795 3.147 9.9609C3.74019 10.3659 4.38621 10.6884 5.0041 10.8347C5.58193 10.9727 6.13677 10.9554 6.59445 10.7004C6.92172 10.5182 7.21149 10.2069 7.44075 9.73816C7.53876 9.53865 7.62655 9.34066 7.71603 9.13891C8.06717 8.3514 8.44205 7.51063 9.14688 6.89038ZM14.1284 3.50561C14.1114 3.39611 14.1003 3.28512 14.1003 3.17185C14.1003 1.91635 15.2568 0.900879 16.6809 0.900879C18.1077 0.900879 19.2616 1.91863 19.2616 3.17185C19.2616 4.42736 18.1051 5.44283 16.6809 5.44283C16.4696 5.44283 16.2667 5.41958 16.0699 5.37983C15.4767 4.63808 14.8221 4.01635 14.1284 3.50561Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        <p class="text-white text-xl font-bold">
          {isNaN(detectionPercentage) ? 0 : detectionPercentage.toFixed(2)}%
        </p>
        <p class="text capitalize font-semibold text-white">
          total thefts percentage
        </p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#C8C303] to-[#597802] p-2 flex items-center gap-3 max-h-[100px] invisible"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full rotate-90"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 22 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.2503 9.71873L17.5622 10.441C17.604 10.5392 17.6935 10.6045 17.8085 10.627C17.9244 10.648 18.0352 10.6195 18.1188 10.546L18.9301 9.83196C19.0128 9.75921 19.046 9.66096 19.0222 9.55896C18.9983 9.45696 18.9216 9.38046 18.8108 9.34221L18.0583 9.09096L17.2503 9.71873ZM16.1159 12.712C16.5242 12.904 16.808 13.2805 16.8122 13.7163L16.8753 17.9769C16.8838 18.6122 16.306 19.1327 15.5858 19.1402C14.8639 19.1477 14.2724 18.6392 14.2639 18.0054L14.2111 14.4302L11.3747 13.1109L10.9997 12.9362C10.9827 13.0224 10.9648 13.1087 10.9477 13.1934L10.4023 15.9047H10.398C10.3349 16.2257 10.1167 16.5212 9.77157 16.6974L5.34139 18.9826C4.71922 19.3036 3.91896 19.1206 3.55418 18.5716C3.1894 18.0241 3.39736 17.3199 4.02122 16.9989L7.92711 14.9852L8.57485 11.7692C8.54843 11.6792 8.52882 11.5869 8.51774 11.4924C8.40439 10.5804 8.37371 9.78916 8.45042 9.07149C8.95241 7.96973 9.57883 6.83872 11.2451 6.57779C12.0326 6.50129 12.8158 6.68879 13.5053 7.01204C13.5121 7.01579 13.5206 7.01954 13.5274 7.02179C13.8223 7.15979 14.0967 7.32328 14.3481 7.49954C14.3916 7.53029 14.4351 7.56104 14.4768 7.59329L14.9413 8.69953L15.3257 8.40028L15.4322 8.31778L15.572 8.21053L15.8183 8.01853L16.5598 7.44253C16.5862 7.42303 16.6118 7.40428 16.6407 7.38703C16.7328 7.32929 16.8351 7.29103 16.9399 7.27003C17.0575 7.24528 17.1802 7.24303 17.2978 7.26253C17.4811 7.29328 17.6558 7.37578 17.7887 7.50852C18.1075 7.82502 18.0743 8.30953 17.7146 8.58927L16.4277 9.58752L15.1859 10.5513C15.099 10.63 14.9899 10.693 14.8629 10.7335C14.4112 10.8798 13.9092 10.6758 13.7439 10.2768L13.0459 8.61176C13.0152 8.66201 12.9871 8.71376 12.9632 8.76551C12.7297 9.274 12.7169 10.006 12.8515 11.0829C12.8558 11.1212 12.8601 11.1579 12.8626 11.1939L16.1159 12.712ZM11.2068 10.4289C11.1804 10.4177 11.1565 10.4057 11.1301 10.3959L11.2068 10.4289ZM9.14688 6.89038C9.62671 6.46813 10.2574 6.14563 11.1386 6.00913L11.1582 6.00688C12.0966 5.91314 13.0153 6.12764 13.814 6.50188C14.1932 6.68038 14.5495 6.89339 14.8657 7.12813C15.06 7.27213 15.2389 7.42212 15.4043 7.57512L16.1304 7.01037C16.1978 6.95637 16.2719 6.91062 16.3461 6.87012C16.0563 6.39611 15.7461 5.96037 15.4162 5.56437C14.8904 4.93286 14.3168 4.39737 13.7142 3.95188C12.1742 2.81712 10.4304 2.26212 8.73097 2.13763C7.52416 2.04913 6.33948 2.17588 5.26646 2.46612C4.19514 2.75412 3.2372 3.20336 2.47788 3.75988C1.12192 4.75737 0.412832 6.09767 0.879872 7.45895C1.12873 8.18494 2.04066 9.20795 3.147 9.9609C3.74019 10.3659 4.38621 10.6884 5.0041 10.8347C5.58193 10.9727 6.13677 10.9554 6.59445 10.7004C6.92172 10.5182 7.21149 10.2069 7.44075 9.73816C7.53876 9.53865 7.62655 9.34066 7.71603 9.13891C8.06717 8.3514 8.44205 7.51063 9.14688 6.89038ZM14.1284 3.50561C14.1114 3.39611 14.1003 3.28512 14.1003 3.17185C14.1003 1.91635 15.2568 0.900879 16.6809 0.900879C18.1077 0.900879 19.2616 1.91863 19.2616 3.17185C19.2616 4.42736 18.1051 5.44283 16.6809 5.44283C16.4696 5.44283 16.2667 5.41958 16.0699 5.37983C15.4767 4.63808 14.8221 4.01635 14.1284 3.50561Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        <p class="text-white text-xl font-bold">
          {isNaN(preventionPercentage) ? 0 : preventionPercentage.toFixed(2)}%
        </p>
        <p class="text capitalize font-semibold text-white">
          total prevention percentage
        </p>
      </span>
    </div>
    <div
      class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[350px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">
          All Stores
        </p>
      </span>
      <div class="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
        {#each theftandcamera as data, index}
          <DashboardStoreCard
            storeName={data.name}
            cameraCount={data.camera_count}
            managerName={data.manager}
            activeCount={parseInt(data.theft_prevented_count)}
            totalCount={parseInt(data.theft_prevented_count)}
            bgColor={index % 2 === 0 ? "#F5F5F5" : "white"}
          />
        {/each}
      </div>
    </div>
    <div
      class="col-span-5 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[350px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p
          class="text-[#323232] dark:text-white text-lg flex items-center gap-2 font-semibold"
        >
          Theft Detected
          <!-- <span
            class="text-xs text-white bg-pink-500 rounded-md p-1">Live</span
          > -->
        </p>
        <!-- <Select.Root portal={null}>
          <Select.Trigger
            class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={$selectedStore.label} />
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
              {#if user.role !== "superAdmin"}
                <Select.Item
                  on:click={() => {
                    selectedStore.set({ value: -1, label: "All Stores" });
                    fetchDataStoreWise();
                  }}
                  class="px-1"
                  value="All Stores"
                  label="All Stores">All Stores</Select.Item
                >
              {/if}
        
              {#if filteredFruits.length > 0}
                {#each filteredFruits as fruit}
                  <Select.Item
                    on:click={() => handleSelect(fruit)}
                    class="px-1"
                    value={fruit.value}
                    label={fruit.label}>{fruit.label}</Select.Item
                  >
                {/each}
              {:else}
                <Select.Item disabled>No matching stores</Select.Item>
              {/if}
            </Select.Group>
          </Select.Content>
        </Select.Root> -->
      </span>
      <div class="flex w-full h-full">
        <span class="flex flex-col w-1/4 gap-2 mt-4">
          <p class="text-xs text-[#475569] font-semibold">
            Total Thefts Detected:
          </p>
          <p class="text-xl font-semibold text-[#1E293B">{totalThefts}+</p>
          <p class="text-xs text-[#475569]">
            from {$dateRange === "custom" ? from : from.toDateString()} to {$dateRange ===
            "custom"
              ? to
              : to?.toDateString()}
          </p>
          <div class="circle-progress">
            <svg viewBox="0 0 36 36">
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <path
                d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#FF007A"
                stroke-width="4"
                stroke-linecap="round"
                on:mouseenter={(event) =>
                  showTooltip(event, "Detected: " + totalThefts)}
                on:mouseleave={hideTooltip}
                on:mousemove={(event) => {
                  tooltipX = event.clientX + 10;
                  tooltipY = event.clientY + 10;
                }}
              />
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <path
                d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#02A7FD"
                stroke-width="4"
                stroke-dasharray="{detectionPercentage}, 100"
                on:mouseenter={(event) =>
                  showTooltip(event, "Prevented: " + totalPreventions)}
                on:mouseleave={hideTooltip}
                on:mousemove={(event) => {
                  tooltipX = event.clientX + 10;
                  tooltipY = event.clientY + 10;
                }}
              />
            </svg>
            <span
              class="progress-text size-10 rounded-full text-[#5B93FF] grid place-items-center bg-[#5B93FF] bg-opacity-15"
              ><TrendingUp size={16} /></span
            >
          </div>
          <span class="flex items-center justify-center gap-2 mt-1">
            <p
              class="flex gap-2 items-center text-xs text-[#030229] dark:text-white"
            >
              <span
                class="w-2 h-2 rounded-full bg-gradient-to-r bg-[#02A7FD]"
              /> Detected
            </p>
            <p
              class="flex gap-2 items-center text-xs text-[#030229] dark:text-white"
            >
              <span class="w-2 h-2 rounded-full bg-[#FF007A]" /> Prevented
            </p>
          </span>
        </span>
        <span class="flex w-3/4">
          <canvas bind:this={barChartCanvas}></canvas>
        </span>
      </div>
    </div>
    <div
      class="col-span-8 row-span-4 border rounded-md p-4 flex flex-col gap-2 dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white font-medium text-lg">
          Theft History
        </p>
        <!-- <Button on:click={addMockData}>Add Mock Data</Button> -->
      </span>
      <span class="w-full h-full">
        {#if chartLoading}
          <div class="flex items-center justify-center h-full w-full">
            <Spinner />
          </div>
        {:else if $listtheft?.column?.length > 0}
          {#key tableKey}
            <TheftDataTable
              {token}
              theftData={listtheft}
              column={$listtheft?.column}
              {dateRange}
              {selectedStore}
            />
          {/key}
        {:else}
          <p class="text-[#323232] dark:text-white text-lg font-semibold">
            No data found
          </p>
        {/if}
      </span>
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md p-4 gap-4 h-[450px] flex flex-col dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">
          Trend for Theft
        </p>
      </span>
      <div class="h-full w-full">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </div>
    <div
      class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[450px] dark:border-white/[.7]"
    >
      <span class="flex items-center justify-between">
        <p
          class="text-[#323232] dark:text-white text-lg flex items-center gap-2 font-semibold"
        >
          Suspicious Activity
        </p>
        <span class="flex items-center gap-2">
          <p class="flex items-center gap-2 text-xs">
            <span
              class="size-2 rounded-full bg-gradient-to-r from-[#357DFF] to-[#053895] flex-shrink-0"
            />Detected
          </p>
          <p class="flex items-center gap-2 text-xs">
            <span
              class="size-2 rounded-full bg-gradient-to-r from-[#FFB156] to-[#FF007A] flex-shrink-0"
            />Prevented
          </p>
        </span>
      </span>
      <div class="h-full w-full">
        <canvas bind:this={theftChartCanvas}></canvas>
      </div>
    </div>
  </div>
</section>

{#if tooltipVisible}
  <div
    class="tooltip"
    style="position: absolute; left: {tooltipX}px; top: {tooltipY}px; background: white; border: 1px solid #ccc; padding: 5px; border-radius: 4px; pointer-events: none;"
  >
    {tooltipData}
  </div>
{/if}

<style>
  .circle-progress {
    margin: 0 auto;
    margin-top: 4px;
    position: relative;
    width: 100px;
    height: 100px;
  }

  svg {
    transform: rotate(-90deg);
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.8rem;
    font-weight: bold;
  }

  .tooltip {
    /* Add any additional styling for the tooltip here */
    z-index: 1000; /* Ensure the tooltip is above other elements */
  }
</style>
