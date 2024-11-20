<script lang="ts">
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import { selectedNode } from "@/stores";
  export let NvrData;
  export let uniqueCams;
  let nvrDataset;
  // Reactive statement to update nvrDataset whenever NvrData changes


  // $: console.log(NvrData)
  $: if (NvrData && $selectedNode) {
     NvrData = NvrData.map((nvr: any) => {
      // console.log(nvr.ip)
      const matchingCams: any = uniqueCams.filter((cam: any) => {
        // console.log(cam.url)
        return cam.url.includes(nvr.ip);
      });
      return { ...nvr, cams: matchingCams }
     });
// console.log('nvrdata after cams add',NvrData)
    nvrDataset = {
      labels: NvrData.filter((nvr: any) => nvr.expand?.ip_address?.country === 'India')
        .map((nvr: any) => nvr.expand?.ip_address?.location)
        .filter((location: any) => location !== undefined),
      dataSet: [
        {
          label: "active cams",
          data: NvrData.filter((nvr: any) => nvr.expand?.ip_address?.country === 'India' && nvr.expand?.ip_address?.location !== undefined)
            .map((nvr: any) => nvr.cams ? nvr.cams.filter((cam: any) => cam.status).length : 0),
          backgroundColor: "rgba(153, 162, 251, 1)",
          stack: 'Stack 0',
          barThickness: 30,
        },
        {
          label: "inactive cams",
          data: NvrData.filter((nvr: any) => nvr.expand?.ip_address?.country === 'India' && nvr.expand?.ip_address?.location !== undefined)
            .map((nvr: any) => nvr.cams ? nvr.cams.filter((cam: any) => !cam.status).length : 0),
          backgroundColor: "rgba(219, 222, 251, 1)",
          stack: 'Stack 0',
          barThickness: 30,
        },
      ],
    };
  }

  Chart.register(...registerables);

  let canvas;
  let chart;

  const data = {
    labels: nvrDataset?.labels,
    datasets: nvrDataset?.dataSet
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
        text: "Stacked Bar Chart",
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Locations',
          color: '#111',
          font: {
            size: 14,
            weight: 500,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Number of Cameras ->',
          color: '#111',
          font: {
            size: 14,
            weight: 500,
          },
        },
        ticks: {
          stepSize: 1,
          precision: 0,
        }
      },
    },
    elements: {
      bar: {
        borderRadius: 10,
        borderWidth: 1,
      },
    },
  };

  onMount(() => {
    const ctx = canvas.getContext("2d");
    chart = new Chart(ctx, {
      type: "bar",
      data,
      options,
    });

    return () => {
      chart.destroy();
    };
  });

  // Update the chart whenever nvrDataset changes
  $: if (chart && nvrDataset) {
    chart.data.labels = nvrDataset.labels;
    chart.data.datasets = nvrDataset.dataSet;
    chart.update();
  }
</script>

<div>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  div {
    width: 100%;
    height: 400px;
  }
</style>