<script lang="ts">
  import { CalendarDays, ListFilter, Plus, TrendingUp, Upload } from "lucide-svelte";
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
  let chartLoading = true;
  export let theftandcamera;
  export let allStores;
  export let theftData;


  const fruits = allStores.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  import * as Select from "../ui/select";
  import DashboardStoreCard from "../cards/DashboardStoreCard.svelte";
  import { onMount } from "svelte";
  import TheftDataTable from "./table/TheftDataTable.svelte";
    import { writable } from "svelte/store";

  let barChart: Chart | null = null;
  let barChartCanvas: HTMLCanvasElement;
  let chartCanvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let theftChartCanvas: HTMLCanvasElement;
  let theftChart: Chart | null = null;



  function createBarChart() {
  if (barChartCanvas && !barChart) {
    const ctx = barChartCanvas.getContext("2d");

    if (ctx) {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale);

      const data = theftData.data

      const labels = data.map(item => item.day_of_week.trim());
      const detectedData = data.map(item => parseInt(item.theft_detected));
      const preventedData = data.map(item => parseInt(item.theft_prevented));

      barChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Theft Detected",
              data: detectedData,
              backgroundColor: "#4A7DFF",
              borderRadius: 4,
            },
            {
              label: "Theft Prevented",
              data: preventedData,
              backgroundColor: "#FF8F6B",
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

      const data = $theftTrend

      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const theftData = labels.map(day => {
        const entry = data.find(d => d.day_of_week.startsWith(day));
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
              pointBackgroundColor: 'white',
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
    const ctx = theftChartCanvas.getContext('2d');
    if (ctx) {
      // Sort the data by day of week
      const sortedData = theftData.data.sort((a, b) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(a.day_of_week.trim()) - days.indexOf(b.day_of_week.trim());
      });

      const data = {
        labels: sortedData.map(item => item.day_of_week.trim()),
        datasets: [
          {
            label: 'Detected',
            data: sortedData.map(item => parseInt(-item.theft_detected)),
            backgroundColor: (context) => {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) {
                return null;
              }
              const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
               gradient.addColorStop(0, 'rgba(4, 158, 243, 1)');
              gradient.addColorStop(1, 'rgba(21, 29, 100, 1)');
              return gradient;
            },
            borderColor: 'rgba(21, 29, 100, 1)',
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
          {
            label: 'Prevented',
            data: sortedData.map(item => parseInt(item.theft_prevented)),
            backgroundColor: (context) => {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) {
                return null;
              }
              const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);

              gradient.addColorStop(0, 'rgba(255, 169, 88, 1)');
              gradient.addColorStop(1, 'rgba(255, 1, 120, 1)');
              return gradient;
            },
            borderColor: 'rgba(255, 1, 120, 1)',
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
        ],
      };

      theftChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
             
              grid: {
                display: false,
              },
              ticks: {
                stepSize: 1,
                display: true,
              },
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                drawBorder: false,
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
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

  onMount(async() => {
    chartLoading = false;
    await Promise.all([
      gettheftList(-1),
      getTheftTrends(-1)
    ]);
    setTimeout(() => {
      createBarChart();
      // createChart();
      createTheftChart()
    }, 100);

  });


  let listtheft = writable([])

  async function gettheftList(storeId:number){
    const theftList = await fetch('/api/theft/listByStoreId',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({storeId})
    })
    const data = await theftList.json()
    if(data.status === 200){
      // console.log(data.data)
      listtheft.set(data.data)
    } else {
      console.log('no theft data')
    }
  }

  let theftTrend = writable([])
  async function getTheftTrends(storeId:number){
    const theftList = await fetch('/api/theft/trends',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({storeId})
    })
    const data = await theftList.json()
    console.log(data)
    if(data.status === 200){
      theftTrend.set(data.data)
      createChart()
    } else {
      console.log('no trend data')
    }
  }


  const totalThefts = theftandcamera.reduce((sum: number, store: any) => sum + parseInt(store.theft_detected_count), 0);
  const totalPreventions = theftandcamera.reduce((sum: number, store: any) => sum + parseInt(store.theft_prevented_count), 0);
  const totalIncidents = totalThefts + totalPreventions;
  const detectionPercentage = (totalThefts / totalIncidents) * 100;
  const preventionPercentage = (totalPreventions / totalIncidents) * 100;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });



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
      <button class="2xl:py-2 2xl:px-3 py-1 px-2 text-black text-sm dark:text-white "
        >Custom</button
      >
    </span>
    <span class="flex items-center gap-3">
      <Select.Root portal={null}>
        <Select.Trigger
          class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
        >
          <Select.Value placeholder="All Stores" />
        </Select.Trigger>
               <Select.Content class="max-h-[200px] overflow-y-auto">
          <Select.Group>
            {#each fruits as fruit}
              <Select.Item class="px-1" value={fruit.value} label={fruit.label}
                >{fruit.label}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
        <Select.Input name="favoriteFruit" />
      </Select.Root>
      <Button  class="bg-[#3D81FC] text-white flex items-center gap-1 hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      >
    </span>
  </div>
  <div class="grid grid-cols-8 grid-rows-12 gap-4 my-4 h-[1600px]">
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#00FEA3] to-[#007077] p-2 flex items-center gap-3"
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
        <p class="text font-semibold capitalize text-white">total thefts detected</p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#02A7FD] to-[#141C64] p-2 flex items-center gap-3"
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
        <p class="text capitalize font-semibold text-white">total thefts prevented</p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#FFB156] to-[#FF007A] p-2 flex items-center gap-3"
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
       <p class="text-white text-xl font-bold">{isNaN(detectionPercentage) ? 0 : detectionPercentage.toFixed(2)}%</p>
         <p class="text capitalize font-semibold text-white">total thefts percentage</p>
      </span>
    </div>
    <div
      class="col-span-2 border rounded-md bg-gradient-to-r from-[#C8C303] to-[#597802] p-2 flex items-center gap-3"
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
        <p class="text-white text-xl font-bold">{isNaN(preventionPercentage) ? 0 : preventionPercentage.toFixed(2)}%</p>
        <p class="text capitalize font-semibold text-white">total prevention percentage</p>
      </span>
    </div>
    <div class="col-span-3 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[350px] dark:border-white/[.7]">
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">All Stores</p>
        <span class="flex items-center gap-3">
          <Button
            variant="ghost"
            class="flex items-center gap-1 text-xs scale-90"
          >
            <ListFilter size={16} />
            Filters
          </Button>
        </span>
      </span>
      <div class="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
    {#each theftandcamera as data, index}
          <DashboardStoreCard
            storeName={data.name}
            cameraCount={data.camera_count}
            managerName={data.manager}
            activeCount={parseInt(data.theft_detected_count)}
            totalCount={parseInt(data.theft_prevented_count) + parseInt(data.theft_detected_count)}
            bgColor={index % 2 === 0 ? "#F5F5F5" : "white"}
          />
        {/each}
      </div>
    </div>
    <div class="col-span-5 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[350px] dark:border-white/[.7]">
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg flex items-center gap-2 font-semibold">
          Theft Detected
           <!-- <span
            class="text-xs text-white bg-pink-500 rounded-md p-1">Live</span
          > -->
        </p>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder="All Stores" />
          </Select.Trigger>
               <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              {#each fruits as fruit}
                <Select.Item
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root>
      </span>
      <div class="flex w-full h-full">
        <span class="flex flex-col w-1/4 gap-2 mt-4">
          <p class="text-xs text-[#475569] font-semibold">
            Total Thefts Detected:
          </p>
          <p class="text-xl font-semibold text-[#1E293B">{totalThefts}+</p>
          <p class="text-xs text-[#475569]">from {oneYearAgo} to {today}</p>
          <div class="circle-progress">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#FF8F6B"
                stroke-width="4"
                stroke-linecap="round"
              />
              <path
                d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#5B93FF"
                stroke-width="4"
                stroke-dasharray="60, 100"
              />
            </svg>
            <span
              class="progress-text size-10 rounded-full text-[#5B93FF] grid place-items-center bg-[#5B93FF] bg-opacity-15"
              ><TrendingUp size={16} /></span
            >
          </div>
          <span class="flex items-center justify-center gap-2 mt-1">
            <p class="flex gap-2 items-center text-xs text-[#030229] dark:text-white">
              <span class="w-2 h-2 rounded-full bg-[#5B93FF]" /> Detected
            </p>
            <p class="flex gap-2 items-center text-xs text-[#030229] dark:text-white">
              <span class="w-2 h-2 rounded-full bg-[#FF8F6B] " /> Prevented
            </p>
          </span>
        </span>
        <span class="flex w-3/4">
          <canvas bind:this={barChartCanvas}></canvas>
        </span>
      </div>
    </div>
    <div class="col-span-8 row-span-4 border rounded-md p-4 flex flex-col gap-2 dark:border-white/[.7]">
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white font-medium text-lg">Theft History</p>
 <Select.Root portal={null}>
            <Select.Trigger
              class="w-[250px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
            >
              <Select.Value placeholder={'All Stores'} />
            </Select.Trigger>
               <Select.Content class="max-h-[200px] overflow-y-auto">
              <Select.Group>
                {#each fruits as fruit}
                  <Select.Item on:click={async() => {
                    console.log(fruit)
                  }}
                    class="px-1"
                    value={fruit.value}
                    label={fruit.label}>{fruit.label}</Select.Item
                  >
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
      </span>
      <span class="w-full h-full">
        {#if $listtheft?.data?.length > 0}
          <TheftDataTable theftData={listtheft}/>
        {:else}
          <p class="text-[#323232] dark:text-white text-lg font-semibold">No data found</p>
        {/if}
      </span>
    </div>
    <div class="col-span-4 row-span-3 border rounded-md p-4 gap-4 h-[350px] flex flex-col dark:border-white/[.7]">
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg font-semibold">Trend for Theft</p>
        <span class="flex items-center gap-3">
          <!-- <Button variant="outline" class="flex items-center gap-1 text-xs">
            <CalendarDays size={16} />
January, 2024
          </Button> -->
          <Button variant="outline" class="flex items-center gap-1 text-xs">
            <ListFilter size={16} />
            Filters
          </Button>
        </span>
      </span>
      <div class="h-full w-full">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </div>
    <div class="col-span-4 row-span-3 border rounded-md p-4 flex flex-col gap-4 h-[350px] dark:border-white/[.7]">
      <span class="flex items-center justify-between">
        <p class="text-[#323232] dark:text-white text-lg flex items-center gap-2 font-semibold">
          Suspicious Activity
        </p>
       <span class='flex items-center gap-2'>
         <p class='flex items-center gap-2 text-xs'><span class='size-2 rounded-full bg-[#5B93FF] flex-shrink-0'/>Detected</p>
         <p class='flex items-center gap-2 text-xs'><span class='size-2 rounded-full bg-[#FF8F6B] flex-shrink-0'/>Prevented</p>
       </span>
      </span>
      <div class="h-full w-full">
        <canvas bind:this={theftChartCanvas}></canvas>
      </div>
    </div>
  </div>
</section>

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
</style>
